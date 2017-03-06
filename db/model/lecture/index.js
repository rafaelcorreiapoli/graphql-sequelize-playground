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


export default Lecture;
