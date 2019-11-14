<<<<<<< HEAD
d3.json('data_preprocessing/final_data.json').then(datum => {

		datums = datum
=======
d3.json('data_preprocessing/final_data.json').then(data => {
	/* convert json object to array */
	let dataArray = Object.values(data);
		console.log(dataArray);

		dataArray.slice(0,20);
	
>>>>>>> 606520c4fbf3573ed5e6bf0873e5d7dae0cf625b
});
