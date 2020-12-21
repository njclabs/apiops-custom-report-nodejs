const cheerio = require('cheerio');             // parse the html page
const path = require ('path');
const fs = require ('fs');
//const util = require('util');


// set the static file path 
const filePath = (path.join(__dirname, 'resource','summary.html'));
//console.log("---> ",filePath);


// Convert callback based methods to promise based methods
////const readFileContent = util.promisify(fs.readFile); 


//const arrIssueList = [];    // store array of objects
var issueCategory ;         // create an object 
const arrError = [];        // list the total errors in each category


// Read a file 
function readSumaryFile(newfile)
{
   // console.log("=readSumaryFile=", newfile)
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8' , (err, html) => {                /// Replace the filePath to the newfile to pass multiple file path"************************",html)
               
            arrIssueList = [];    // store array of objects
            
            const $ = cheerio.load(html);        
        
            // read the content that has the element with class name as 'col-md-8'
            const bodyContent = $('.col-md-offset-1');
            const h2Content = bodyContent.find('h2');
            
            // loop through each element     
            // read all the issues
            (bodyContent).each((index, element) => {
                
            // read all the error headings
                const errorType =  $(element)
                                .find("h2")
                                .text()
                                .replace(/\s\s+/g,'');
                    
            
    
                if(errorType != '' )
                {
                    // console.log(errorType);
                    // console.log("===============");
                    issueCategory = {issue: errorType, num: 0};
                    arrIssueList.push(issueCategory);
                }
                
                var count = 0;    // count the total issues in each category
                // read issues from each table
                const trContent = $(element).find('tr');
                (trContent).each((index, element) => {
                const issueInfo = $(element)
                                .find("td")
                                .text()
                                .replace(/\s\s+/g,' ');
    
    
                    if(issueInfo != '' )
                    {
                        // seperate issue info and number of issue
                        var arrIssue = issueInfo.split(" ");
                        
                        
    
                        // check is the last word in a sentence is a number or not 
                        if (!isNaN(arrIssue[arrIssue.length-1])){                    
                            
                            var issueDes = issueInfo.split(" ").slice(0, -1).join(" ")  ;
                            var issueNum = arrIssue[arrIssue.length-1]  ;                        
                            
                            var issueDesEdit = getInfo(issueDes.trim())
                            issueCategory = {issue: issueDesEdit, num: issueNum};
                            arrIssueList.push(issueCategory);                       // add all the erros as object 
                            
    
                            if (!issueDes.includes('#') && !issueDes.includes('.xml')){
                                count = count + parseInt(issueNum);
                            }
                        }
                    }
                });
    
                arrError.push(count);
        
            });
            //console.log("arrIssueList: ", arrError);

            resolve(arrIssueList )
        });
        // .catch(err => {
        //     console.log("Error: File not found ...")
    });
}

// display the array of objects
function display(arrList){
    // arrList
    console.log("Display array of objects:");
    console.log(arrList);
    
}


// remove the starting hyphen
function getInfo(issueDescription){
    var index = issueDescription.indexOf("-");

    if (index == 0){
        return issueDescription.substr(1, issueDescription.length).trim()
        
    }

    return issueDescription
}



//readSumaryFile(filePath)

// export the module
module.exports = {readSumaryFile}
