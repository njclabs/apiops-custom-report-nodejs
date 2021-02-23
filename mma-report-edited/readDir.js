const fs = require('fs');
const path = require('path');
//const sourcedir = 'E:/Mule/InputFile';



// Read summary.html file from all the directory in the given root path
function getArrFilePath(sourcedir) {

	let arrFilePath = [];           // Store all the file path in an array
	

	// check if the path exist or not
    if(!fs.existsSync(sourcedir)){
        console.log("Error: Invalid path- ", sourcedir);
        return;
    }

    fs.readdirSync(sourcedir).map(file => {
		const abspath= path.join(sourcedir,  file, "report", 'summary.html'); 	
		//const abspath= path.join(sourcedir, file); 	
		//console.log("file:" , file);

		arrFilePath.push(abspath);
				
		
		// fs.readdirSync(abspath).map(innerFile => {
					
		// 	const absInPath= path.join(abspath, innerFile); 				
		// 	if(innerFile == 'report'){
						
        //         const filePath = path.join(absInPath, 'summary.html');
        //         arrFilePath.push(filePath);
		// 		//console.log("filePath : ", filePath);
						
			
		// 	}
		// });
    });
    

    return arrFilePath
}

// export the module
module.exports = {getArrFilePath}
//console.log(getArrFilePath('E:/Mule/InputFile'))