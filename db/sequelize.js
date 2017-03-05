import Sequelize from 'sequelize';

// Or you can simply use a connection uri
// export default new Sequelize('postgres://rafa93br:q1w2e3@localhost:5432/outsmart_eventos');


export default new Sequelize('outsmart_eventos', 'rafa93br', 'q1w2e3', {
  dialect: 'postgres',
  // custom host; default: localhost
  host: 'localhost',

  // custom port; default: 3306
  port: 5432,

  // disable logging; default: console.log
  logging: false,
});
