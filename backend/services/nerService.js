require('dotenv').config(); 
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const HF_API_KEY = process.env.HF_API_KEY;

async function extractEntities(text) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/dslim/bert-base-NER',
    {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    throw new Error(`NER API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

module.exports = { extractEntities };
