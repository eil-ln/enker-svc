db.students.remove({});
db.students.insertMany([{
  "email": "father@gmail.com",
  "firstName": "Fa",
  "lastName": "Ther",
  "password": "password",
  "learningTargets": [
    "Animation",
    "Game Development",
    "Filmmaking"
  ],
  "location": "Yerevan"
}, {
  "email": "batya@gmail.com",
  "firstName": "Ba",
  "lastName": "Tya",
  "password": "password",
  "learningTargets": [
    "Game Development",
  ],
  "location": "Gyumri"
}
])

db.students.createIndex({ lastName: "text", firstName: "text", location: "text" })
db.students.createIndex({ learningTargets: 1})
