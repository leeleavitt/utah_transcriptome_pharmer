d3.json('data_preprocessing/final_data.json').then(data => {
	/* convert json object to array */
	let dataArray = Object.values(data);
		console.log(dataArray);

		dataArray.slice(0,20);
	
});
