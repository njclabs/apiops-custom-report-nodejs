const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');             // parse the html page

// read filepath from the property file
const dotenv = require('dotenv');
const { REFUSED } = require('dns');
dotenv.config({path: './config/config.env'})
const sourcePath = process.env.MULE4_DEST;


// read all the resource html files of a given project
function getHtmlResList(projectName){

   // return new Promise((resolve, reject) => {
        let htmlList = [];              // store all the html file path of a project


        // set path to read files from
        const abspath= path.join(sourcePath,  projectName, "report/resources");

        // check if the path exist or not
        if(!fs.existsSync(abspath)){
            console.log("Error: Invalid path- ", abspath);
            return;
        }

        // read all the html files    
        var files = fs.readdirSync(abspath);
        for(var index=0; index<files.length; index++){
            var subPath = path.join(abspath,files[index])
            // console.log(index, "- " ,subPath);
            htmlList.push(subPath);
        }

        //resolve (htmlList);
        return(htmlList);

    //});
    
} 


// read the resources for each error issues
function readResourceFile(filepath,callback){
   

        console.log("filepath = ", filepath)
        //issueList = [] // store all the issues details with issue location as array of objects
        let issueHrefList = [];
        let issueDetailList = [];
        var issueOnFile, description;

        // Read the html file
        // fs.readFileSync(filepath, 'utf8' , (err, html) => {
            var html = fs.readFileSync(filepath,{encoding:'utf8', flag:'r'});   
             //------------------------
            // fs.readFileSync(filepath, 'utf8' , (err, html) =>     {
            // //console.log("body = ", html)
            const $ = cheerio.load(html);
            

            // // read the header section of the html
            const bodyContent = $('.col-md-8');
            
            const h2Content = bodyContent.find('h2').text();
            //console.log("issueOnFile = ", trimData(h2Content.text()));
            issueOnFile = trimData(h2Content);
            // //console.log("issueOnFile = ", trimData(h2Content));
            console.log("issueOnFile = ", issueOnFile);
            
            description = bodyContent.find('h4:first').text();
            description = trimData(description)
           

            var h4Content = bodyContent.find('h4');
            

            (h4Content).each((index, element) => {
                const description =  $(element)
                                    .find("a")
                                    .attr('href');
                                    
                // add the description only if the content is a string type
                if(typeof(description) == "string" ) {
                
                    issueHrefList.push(description);
                }
            });
            console.log("issueHrefList = ",  issueHrefList);

            // read the body section of the html
            // get all the issues with repective error location
            divContent = bodyContent.find('.col-md-12');

            (divContent).each((index, element) => {
                const errorLoc =  $(element)
                                    .find("h4")
                                    .text()
                                    .replace(/[\n\r]/g, '');
                 

                

                // change all the groups of whitespaces to a single string then trim the result and split it to an array
                var errorLocDetail = errorLoc.replace(/\s+/g, ' ').trim().split(" ");
               

                var preContent = bodyContent.find('pre');
                

                // save the issues in an array
                issueDetail = {Line: errorLocDetail[1], Column: errorLocDetail[3], Detail: preContent.text()};
                issueDetailList.push(issueDetail);
            });
           
        callback(issueOnFile,description, issueHrefList, issueDetailList);
  

}



// get only the required content
function trimData(issueDescription){
    var index = issueDescription.split(":");
    //console.log(index);
    issueDescription = index[1].trim();

    //console.log(issueDescription);
    return issueDescription
}

// test the functions
//getHtmlResList("hello-world");
//readResourceFile("E://Mule//convertGitTOMule4//hello-world//report/resources//warn-HelloWorld-0.html");

// export the module
module.exports = {getHtmlResList, readResourceFile}