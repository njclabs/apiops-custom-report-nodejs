const express = require("express"); 
const bodyParser = require('body-parser');
const routerdb = express.Router();   // create new router

const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('../db');
// const Issue = require('../models/dbmodel');          // get the DB model

const dbController = require('../controllers/dbController');

let searchValue = null; // to store the search value
let isRedirectedFromEdit = false; 


// find operation to retrieve all the records from the mongodb
routerdb.get('/viewAll', dbController.db_viewAll);

//app.use(express.bodyParser());
routerdb.use(bodyParser.urlencoded({ extended: true }));

// Show issue list based on user input "time"
// GET /dnIssues/time
routerdb.post('/time', dbController.db_searchByTime);


// Show issue edit page
// GET /dnIssues/time/:id
routerdb.get('/time/:id', dbController.db_searchById);


routerdb.use(bodyParser.urlencoded({ extended: true }));

// update the time to resolve the issue
// POST /dbIssues/edit
routerdb.post('/edit', dbController.db_editTime);

// export the router
module.exports = routerdb;

