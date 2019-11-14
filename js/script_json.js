d3.json('data_preprocessing/final_data.json').then(datum => {

		datums = datum
		console.log(Object.values(datums));


		let heatmap = new Heatmap(Object.values(datum));

		heatmap.createHeatmap();

//>>>>>>> 08bd5c5132af453119d181d88c1fbea4681f97ae
});
