const mongoose = require('mongoose');
const Issue = require('./models/dbmodel');          // get the DB model


const connectDB = async() => {
    //const dburi = "mongodb+srv://admin:admin@cluster0.rxrbx.mongodb.net/error?retryWrites=true&w=majority";
    //const dburi = "mongodb+srv://admin:admin@cluster0.egtqg.mongodb.net/error?retryWrites=true&w=majority";
    const dburi = process.env.MONGO_URI;
    mongoose.connect(dburi,{useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false})
        .then((result) => console.log('Connected to DB successfully ... '))
        .catch((err) => console.log(err));
    
}

// get all the collections from the database 
function getAllCollection(){
    return new Promise ((resolve, reject) => {
        var IssueList = [];
        Issue.find({})
            .exec()
            .then((issues) => {
                issues.forEach((issue) => {
                    //console.log(issue);
                    IssueList.push(issue);
                    //console.log("IssueList  =", IssueList);
                })

                //console.log("DB : ", IssueList);
                resolve( IssueList );
            })
            .catch((err) => {
                throw err;
                            
        });

    });

}


// Add new records in the database 
// create an instance of the db
function addSingleCollection(){
    const issueObj = new Issue({
        issue: "No info entries found during migration.",
        time: 0
    });
    issueObj.save()
        .then((result) => console.log(result)) // on success
        .catch((err) => console.log(err));     // on failure
}

function addMultipleCollection(objList){
    Issue.insertMany(objList)
        .then((result) => console.log("Data added to the database"))   // on success
        .catch((err) => console.log(err));                              // on failure
}

// export the module
module.exports = {connectDB, getAllCollection, addMultipleCollection, addSingleCollection}