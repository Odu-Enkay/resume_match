import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
app.use(express.json());

//PORT
const port = 3000;

//======ENDPOINT=====
//===== file upload and JD
app.post

app.get("/", (req, res) => {
  res.send("Resume Matcher here again");
})

app.post('/match', upload.single('resume'), (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription)
    return res.status(400).json({ error: 'ressume file and job description are required.'});

  //send back info as is
})

app.listen(port, () => {
  console.log(`App listening on Port ${port}...`);
});


