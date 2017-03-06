import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';
import configDb from './db/config';
import getSchema from './data/schema';
import User from './db/model/user';

const GRAPHQL_PORT = 8080;

const main = () => {
  configDb()
    .then(() => {
      const app = express();
      const schema = getSchema();
      app.use('/graphql', bodyParser.json(), graphqlExpress({
        schema,
        context: {
          user: {
            name: 'Admin',
            role: 'speaker',
          },
        },
      }));
      app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
      }));
      app.listen(GRAPHQL_PORT, () => {
        console.log(`GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`);
        console.log(`GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`);
      });
    });
};


main();
