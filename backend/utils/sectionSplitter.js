
function splitSections(text){
  const sections = {};
  const lines = text.split('\n');
  let currentSection = 'General';

  lines.forEach(line => {
    const trimmed = line.trim().toLowerCase();

    if (trimmed.match(/experience|worok history |employment/)) {
      currentSection = 'Experience';
      sections[currentSection] = sections[currentSection] || [];
    } else if (trimmed.match(/education|acadeic background/)) {
      currentSection = 'Education';
      sections[currentSection] = sections[currentSection] || [];
    } else if (trimmed.match(/skills|technical skills/)) {
      currentSection = 'Skills';
      sections[currentSection] = sections[currentSection] || [];
    } else if (trimmed.match(/profile|summary|objective/)) {
      currentSection = 'Profile';
      sections[currentSection] = sections[currentSection] || [];
    }

    sections[currentSection] = sections[currentSection] || [];
    sections[currentSection].push(line);
  });

  // join lines back to the paragraph
  for (const key in sections) {
    sections[key] = sections[key].join('\n').trim();
  }
  return sections;

}

module.exports = { splitSections };