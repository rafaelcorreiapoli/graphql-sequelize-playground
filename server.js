import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import bodyParser from 'body-parser';
import configDb from './db/config';
import getSchema from './data/schema';
import User from './db/model/user';
import { getUser } from './src/auth';

const GRAPHQL_PORT = 8080;

const main = () => {
  configDb()
    .then(() => {
      const app = express();
      const schema = getSchema();
      app.use('/graphql', bodyParser.json(), graphqlExpress(async req => {
        const {
          authorization,
        } = req.headers;

        const user = await getUser(authorization);

        return {
          schema,
          context: {
            user,
          },
        };
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
