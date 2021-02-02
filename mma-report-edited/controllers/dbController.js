const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('../db');
const Issue = require('../models/dbmodel');          // get the DB model


let searchValue = null; // to store the search value
let isRedirectedFromEdit = false; 

/*
* List all the errors from the database
*/
const db_viewAll = (req, res) => {
    var IssueList = [];
    Issue.find({})
        .sort('time')
        .exec()
        .then((issues) => {
            issues.forEach((issue) => {
                //console.log(issue);
                IssueList.push(issue);
                //console.log("IssueList  =", IssueList);
            })

            //console.log("DB : ", IssueList);
            //resolve( IssueList );
            res.render('list-by-time', {dbList: IssueList});
        })
        .catch((err) => {   
            throw err;
                        
        });
}

/*
* List all the errors from the database based on selected time
*/
const db_searchByTime = (req, res) => {
    let inputTime;
    if (isRedirectedFromEdit)
    {
        inputTime = searchValue
        isRedirectedFromEdit = false

    }
    else{
        inputTime = req.body.time;
        searchValue = inputTime
    }
    // save the user input  in a variable
    //const inputTime = req.body.time;
    

    var IssueList = [];
    Issue.find({time: inputTime})
        .exec()
        .then((issues) => {
            issues.forEach((issue) => {
                //console.log(issue);
                IssueList.push(issue);
                //console.log("IssueList  =", IssueList);
            })

            //console.log("DB : ", IssueList);
            //resolve( IssueList );
            res.render('list-by-time', {dbList: IssueList});
        })
        .catch((err) => {   
            throw err;
                        
        });
    
    
}

/*
* List an specific errors 
*/
const db_searchById = (req,res) => {
    Issue.findById(req.params.id)
    .then((result) => {
        console.log("result   ==>", result);
        res.render('edit-time.ejs', {editItem: result});
    })
    .catch((err) => {   
        throw err;
                    
    });  
}

/*
* Update the time based on given ID
*/
const db_editTime = async (req, res) =>  {
    const inputTime = req.body.time;
    console.log("update by id in db : time ===>", req.body.time) 
    console.log("update by id in db : id ===>", req.body.id)
    console.log("update by id in db : pre time ===>", req.body.prevTime)// req.params.id)
    
    let issue = await Issue.findById(req.body.id).lean()

    if(!issue){
         res.status(404).render('404', {title: '404'})
    }
    else{
         issue = await Issue.findByIdAndUpdate({_id: req.body.id}, {time: req.body.time}, {
             runValidators: true
        })

        isRedirectedFromEdit = true
        //res.redirect('list-by-time')
        res.redirect(307, '/dbIssues/time');
    }

}

// export the functions
module.exports = {
    db_viewAll,
    db_searchByTime,
    db_searchById,
    db_editTime
}