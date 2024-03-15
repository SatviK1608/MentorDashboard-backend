const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const url = process.env.MONGO_URL
const client = new MongoClient('mongodb+srv://satvik1608:sidharthsatvik@cluster0.9kagwo0.mongodb.net/MentorDashboard?retryWrites=true&w=majority'
);
app.use(cors(
  {
    origin: ["https://mentor-dashboard-app.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true
  }
));
app.use(express.json());



const dbName = 'MentorDashboard';
const port = 5000;

async function dbConnection() {
  await client.connect();
  console.log('Connected successfully to server');

  const db = client.db();
  return [db.collection('mentor'), db.collection('students')]
}

var data = [];
const main = async () => {
  data = await dbConnection();
}
main();
console.log(data);
app.get("/", (req, res) => {
  res.json("Hello")
});
app.post('/', async (req, res) => {

  const { email, password } = req.body;
  const user = await data[0].findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'Invalid email or password' });
  }
  if (password != user.password) {
    return res.status(200).json({ message: 'Invalid email or password' });
  }

  res.json({ message: user.id })
})

app.get('/dashboard', async (req, res) => {
  const students = await data[1].find().toArray();
  res.json({ students: students })
})

app.post('/add', async (req, res) => {
  const { studentid, mid } = req.body;
  const result = await data[1].find({ "id": studentid }).toArray();
  const valid = parseInt(result[0].mentor);
  if (valid) {
    return res.status(200).json({ message: "Already associated with some other mentor" });
  }
  const mentordata = await data[0].find({ "id": mid }).toArray();
  let menteesdata = mentordata[0].mentees;
  if (menteesdata.length >= 4) {
    return res.status(200).json({ message: "A mentor cannot have more than 4 mentees" });
  }
  menteesdata.push(parseInt(studentid));
  await data[0].updateOne({ "id": mid }, { $set: { "mentees": menteesdata } });
  await data[1].updateOne({ "id": studentid }, { $set: { "mentor": 1, "mentorId": parseInt(mid) } });
  res.json({ message: "Added Successfully" });

})

app.post("/mentees", async (req, res) => {
  const { mid } = req.body;
  const menteesData = await data[1].find({ "mentorId": parseInt(mid) }).toArray();
  return res.json({ mentees: menteesData });

})

app.post("/delete", async (req, res) => {
  const { studentid, mid } = req.body;
  const mentordata = await data[0].find({ "id": mid }).toArray();
  let menteesdata = mentordata[0].mentees;
  if (menteesdata.length == 3) {
    return res.status(200).json({ message: "A mentor should have minimum of 3 mentees " })
  }
  menteesdata = menteesdata.filter((id) => {
    return id != studentid
  }
  )
  await data[0].updateOne({ "id": mid }, { $set: { "mentees": menteesdata } });
  await data[1].updateOne({ "id": studentid }, { $set: { "mentor": 0, "mentorId": 0 } });
  res.json({ message: "Deleted Successfully" });

})

app.post("/confirm", async (req, res) => {
  const { studentid } = req.body;
  const confirmed = await data[1].updateOne({ "id": studentid }, { $set: { "locked": true } });
  res.json({ message: "Locked Successfully" });
})

app.get("/marksAssigned", async (req, res) => {
  const filterdata = await data[1].find({ "evaluated": 1 }).toArray();
  res.json({ filteredData: filterdata })
})
app.get("/marksNotAssigned", async (req, res) => {
  const filterdata = await data[1].find({ "evaluated": 0 }).toArray();
  res.json({ filteredData: filterdata })
})

app.post("/editMarks", async (req, res) => {
  const { sid } = req.body;
  const students = await data[1].find({ "id": sid }).toArray();
  res.json(students[0].marks)
})

app.post("/edit/submit", async (req, res) => {
  const { student, sid } = req.body;
  const valid = await data[1].findOne({ "id": sid });
  if (valid.locked == true) {
    return res.status(200).json({ message: "Locked cannot be edited" })
  }
  const updateMarks = await data[1].updateOne({ "id": sid }, { $set: { "evaluated": 1, "marks": student } })
  res.json({ message: "Updated marks" });

})

app.listen(port, () => {
  console.log("Listening on port 5000");
})


