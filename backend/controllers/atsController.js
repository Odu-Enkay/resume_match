const { semanticSimilarity } = require('../services/matchService');
const pdfParse = require('pdf-parse');


function extractKeywords(resumeText, jobDescription) {
  const jobWords = jobDescription.toLowerCase().split(/\W+/);
  const resumeWords = resumeText.toLowerCase().split(/\W+/);

  const matched = [];
  const missing = [];

  jobWords.forEach(word => {
    if (word.length > 2) { 
      if (resumeWords.includes(word)) {
        matched.push(word);
      } else {
        missing.push(word);
      }
    }
  });

  return { matched, missing };
}

async function parseAndExtract(req, res) {
  try {
    // ====== Step1. Validation ======
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }
    if (!req.body.jobDescription) {
      return res.status(400).json({ error: "Job description text is required" });
    }

    const resumeBuffer = req.file.buffer;
    const jobDescription = req.body.jobDescription;

    // ====== Step2. Extract Resume Text ======
    const resumeData = await pdfParse(resumeBuffer);
    const resumeText = resumeData.text;

    // ====== Step3. Semantic Similarity ======
    const similarity = await semanticSimilarity(resumeText, jobDescription);

    // ====== Step4. Keyword Extraction  ======
    const { matched, missing } = extractKeywords(resumeText, jobDescription);

    // ====== Step5. Years of Experience  ======
    const yearsExperience = 3;

    // ====== Step6. Compute Fit Score  ======
    const keywordOverlap = matched.length / (matched.length + missing.length || 1);
    const fitScore = (0.6 * similarity) + (0.3 * keywordOverlap) + (0.1 * (yearsExperience / 10));

    // ====== Step7. Insights ======
    const insights = [];
    if (fitScore > 0.8) {
      insights.push("Excellent alignment! Your resume is a strong match.");
    } else if (fitScore > 0.6) {
      insights.push("Good fit, but you can improve your chances by refining your keywords.");
    } else {
      insights.push("Weak fit. Consider tailoring your resume to highlight relevant skills and achievements.");
    }

    if (missing.length > 0) {
      insights.push(`Add these missing skills/keywords: ${missing.slice(0, 10).join(', ')}...`);
    }

    if (similarity < 0.5) {
      insights.push("Your resume and job description have low textual similarity. Try reframing your work experience using the job’s wording.");
    }

    // ====== Step8. Response ======
    res.json({
      fitScore: (fitScore * 100).toFixed(2) + "%",
      matchedKeywords: matched.slice(0, 15), 
      missingKeywords: missing.slice(0, 15),
      insights
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error parsing resume and job description" });
  }
}

module.exports = { parseAndExtract };
