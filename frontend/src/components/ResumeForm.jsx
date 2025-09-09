import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
} from "@mui/material";

const ResumeForm = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobText, setJobText] = useState("");

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile || !jobText) {
      alert("Please upload a resume and paste the job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile); 
    formData.append("jobDescription", jobText);

    try {
      const response = await fetch("http://localhost:3000/api/match", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Result:", data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        maxWidth: 600,
        margin: "20px auto",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Resume Matcher
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* File Upload */}
        <Button variant="outlined" component="label">
          Upload Resume
          <input
            type="file"
            hidden
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
        </Button>
        {resumeFile && (
          <Typography variant="body2">
            Selected: {resumeFile.name}
          </Typography>
        )}

        {/* Job Description */}
        <TextField
          label="Paste Job Description"
          multiline
          rows={6}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />

        {/* Submit Button */}
        <Button type="submit" variant="contained" color="primary">
          Match Resume
        </Button>
      </Box>
    </Paper>
  );
};

export default ResumeForm;
