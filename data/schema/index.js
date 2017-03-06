import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
} from 'graphql';
import { resolver, attributeFields } from 'graphql-sequelize';
import User from '../../db/model/user';
import Event from '../../db/model/event';
import Lecture from '../../db/model/lecture';
import Speaker from '../../db/model/speaker';

// Event.Users = Event.hasMany(User, { as: 'Users' });
// User.Event = User.belongsTo(Event);
// Lecture.Event = Lecture.belongsTo(Event);


export default () => {
  const lectureFields = attributeFields(Lecture);
  const speakerFields = attributeFields(Speaker);

  const speakerType = new GraphQLObjectType({
    name: 'Speaker',
    description: 'A speaker',
    fields: () => ({
      ...speakerFields,
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
  });

  const lectureType = new GraphQLObjectType({
    name: 'Lecture',
    description: 'A lecture',
    fields: () => ({
      ...lectureFields,
      event: {
        type: eventType,
        resolve: resolver(Lecture.Event),
      },
      speakers: {
        type: new GraphQLList(speakerType),
        resolve: resolver(Lecture.Speakers),
      },
    }),
  });

  const eventType = new GraphQLObjectType({
    name: 'Event',
    description: 'An event',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the user.',
      },
      name: {
        type: GraphQLString,
        description: 'The name of the event',
      },
      users: {
        type: new GraphQLList(userType),
        resolve: resolver(Event.Users),
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
  });

  const userType = new GraphQLObjectType({
    name: 'User',
    description: 'A user',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the user.',
      },
      firstName: {
        type: GraphQLString,
        description: 'The first name of the user.',
      },
      lastName: {
        type: GraphQLString,
        description: 'The last name of the user.',
      },
      event: {
        type: eventType,
        resolve: resolver(User.Event),
      },
    }),
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: () => ({
        events: {
          type: new GraphQLList(eventType),
          resolve: resolver(Event),
        },
        users: {
          type: new GraphQLList(userType),
          resolve: resolver(User),
        },
        lectures: {
          type: new GraphQLList(lectureType),
          resolve: resolver(Lecture),
        },
        speakers: {
          type: new GraphQLList(speakerType),
          resolve: resolver(Speaker),
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
