import sequelize from './sequelize';

import User from './model/user';
import Lecture from './model/lecture';
import Speaker from './model/speaker';
import Event from './model/event';
import 'colors';

console.logWithTab = (x, n = 1) => console.log(`${' '.repeat(n)}${x}`);

const buildRelations = () => {
  return new Promise((resolve, reject) => {
    try {
      Lecture.Speakers = Lecture.belongsToMany(Speaker, {
        through: 'lectureSpeaker',
      });
      Speaker.Lectures = Speaker.belongsToMany(Lecture, {
        through: 'lectureSpeaker',
      });
      Event.Users = Event.hasMany(User, { as: 'Users' });
      Event.Lectures = Event.hasMany(Lecture, { as: 'Lectures' });
      Event.Speakers = Event.hasMany(Speaker, { as: 'Speakers' });

      User.Event = User.belongsTo(Event);
      Lecture.Event = Lecture.belongsTo(Event);
      Speaker.Event = Speaker.belongsTo(Event);

      Speaker.Assistant = Speaker.belongsTo(Speaker, {
        as: 'Assistant',
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const mockData = async () => {
  const user1 = await User.create({
    firstName: 'Rafael',
    lastName: 'Ribeiro Correia',
    age: 10,
  });
  const user2 = await User.create({
    firstName: 'João',
    lastName: 'da Silva',
    age: 12,
  });
  const lecture1 = await Lecture.create({
    name: 'Microsoft is bad',
  });

  const speaker1 = await Speaker.create({
    name: 'Bill Gates',
    companyName: 'Microsoft',
  });

  const speaker2 = await Speaker.create({
    name: 'Bill Gates Assistant',
    companyName: 'Microsoft',
  });

  const event1 = await Event.create({
    name: 'OS Event',
  });

  const event2 = await Event.create({
    name: 'Drone Event',
  });

  await event1.addUser(user1);
  await event1.addUser(user2);
  await event1.addSpeaker(speaker1);
  await event1.addSpeaker(speaker2);
  await event1.addLecture(lecture1);

  await speaker1.addLecture(lecture1);
  await speaker1.setAssistant(speaker2);
};


export default () => {
  return sequelize
    .authenticate()
    .then(() => {
      console.log('-----------------------------'.gray);
      console.log('** Connection has been established successfully.'.green);
      return buildRelations();
    })
    .then(() => {
      console.log('** Relations built'.green);
      return sequelize.sync({
        force: true,
      });
    })
    .then(() => {
      console.log('** Models sync'.green);
      mockData();
    })
    .then(() => {
      console.log('** Data mocked'.green);
      console.log('-----------------------------'.gray);
    })
    .catch((err) => {
      console.log(`** Unable to connect to the database: ${err.toString}`.red);
    });
};
