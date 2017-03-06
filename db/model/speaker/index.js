import Sequelize from 'sequelize';
import sequelize from '../../sequelize';

const Speaker = sequelize.define('speaker', {
  name: {
    type: Sequelize.STRING,
  },
  companyName: {
    type: Sequelize.STRING,
  },
}, {
  getterMethods: {
    nameWithCompany() { return `${this.name} - ${this.companyName}`; },
  },
});

export default Speaker;
