const fs = require('fs');
const path = require('path');
const sourcedir = 'E:/Mule/InputFile';



fs.readdirSync(sourcedir).map(file => {
		const abspath= path.join(sourcedir, file); 	
		//console.log("file:" , file);
				
		
		fs.readdirSync(abspath).map(innerFile => {
					
			const absInPath= path.join(abspath, innerFile); 				
			if(innerFile == 'report'){
						
				const filePath = path.join(absInPath, 'summary.html');
				console.log("filePath : ", filePath);
						
				// fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
							
				// 	if (!err) {
				// 		console.log(`received data: ${i}`);
				// 			i = i + 1;
							
				// 	} else {
				// 		console.log(err);
				// 	}
				// });
			}
		});
	});


/*
 var read = util.promisify(fs.readFile);

 Promis.all([
	 read('data1.txt'),
	 read('data2.txt'),
	 read('data3.txt')
 ])
 .then(data => {
	 const[data1, data2, data3] = data;

	 console.log()data1.toString());
	 console.log()data1.toString());
	 console.log()data1.toString());
 });
*/
