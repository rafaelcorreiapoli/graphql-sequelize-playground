import Sequelize from 'sequelize';
import sequelize from '../../sequelize';
import bcrypt from 'bcrypt';

const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
  age: {
    type: Sequelize.INTEGER,
  },
  role: {
    type: Sequelize.STRING,
  },
}, {
  instanceMethods: {
    generateHash(password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    },
  },
  hooks: {
    beforeCreate: (user, options, cb) => {
      user.password = user.generateHash(user.password);
      return cb(null, options);
    },
    beforeUpdate: (user, options, cb) => {
      user.password = User.generateHash(user.password);
      return cb(null, options);
    },
  },
});


export default User;
