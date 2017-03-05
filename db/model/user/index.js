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


export const sync = () => {
  // force: true will drop the table if it already exists
  User.sync({ force: true }).then(() => {
    // Table created
    return User.create({
      firstName: 'John',
      lastName: 'Hancock',
    });
  });
};

export default User;
