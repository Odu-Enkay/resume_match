/* import express from "express";
import multer from "multer";
import cors from "cors"; */
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse')

const app = express();
const upload = multer()
app.use(express.json());

//PORT
const port = 3000;

//======ENDPOINT=====
//===== file upload and JD
app.post

app.get("/", (req, res) => {
  res.send("Resume Matcher here again");
})

app.get('/match', (req, res) => {
  res.json({message: 'See the json output for resume'})
})

app.post('/match', upload.single('resume'), async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription)
    return res.status(400).json({ error: 'ressume file and job description are required.'});

  try {
    const data = await pdfParse(resumeFile.buffer);
    const resumeText = data.text;
  

  //send back info as is
  res.json({
    message: "resume parsed successfully!",
    fileName: resumeFile.originalname,
    resumeLength: resumeText.length,
    jobDescriptionContent: jobDescription.substring(0, 100)
  });
} catch(error){
  res.status(500).json({error: 'Failed to parse resume.'});
}
})


//=====START THE SERVER=====
app.listen(port, () => {
  console.log(`App listening on Port ${port}...`);
});


