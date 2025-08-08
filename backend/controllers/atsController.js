const { parseResume } = require('../services/parserService');
const { extractKeywords, getMatchingKeywords } = require('../utils/keywordUtils');

exports.parseAndMatch = async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription) {
    return res.status(400).json({ error: 'Resume file and job description are required.' });
  }

  try {
    // Parse the resume file to text
    const resumeText = await parseResume(resumeFile);

    // Extract keywords from both resume and job description
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescription);

    // Calculate matching keywords and score
    const matchResult = getMatchingKeywords(resumeKeywords, jobKeywords);

    res.json({
      message: "Resume parsed successfully!",
      fileName: resumeFile.originalname,
      content: resumeText,
      resumeLength: resumeText.length,
      jobDescriptionContent: jobDescription.substring(0, 100),
      matchResult,   // Return the matching info
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse resume.' });
  }
};
