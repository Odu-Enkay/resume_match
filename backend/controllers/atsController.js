const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractEntities } = require('../services/nerService');

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

    const resumeEntities = await extractEntities(resumeText);
    const jdEntities = await extractEntities(jobDescription);

    const filterEntities = (entities, types) =>
      entities.filter(e => types.includes(e.entity_group)).map(e => e.word);

    const resumeSkills = filterEntities(resumeEntities, ['MISC']);
    const resumePersons = filterEntities(resumeEntities, ['PER']);
    const resumeOrgs = filterEntities(resumeEntities, ['ORG']);

    const jdSkills = filterEntities(jdEntities, ['MISC']);
    const jdPersons = filterEntities(jdEntities, ['PER']);
    const jdOrgs = filterEntities(jdEntities, ['ORG']);

    res.json({
      message: 'Parsed and extracted entities successfully!',
      fileName: resumeFile.originalname,
      resumeTextLength: resumeText.length,
      resumeEntities: {
        skills: resumeSkills,
        persons: resumePersons,
        organizations: resumeOrgs,
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
