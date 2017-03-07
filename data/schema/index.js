import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType,
} from 'graphql';
import { resolver, attributeFields, relay, defaultArgs } from 'graphql-sequelize';
import { globalIdField, mutationWithClientMutationId } from 'graphql-relay';
import { generateToken } from '../../src/auth';
import User from '../../db/model/user';
import Event from '../../db/model/event';
import Lecture from '../../db/model/lecture';
import Speaker from '../../db/model/speaker';
import sequelize from '../../db/sequelize';

const {
  sequelizeNodeInterface,
  sequelizeConnection,
} = relay;

const {
  nodeInterface,
  nodeField,
  nodeTypeMapper,
} = sequelizeNodeInterface(sequelize);


const getConnectionFieldsForModel = (Model) => {
  return {
    total: {
      type: GraphQLInt,
      resolve: () => {
        return Model.count();
      },
    },
  };
};


const ensureLoggedIn = () => (fn) => (source, args, context, ast) => {
  if (!context.user) {
    return null;
    // throw new Error('Not authenticated');
  }

  return fn(source, args, context, ast);
};

const ensureRole = (roles) => (fn) => (source, args, context, ast) => {
  if (!context.user) {
    return null;
    // throw new Error('Not authenticated');
  }

  let rolesArray;
  if (!Array.isArray(roles)) {
    rolesArray = [roles];
  } else {
    rolesArray = roles;
  }

  if (!rolesArray.some(role => role === context.user.role)) {
    return null;
    // throw new Error('Not authorized');
  }
  return fn(source, args, context, ast);
};

const getOrderByForModel = (Model, name) =>
  new GraphQLEnumType({
    name,
    values: Object.keys(Model.rawAttributes).reduce((prev, current) => {
      const retObj = { ...prev };
      retObj[`${current}_asc`] = {
        value: [current, 'ASC'],
      };
      retObj[`${current}_desc`] = {
        value: [current, 'DESC'],
      };
      return retObj;
    }, {}),
  });

