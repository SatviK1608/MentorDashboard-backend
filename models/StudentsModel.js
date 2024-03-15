const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  evaluated: {
    type: Number
  },
  marks: {
    type: Object
  },
  mentor: {
    type: Number,
  },
  mentorId: {
    type: Number,
  },
  locked: {
    type: Boolean
  }
})

const studentsModel = mongoose.model('Students', studentSchema)

module.exports = studentsModel;