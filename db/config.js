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
      Lecture.belongsToMany(Speaker, {
        through: 'lectureSpeaker',
      });
      Speaker.belongsToMany(Lecture, {
        through: 'lectureSpeaker',
      });
      Event.hasMany(User, { as: 'Users' });
      Event.hasMany(Lecture, { as: 'Lectures' });
      Event.hasMany(Speaker, { as: 'Speakers' });

      User.belongsTo(Event);
      Lecture.belongsTo(Event);
      Speaker.belongsTo(Event);

      Speaker.belongsTo(Speaker, {
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


  await event1.addUser(user1);
  await event1.addSpeaker(speaker1);
  await event1.addSpeaker(speaker2);
  await event1.addLecture(lecture1);

  await speaker1.addLecture(lecture1);
  await speaker1.setAssistant(speaker2);

  const querySpeaker1 = await Speaker.findOne({
    where: {
      name: 'Bill Gates',
    },
  });

  console.log(querySpeaker1.nameWithCompany);
  const querySpeaker1Lectures = await querySpeaker1.getLectures();
  const querySpeaker1Assistant = await querySpeaker1.getAssistant();

  console.log('Lectures'.gray);
  querySpeaker1Lectures.forEach(lecture => {
    console.log(lecture.name);
  });

  console.log('Assistant'.gray);
  console.log(querySpeaker1Assistant.nameWithCompany);

  const queryEvent1 = await Event.findOne({
    where: {
      name: 'OS Event',
    },
  });


  console.log('----------'.gray);

  console.log(queryEvent1.name);
  const queryEvent1Speakers = await queryEvent1.getSpeakers();
  console.log('Speakers'.gray);
  queryEvent1Speakers.forEach(speaker => {
    console.logWithTab(speaker.nameWithCompany);
  });

  const queryEvent1Lectures = await queryEvent1.getLectures();
  console.log('Lectures'.gray);
  queryEvent1Lectures.forEach(lecture => {
    console.logWithTab(lecture.name);
  });

  const queryEvent1Users = await queryEvent1.getUsers();
  console.log('Users'.gray);
  queryEvent1Users.forEach(user => {
    console.logWithTab(user.firstName);
  });
};


export default () => {
  sequelize
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
      console.log('-----------------------------'.gray);
    })
    .then(() => {
      mockData();
    })
    .catch((err) => {
      console.log(`** Unable to connect to the database: ${err.toString}`.red);
    });
};
