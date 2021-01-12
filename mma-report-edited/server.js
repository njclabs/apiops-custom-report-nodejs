const http = require('http');
const fs = require('fs');


// create the server
const server = http.createServer((req, res) => {
    console.log(req.url, req.method);

    // set the header content type
    res.setHeader('Content-Type', 'text/html');

    //send an html file
    fs.readFile('./views/customReport.html', (err,data) => {
        if(err){
            console.log(err);
            res.end();
        }
        else{
           // res.write(data);
            res.end(data);
        }
    })
});

// set the port to listen
server.listen(3000, 'localhost', () => {
    console.log('listening for request on port 3000');
})