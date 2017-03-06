import sequelize from '../../sequelize';
import Sequelize from 'sequelize';
import User from '../user';
import Lecture from '../lecture';
import Speaker from '../speaker';

const Event = sequelize.define('event', {
  name: {
    type: Sequelize.STRING,
  },
});


export default Event;