export default () => {
  const lectureFields = attributeFields(Lecture);
  const speakerFields = attributeFields(Speaker);
  const userFields = attributeFields(User);
  const eventFields = attributeFields(Event);

  const speakerType = new GraphQLObjectType({
    name: 'Speaker',
    description: 'A speaker',
    fields: () => ({
      ...speakerFields,
      id: globalIdField(Speaker.name),
      event: {
        type: eventType,
        resolve: resolver(Speaker.Event),
      },
      assistant: {
        type: speakerType,
        resolve: resolver(Speaker.Assistant),
      },
      lectures: {
        type: new GraphQLList(lectureType),
        resolve: resolver(Speaker.Lectures),
      },
    }),
    interfaces: [nodeInterface],
  });

  const lectureType = new GraphQLObjectType({
    name: 'Lecture',
    description: 'A lecture',
    fields: () => ({
      ...lectureFields,
      id: globalIdField(Lecture.name),
      event: {
        type: eventType,
        resolve: resolver(Lecture.Event),
      },
      speakers: {
        type: new GraphQLList(speakerType),
        resolve: (source) => source.getSpeakers(),
      },
    }),
    interfaces: [nodeInterface],
  });

  const eventType = new GraphQLObjectType({
    name: 'Event',
    description: 'An event',
    fields: () => ({
      ...eventFields,
      id: globalIdField(Event.name),
      users: {
        type: eventUsersConnection.connectionType,
        args: {
          ...eventUsersConnection.connectionArgs,
          ...defaultArgs(User),
        },
        resolve: eventUsersConnection.resolve,
      },
      lectures: {
        type: new GraphQLList(lectureType),
        resolve: resolver(Event.Lectures),
      },
      speakers: {
        type: new GraphQLList(speakerType),
        resolve: resolver(Event.Speakers),
      },
    }),
    interfaces: [nodeInterface],
  });


  const userType = new GraphQLObjectType({
    name: 'User',
    description: 'A user',
    fields: () => ({
      ...userFields,
      _id: {
        type: GraphQLInt,
        resolve: user => user.id,
      },
      // lastName: {
      //   type: GraphQLString,
      //   resolve: ensureRole(['admin', 'speaker'])((user, args, context) => {
      //     if (context.user.id === user.id) {
      //       return user.lastName;
      //     }
      //     return null;
      //   }),
      // },
      id: globalIdField(User.name),
      event: {
        type: eventType,
        resolve: resolver(User.Event),
      },
    }),
    interfaces: [nodeInterface],
  });


  nodeTypeMapper.mapTypes({
    [Event.name]: eventType,
    [Lecture.name]: lectureType,
    [Speaker.name]: speakerType,
    [User.name]: userType,
  });

  const eventUsersConnection = sequelizeConnection({
    name: 'eventUsersConnection',
    nodeType: userType,
    target: Event.Users,
    where: (key, value) => value,
    orderBy: getOrderByForModel(User, 'eventUsersConnectionOrderBy'),
  });

  const allEventsConnection = sequelizeConnection({
    name: 'allEvents',
    nodeType: eventType,
    target: Event,
    orderBy: getOrderByForModel(Event, 'allEventsOrderBy'),
    where: (key, value) => value,
    connectionFields: getConnectionFieldsForModel(Event),
  });
  const allLecturesConnection = sequelizeConnection({
    name: 'allLectures',
    nodeType: lectureType,
    target: Lecture,
    orderBy: getOrderByForModel(Lecture, 'allLecturesOrderBy'),
    where: (key, value) => value,
    connectionFields: getConnectionFieldsForModel(Lecture),
  });
  const allUsersConnection = sequelizeConnection({
    name: 'allUsers',
    nodeType: userType,
    target: User,
    orderBy: getOrderByForModel(User, 'allUsersOrderBy'),
    where: (key, value) => value,
    connectionFields: getConnectionFieldsForModel(User),
  });
  const allSpeakersConnection = sequelizeConnection({
    name: 'allSpeakers',
    nodeType: speakerType,
    target: Speaker,
    orderBy: getOrderByForModel(Speaker, 'allSpeakersOrderBy'),
    where: (key, value) => value,
    connectionFields: getConnectionFieldsForModel(Speaker),
  });


  //  Mutations

  const LoginWithEmail = mutationWithClientMutationId({
    name: 'LoginWithEmail',
    inputFields: () => ({
      email: {
        type: new GraphQLNonNull(GraphQLString),
      },
      password: {
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
    mutateAndGetPayload: async ({ email, password }) => {
      const user = await User.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (!user) {
        return {
          token: null,
          error: 'INVALID_EMAIL',
        };
      }

      const correctPassword = user.validPassword(password);

      if (!correctPassword) {
        return {
          token: null,
          error: 'INVALID_PASSWORD',
        };
      }

      return {
        token: generateToken(user),
        error: null,
        user,
      };
    },
    outputFields: {
      token: {
        type: GraphQLString,
        resolve: ({ token }) => token,
      },
      error: {
        type: GraphQLString,
        resolve: ({ error }) => error,
      },
      user: {
        type: userType,
      },
    },
  });


  return new GraphQLSchema({
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: () => ({
        LoginWithEmail,
      }),
    }),
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: () => ({
        node: nodeField,
        allEvents: {
          type: allEventsConnection.connectionType,
          args: allEventsConnection.connectionArgs,
          resolve: ensureRole([
            'admin',
            'speaker',
          ])(allEventsConnection.resolve),
        },
        allSpeakers: {
          type: allSpeakersConnection.connectionType,
          args: allSpeakersConnection.connectionArgs,
          resolve: allSpeakersConnection.resolve,
        },
        allLectures: {
          type: allLecturesConnection.connectionType,
          args: allLecturesConnection.connectionArgs,
          resolve: allLecturesConnection.resolve,
        },
        allUsers: {
          type: allUsersConnection.connectionType,
          args: allUsersConnection.connectionArgs,
          resolve: allUsersConnection.resolve,
        },
        event: {
          type: eventType,
          args: {
            id: {
              description: 'id of the event',
              type: new GraphQLNonNull(GraphQLInt),
            },
          },
          resolve: resolver(Event),
        },
        user: {
          type: userType,
          args: {
            id: {
              description: 'id of the user',
              type: new GraphQLNonNull(GraphQLInt),
            },
          },
          resolve: resolver(User),
        },
        lecture: {
          type: lectureType,
          args: {
            id: {
              description: 'id of the lecture',
              type: new GraphQLNonNull(GraphQLInt),
            },
          },
          resolve: resolver(Lecture),
        },
        speaker: {
          type: speakerType,
          args: {
            id: {
              description: 'id of the speaker',
              type: new GraphQLNonNull(GraphQLInt),
            },
          },
          resolve: resolver(Speaker),
        },
      }),
    }),
  });
};
