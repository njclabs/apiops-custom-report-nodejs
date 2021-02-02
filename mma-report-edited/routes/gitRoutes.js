const fs = require('fs');
const path = require('path');
const express = require("express"); 
const shell = require('shelljs');      
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const {childProjects,muleMigration} = require("../mule-migration.js");

dotenv.config({path: './config/config.env'})
const cloneDir = process.env.MULE3_SRC;
const destinationPath = process.env.MULE4_DEST;

const gitRouter = express.Router();   // create new router
gitRouter.use(bodyParser.urlencoded({ extended: true }));

const gitController = require('../controllers/gitController');


// clone the given link in local machine
gitRouter.post('/clone', gitController.git_clone);


// migrate the selected project into mule 4
 gitRouter.post('/migration', gitController.git_migrate);

 
 // export the router
module.exports = gitRouter;