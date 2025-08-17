// backend/services/matcherService.js
const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs-node');

/**
 * Compute semantic similarity between two texts using Universal Sentence Encoder
 */
async function semanticSimilarity(resumeText, jobText) {
  const model = await use.load();
  const embeddings = await model.embed([resumeText, jobText]);
  
  const resumeEmb = embeddings.slice([0,0],[1,-1]);
  const jobEmb = embeddings.slice([1,0],[1,-1]);

  const cosineSimilarity = resumeEmb
    .dot(jobEmb.transpose())
    .div(resumeEmb.norm().mul(jobEmb.norm()))
    .arraySync()[0][0];

  return cosineSimilarity; // -1 to 1
}

module.exports = { semanticSimilarity };
