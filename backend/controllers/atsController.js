const { parseResume } = require('../services/parserService');

exports.parseAndMatch = async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription) {
    return res.status(400).json({ error: 'Resume file and job description are required.' });
  }

  try {
    const resumeText = await parseResume(resumeFile);

    res.json({
      message: "Resume parsed successfully!",
      fileName: resumeFile.originalname,
      content: resumeText,
      resumeLength: resumeText.length,
      jobDescriptionContent: jobDescription.substring(0, 100)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse resume.' });
  }
};
