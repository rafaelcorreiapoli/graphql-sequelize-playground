import Sequelize from 'sequelize';

export default new Sequelize('outsmart_eventos', 'rafa93br', 'q1w2e3', {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  logging: true,
});
