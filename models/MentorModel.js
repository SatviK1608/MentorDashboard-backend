const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  id: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  mentees: {
    type: Array
  }
})

const mentorModel = mongoose.model('mentor', mentorSchema)

module.exports = mentorModel;