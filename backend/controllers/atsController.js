const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractEntities } = require('../services/nerService');
const { splitSections } = require('../utils/sectionSplitter');

exports.parseAndExtract = async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const resumeFile = req.file;

  if (!resumeFile || !jobDescription) {
    return res.status(400).json({ error: 'Resume file and job description are required.' });
  }

  try {
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

    // 1️ Split resume into sections (rule-based)
    const resumeSections = splitSections(resumeText);

    // 2️ Run NER on the whole resume and JD
    const resumeEntities = await extractEntities(resumeText);
    const jdEntities = await extractEntities(jobDescription);

    // Helper to filter entities by type
    const filterEntities = (entities, types) =>
      entities.filter(e => types.includes(e.entity_group)).map(e => e.word);

    // Extract main entity categories
    const resumeSkills = filterEntities(resumeEntities, ['MISC']);
    const resumePersons = filterEntities(resumeEntities, ['PER']);
    const resumeOrgs = filterEntities(resumeEntities, ['ORG']);

    const jdSkills = filterEntities(jdEntities, ['MISC']);
    const jdPersons = filterEntities(jdEntities, ['PER']);
    const jdOrgs = filterEntities(jdEntities, ['ORG']);

    // 3 Optionally run NER on each section separately
    const resumeSkillsEntities = await extractEntities(resumeSections.Skills || '');
    const resumeExperienceEntities = await extractEntities(resumeSections.Experience || '');
    const resumeEducationEntities = await extractEntities(resumeSections.Education || '');
    const resumeProfileEntities = await extractEntities(resumeSections.Profile || '');

    res.json({
      message: 'Parsed and extracted entities successfully!',
      fileName: resumeFile.originalname,
      resumeTextLength: resumeText.length,
      sections: resumeSections,
      resumeEntities: {
        skills: resumeSkills,
        persons: resumePersons,
        organizations: resumeOrgs,
        skillsSectionEntities: resumeSkillsEntities,
        experienceSectionEntities: resumeExperienceEntities,
        educationSectionEntities: resumeEducationEntities,
        profileSectionEntities: resumeProfileEntities,
      },
      jobDescriptionEntities: {
        skills: jdSkills,
        persons: jdPersons,
        organizations: jdOrgs,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to parse resume or extract entities.' });
  }
};
