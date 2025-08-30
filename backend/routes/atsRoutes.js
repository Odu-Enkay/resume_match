const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { parseAndExtract } = require('../controllers/atsController');

// GET test endpoint
router.get('/match', (req, res) => {
  res.json({ message: 'See the JSON output for resume' });
});

// POST endpoint: resume + JD
// expects form-data with `resume` file and `jobDescription` field
router.post('/match', upload.single('resume'), parseAndExtract);

module.exports = router;
