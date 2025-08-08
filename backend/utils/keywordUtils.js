const nlp = require('compromise');

function extractKeywords(text){
  if (!text) return [];

  const doc = nlp(text);

  //extract nouns
  const nouns = doc.nouns().out('array')

  //extract verbs
  const verbs = doc.verbs().out('array');

  //combine both verb + noun
  const combined = [...new Set([...nouns, ...verbs].map(word => word.toLowerCase()))];

  return combined.filter(word => word.length > 2);
}

function getMatchingKeywords(resumeKeywords, jobKeywords) {
  const resumeSet = new Set(resumeKeywords);
  const matched = jobKeywords.filter(word => resumeSet.has(word));
  const missing = jobKeywords.filter(word => !resumeSet.has(word));
  const score = jobKeywords.length === 0 ? 0 : (matched.length / jobKeywords.length) * 100;

  return {
    matched,
    missing,
    score: score.toFixed(2)
  };
}

module.exports = {extractKeywords, getMatchingKeywords};