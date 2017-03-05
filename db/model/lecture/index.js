import sequelize from '../../sequelize';
import Sequelize from 'sequelize';
import moment from 'moment';
import Speaker from '../speaker';

const Lecture = sequelize.define('lecture', {
  name: {
    type: Sequelize.STRING,
  },
  startDate: {
    type: Sequelize.DATE,
  },
  endDate: {
    type: Sequelize.DATE,
  },
});

export const sync = () => {
  return Lecture.sync({ force: true })
    .then(() => {
      const now = moment();
      const someDaysFromNow = moment().add(5, 'day');

      return Lecture.create({
        name: 'Lecture 101',
        startDate: now,
        endDate: someDaysFromNow,
      });
    });
};

export default Lecture;
