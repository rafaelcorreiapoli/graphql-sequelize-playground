import Sequelize from 'sequelize';
import sequelize from '../../sequelize';

const User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
});

export default User;
