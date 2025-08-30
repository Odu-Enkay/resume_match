const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs-node');

let modelPromise = null;

 //==== Load and cache the Universal Sentence Encoder model

async function loadModel() {
  if (!modelPromise) {
    modelPromise = use.load();
    console.log("USE model loaded and cached");
  }
  return modelPromise;
}

//=== semantic similarity between two texts using Universal Sentence Encoder

async function semanticSimilarity(resumeText, jobText) {
  const model = await loadModel(); 

  // === Generate embeddings
  const embeddings = await model.embed([resumeText, jobText]);

  // === Slice embeddings
  const resumeEmb = embeddings.slice([0, 0], [1, -1]);
  const jobEmb = embeddings.slice([1, 0], [1, -1]);

  // ==== Compute cosine similarity
  const cosineSimilarity = resumeEmb
    .dot(jobEmb.transpose())
    .div(resumeEmb.norm().mul(jobEmb.norm()))
    .arraySync()[0][0];

  return cosineSimilarity; 
}

module.exports = { semanticSimilarity };
