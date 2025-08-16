const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractEntities } = require('../services/nerService');
const { splitSections } = require('../utils/sectionSplitter');

// Utility to normalize and deduplicate
function cleanAndUnique(arr) {
  return [...new Set(arr.map(item => item.trim().toLowerCase()))].filter(Boolean);
}

// Utility to calculate skill overlap percentage
function calculateMatchScore(resumeSkills, jdSkills) {
  const resumeSet = new Set(resumeSkills);
  const jdSet = new Set(jdSkills);
  const overlap = [...resumeSet].filter(skill => jdSet.has(skill));
  const score = jdSkills.length ? (overlap.length / jdSkills.length) * 100 : 0;
  return {
    score: Math.round(score),
    matchedSkills: overlap
  };
}

exports.parseAndExtract = async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription) {
    return res.status(400).json({ error: 'Resume file and job description are required.' });
  }

  try {
    // ----- STEP 1: Extract raw text from resume -----
    let resumeText = '';
    const ext = path.extname(resumeFile.originalname).toLowerCase();

    if (ext === '.pdf') {
      const data = await pdfParse(resumeFile.buffer);
      resumeText = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: resumeFile.buffer });
      resumeText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Only PDF and DOCX are allowed.' });
    }

    // ----- STEP 2: Rule-based section splitting -----
    const resumeSections = splitSections(resumeText);

    // ----- STEP 3: NER extraction -----
    const resumeEntities = await extractEntities(resumeText);
    const jdEntities = await extractEntities(jobDescription);

    const filterEntities = (entities, types) =>
      entities.filter(e => types.includes(e.entity_group)).map(e => e.word);

    // Raw extraction
    const resumeSkillsRaw = filterEntities(resumeEntities, ['MISC']);
    const jdSkillsRaw = filterEntities(jdEntities, ['MISC']);

    // Clean + deduplicate
    const resumeSkills = cleanAndUnique(resumeSkillsRaw);
    const jdSkills = cleanAndUnique(jdSkillsRaw);

    // ----- STEP 4: Calculate skill match score -----
    const matchResult = calculateMatchScore(resumeSkills, jdSkills);

    // ----- STEP 5: Optional section-level NER -----
    const resumeSkillsEntities = await extractEntities(resumeSections.Skills || '');
    const resumeExperienceEntities = await extractEntities(resumeSections.Experience || '');
    const resumeEducationEntities = await extractEntities(resumeSections.Education || '');
    const resumeProfileEntities = await extractEntities(resumeSections.Profile || '');

    // ----- STEP 6: Respond -----
    res.json({
      message: 'Parsed and extracted successfully!',
      fileName: resumeFile.originalname,
      resumeTextLength: resumeText.length,
      sections: resumeSections,
      entities: {
        resume: {
          skills: resumeSkills,
          skillsSectionEntities: resumeSkillsEntities,
          experienceSectionEntities: resumeExperienceEntities,
          educationSectionEntities: resumeEducationEntities,
          profileSectionEntities: resumeProfileEntities
        },
        jobDescription: {
          skills: jdSkills
        }
      },
      match: {
        score: matchResult.score,
        matchedSkills: matchResult.matchedSkills
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to parse resume or extract entities.' });
  }
};
