const express = require('express');
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
const mentor = require('./models/MentorModel');
const studentsmodel = require('./models/StudentsModel');
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://mentor-dashboard-app.vercel.app'); // Replace with your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Adjust allowed methods if needed
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Adjust allowed headers if needed
  next();
});
app.use(cors());
app.use(express.json());




const port = 5000;

async function dbConnection() {
  try {
    await mongoose.connect('mongodb+srv://satvik1608:sidharthsatvik@cluster0.9kagwo0.mongodb.net/MentorDashboard?retryWrites=true&w=majority');
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}


const main = async () => {
  await dbConnection();
}
main();
app.get("/", (req, res) => {
  res.json("Hello")
});
app.post('/', async (req, res) => {

  const { email, password } = req.body;
  console.log("hii");
  const user = await mentor.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'Invalid email or password' });
  }
  if (password != user.password) {
    return res.status(200).json({ message: 'Invalid email or password' });
  }

  res.json({ message: user.id })
})

app.get('/dashboard', async (req, res) => {
  const students = await studentsmodel.find();
  res.json({ students: students })
})

app.post('/add', async (req, res) => {
  const { studentid, mid } = req.body;
  const result = await studentsmodel.find({ "id": studentid });
  const valid = parseInt(result[0].mentor);
  if (valid) {
    return res.status(200).json({ message: "Already associated with some other mentor" });
  }
  const mentordata = await mentor.find({ "id": mid });
  console.log(mentordata);
  let menteesdata = mentordata[0].mentees;
  if (menteesdata.length >= 4) {
    return res.status(200).json({ message: "A mentor cannot have more than 4 mentees" });
  }
  menteesdata.push(parseInt(studentid));
  await mentor.updateOne({ "id": mid }, { $set: { "mentees": menteesdata } });
  await studentsmodel.updateOne({ "id": studentid }, { $set: { "mentor": 1, "mentorId": parseInt(mid) } });
  res.json({ message: "Added Successfully" });

})

app.post("/mentees", async (req, res) => {
  const { mid } = req.body;
  const menteesData = await studentsmodel.find({ "mentorId": parseInt(mid) });
  return res.json({ mentees: menteesData });

})

app.post("/delete", async (req, res) => {
  const { studentid, mid } = req.body;
  const mentordata = await mentor.find({ "id": mid });
  let menteesdata = mentordata[0].mentees;
  if (menteesdata.length == 3) {
    return res.status(200).json({ message: "A mentor should have minimum of 3 mentees " })
  }
  menteesdata = menteesdata.filter((id) => {
    return id != studentid
  }
  )
  await mentor.updateOne({ "id": mid }, { $set: { "mentees": menteesdata } });
  await studentsmodel.updateOne({ "id": studentid }, { $set: { "mentor": 0, "mentorId": 0 } });
  res.json({ message: "Deleted Successfully" });

})

app.post("/confirm", async (req, res) => {
  const { studentid } = req.body;
  const confirmed = await studentsmodel.updateOne({ "id": studentid }, { $set: { "locked": true } });
  res.json({ message: "Locked Successfully" });
})

app.get("/marksAssigned", async (req, res) => {
  const filterdata = await studentsmodel.find({ "evaluated": 1 });
  res.json({ filteredData: filterdata })
})
app.get("/marksNotAssigned", async (req, res) => {
  const filterdata = await studentsmodel.find({ "evaluated": 0 });
  res.json({ filteredData: filterdata })
})

app.post("/editMarks", async (req, res) => {
  const { sid } = req.body;
  const students = await studentsmodel.find({ "id": sid });
  res.json(students[0].marks)
})

app.post("/edit/submit", async (req, res) => {
  const { student, sid } = req.body;
  const valid = await studentsmodel.findOne({ "id": sid });
  if (valid.locked == true) {
    return res.status(200).json({ message: "Locked cannot be edited" })
  }
  const updateMarks = await studentsmodel.updateOne({ "id": sid }, { $set: { "evaluated": 1, "marks": student } })
  res.json({ message: "Updated marks" });

})

app.listen(port, () => {
  console.log("Listening on port 5000");
})


