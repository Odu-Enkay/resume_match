const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

async function parseResume(file) {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (fileExtension === '.pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  } else if (fileExtension === '.docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type. Only PDF and DOCX are allowed.');
  }
}

module.exports = { parseResume };