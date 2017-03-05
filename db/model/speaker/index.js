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


export const sync = () => {
  return Speaker.sync({ force: true })
    .then(() => {
      return Speaker.create({
        name: 'Bill Gates',
        companyName: 'Microsoft',
      });
    });
};


export default Speaker;
