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

export const sync = () => {
  return Event.sync({ force: true })
    .then(() => {
      return Event.create({
        name: 'Event 101',
      });
    });
};


export default Event;
