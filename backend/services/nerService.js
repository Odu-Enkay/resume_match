const fetch = require('node-fetch');
const HF_API_KEY = process.env.HF_API_KEY;

async function extractEntites(text){
  const response = await fetch(
    'https://api-inference.huggingface.co/models/dslim/bert-base-NER',{
      method:'POST', 
      Headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    throw new Error('NER API request failed');
  }

  const data = await response.json();
  return data;

}

module.exports = {extractEntites};