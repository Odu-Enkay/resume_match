/* import express from "express";
import multer from "multer";
import cors from "cors"; */
const express = require('express');
const cors = require('cors');
const atsRoutes = require('./routes/atsRoutes')
const app = express();
require('dotenv').config();

//
app.use(cors());
app.use(express.json());
app.use('/', atsRoutes);

//PORT
const port = 3000;

//=====START THE SERVER=====
app.listen(port, () => {
  console.log(`App listening on Port ${port}...`);
});


