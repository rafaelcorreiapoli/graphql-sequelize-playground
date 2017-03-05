import User from '../../db/model/user';
import Lecture from '../../db/model/lecture';
import Event from '../../db/model/event';
import Speaker from '../../db/model/speaker';

export default {
  Query: {
    lecture: (_, args) =>
      Lecture.findOne({
        where: args,
      }),
    allLectures: () =>
      Lecture.findAll(),
    user: (_, args) =>
      User.findOne({
        where: args,
      }),
    allUsers: () =>
      User.findAll(),
    event: (_, args) =>
      Event.findOne({
        where: args,
      }),
    allEvents: () =>
      Event.findAll(),
    speaker: (_, args) =>
      Speaker.findOne({
        where: args,
      }),
    allSpeakers: () =>
      Speaker.findAll(),
  },
  User: {
    event: user => user.getEvent(),
  },
  Lecture: {
    speakers: (lecture) => lecture.getSpeakers(),
    event: lecture => lecture.getEvent(),
  },
  Event: {
    speakers: event => event.getSpeakers(),
    lectures: event => event.getLectures(),
    users: event => event.getUsers(),
  },
  Speaker: {
    lectures: (speaker) => speaker.getLectures(),
    assistant: (speaker) => speaker.getAssistant(),
    event: speaker => speaker.getEvent(),
  },
};
