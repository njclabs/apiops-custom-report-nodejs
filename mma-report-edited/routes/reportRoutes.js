const express = require("express");
const router = express.Router();                    // create instance of express router
const { start } = require('repl');

const reportController = require('../controllers/reportController');


// get custom report
router.get('/:fileId', reportController.report_display);

// create pdf and download the selected custom page
router.get('/download/:fileId', reportController.report_createPdf);

// export the router
module.exports = router;