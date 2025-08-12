const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer()
const { parseAndExtract } = require('../controllers/atsController');
//const {parseAndMatch} = require('../controllers/atsController')

//const atsController = require('../controllers/atsController')

//======ENDPOINT=====
//===== file upload and JD
router.get('/match', (req, res) => {
  res.json({message: 'See the json output for resume'})
})

router.post('/match', upload.single('resume'), parseAndExtract);


  

module.exports = router;
