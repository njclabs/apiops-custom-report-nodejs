const express = require('express');
const dotenv = require('dotenv')                    // for configuration
const bodyParser = require('body-parser');          // this allows us to access req.body.whatever
const path = require('path');

const pdf = require("html-pdf");

const {getArrFilePath} = require("./readDir");      // get the list of files to generate custom report
//const {readSumaryFile} = require("./readSummary");  // read the content from summary.html file 
const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('./db');
//const Issue = require('./models/dbmodel');          // get the DB model

const reportRoutes = require('./routes/reportRoutes'); // get the routes
const dbRoutes = require('./routes/reportDB'); // get the routes
const gitRoutes = require('./routes/gitRoutes');// get the routes

//const rootPath =   'E:/Mule/InputFile'; //'E:/Mule/mule3Convert';                // base root to read the summary.html file from each projects
let fileInfoArr= [];                                // store file name and file path as key value pair
//global.fileInfoArr = [];  


// Load configuration
dotenv.config({path: './config/config.env'})

// create instance of express
const app = express()

// listen to a port 3000 for request by default
// or set dynamic port 
const PORT = process.env.PORT || 3000


app.listen(
    PORT,
    console.log(`Server running on port ${PORT}`)
)

// register ejs as view engine
app.set('view engine', 'ejs');

// middleware for static files
// path to our public directory
app.use(express.static(__dirname+'/public'));
//app.use('/public/images/', express.static(__dirname+'/public/images'));
//app.set('views', path.join(__dirname+'/public'));



//console.log("fileInfoArr ==", fileInfoArr);

// connect to mongoDB database using mongoose module 
connectDB();

// index page
app.get('/', (req, res) => {

    fileInfoArr = [];      // empty the content of an array
    const fileList = getArrFilePath(process.env.SRC_ROOT_PATH)           // get array of all the summary files with path
    //const fileList = Object.keys(getArrFilePath(rootPath))

    // convert object to array
    //https://www.samanthaming.com/tidbits/76-converting-object-to-array/
    const fileArray = Object.entries(fileList);
    // Read each values 
    fileArray.forEach(([key,value])=> {
        let customReportName;
        let fileInfo;                             // store data in json format
        
        // get the project name
        let muleProject = getProjectName(value);
        customReportName =  muleProject + "-summary.html"
        //console.log("customReportName :: ", customReportName)

        fileInfo = {filename: muleProject, filepath:  value};
        fileInfoArr.push(fileInfo)
    }) ; 

    // depending on the type of content it set the header 
    // auomatically infers the status code
    //res.sendFile('./views/index.html', {root: __dirname});
    res.render('index', {title: 'Home', fileList: fileInfoArr, projectname:selectProject});
});

// use report routes
// used only when the resource starts with /report
app.use('/report', reportRoutes)


//app.use(express.bodyParser());
//app.use(bodyParser.urlencoded({ extended: true }));

// use db routes
// used only when the resource starts with /dbIssues
app.use('/dbIssues', dbRoutes);

app.use('/git', gitRoutes);



// Set the display message in the iframe when user opens the page 
app.get('/message', (req, res) => {    
    res.render('message.ejs');
});

// redirects
app.get('/index-pg', (req, res) => {
    res.render('index', {fileList: fileInfoArr});
});

// layout to display or update the issues in MongoDB database
app.get('/issue/update', (req, res) => {    
    res.render('updateDB', {title: 'Access MongoDB'});
});
app.get('/clone', (req, res) => {    
    res.render('gitClone', {title: 'Git Cloning'});
});

// display error 404 page
app.use((req, res) => {
    res.status(404).render('404', {title: '404'})
})

// Return the name of the the project from the given path
function getProjectName(path){
    var splitPath = path.split("\\")
    var index = splitPath.indexOf('report') - 1;  // 
    
    //console.log("splitPath[3] :: ", splitPath[index])
    return splitPath[index]
}
 
