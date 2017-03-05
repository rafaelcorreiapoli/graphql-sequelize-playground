export default `
type User  {
  firstName: String,
  lastName: String
  event: Event
}

type Event {
  name: String
  speakers: [Speaker],
  lectures: [Lecture],
  users: [User]
}

type Speaker {
  name: String
  companyName: String
  lectures: [Lecture]
  assistant: Speaker
  event: Event
}

type Lecture {
  name: String
  speakers: [Speaker]
  event: Event
}


type Query {
  user(firstName: String, lastName: String): User
  allUsers: [User]
  lecture: Lecture
  allLectures: [Lecture]
  event: Event
  allEvents: [Event]
  speaker(name: String): Speaker
  allSpeakers: [Speaker]

}


# we need to tell the server which types represent the root query
# and root mutation types. We call them RootQuery and RootMutation by convention.
schema {
  query: Query
}
`;
