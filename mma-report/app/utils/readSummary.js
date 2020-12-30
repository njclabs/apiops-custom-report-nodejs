const cheerio = require('cheerio');             // parse the html page
const path = require('path');
const fs = require('fs');
const { html } = require('cheerio');
const util = require('util');
const filePath = (path.join(__dirname, '..', 'resource', 'summary.html'));


var issueCategory;         // create an object 
const arrError = [];        // list the total errors in each category
const readFile = util.promisify(fs.readFile);

// Read a file 
exports.readSumaryFile = async (newfile) => {
    try {
        console.log("Inside try");
        newHtml = await readFile(filePath);
        console.log(newHtml);
        arrIssueList = [];    // store array of objects

        const $ = cheerio.load(newHtml);
        const bodyContent = $('.col-md-offset-1');
        const h2Content = bodyContent.find('h2');
        await (bodyContent).each((index, element) => {

            // read all the error headings
            console.log("Inside html body")
            const errorType = $(element)
                .find("h2")
                .text()
                .replace(/\s\s+/g, '');



            if (errorType != '') {
                console.log(errorType);
                console.log("===============");
                issueCategory = { issue: errorType, num: 0 };
                arrIssueList.push(issueCategory);
            }

            var count = 0;    // count the total issues in each category
            // read issues from each table
            const trContent = $(element).find('tr');
            (trContent).each((index, element) => {
                const issueInfo = $(element)
                    .find("td")
                    .text()
                    .replace(/\s\s+/g, ' ');


                if (issueInfo != '') {
                    // seperate issue info and number of issue
                    var arrIssue = issueInfo.split(" ");



                    // check is the last word in a sentence is a number or not 
                    if (!isNaN(arrIssue[arrIssue.length - 1])) {

                        var issueDes = issueInfo.split(" ").slice(0, -1).join(" ");
                        var issueNum = arrIssue[arrIssue.length - 1];

                        var issueDesEdit = getInfo(issueDes.trim())
                        issueCategory = { issue: issueDesEdit, num: issueNum };
                        arrIssueList.push(issueCategory);                       // add all the erros as object 


                        if (!issueDes.includes('#') && !issueDes.includes('.xml')) {
                            count = count + parseInt(issueNum);
                        }
                    }
                }
            });

            arrError.push(count);
        });
        return arrIssueList;

    } catch (er) {
        return er;
    }
}

// remove the starting hyphen
function getInfo(issueDescription) {
    var index = issueDescription.indexOf("-");

    if (index == 0) {
        return issueDescription.substr(1, issueDescription.length).trim()

    }

    return issueDescription
}
