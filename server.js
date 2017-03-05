import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './data/typeDefs';
import resolvers from './data/resolvers';
import bodyParser from 'body-parser';
import configDb from './db/config';


const GRAPHQL_PORT = 8080;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});


const main = () => {
  configDb();
  const app = express();
  app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }));
  app.listen(GRAPHQL_PORT, () => {
    console.log(`GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`);
    console.log(`GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`);
  });
};


main();
