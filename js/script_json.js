d3.json('data_preprocessing/final_data.json').then(data => {
	/* convert json object to array */
	dataTotal = Object.values(data);

	//Start the data 
	terms = ['ion channel', 'G-protein']

	genes = []

	for(var i=0; i<terms.length; i++){
		// Turn this into array
		dataTotalArray = Object.values(dataTotal)
		//Filter all genes
		dataSubset = dataTotalArray.filter(d=>{
			//filter if the array of go terms have a match for the term
			let goTermsVal = d['GO.term.name'].filter(d=>d.match(terms[i]))
			return goTermsVal.length > 0
		})
		genes = genes.concat(dataSubset)
	}

	//Remove duplicate genes.
	genes = [...new Set(genes)]

	//Some Gene values are null so remove them
	genes = genes.filter(d=>d.cell_values!=null)

	//Remove data that are completely 0's
	genesNoZeroData = genes.filter(d=>{
		let cellVals = Object.values(d.cell_values)
		let cellValsTot = cellVals.reduce((a,b)=>a+b);
		return cellValsTot >= 0
	})

	/****************************************************************/
	/*									Dimensional Reduction Plot									*/
	/****************************************************************/

	let drplot = new drPlot(genesNoZeroData);
	drplot.pcaCompute();
	drplot.createPlot();
	drplot.drawPlot();


	/****************************************************************/
	/*										  		Heat Map		  											*/
	/****************************************************************/

	//let heatmap = new Heatmap(genes);
	//heatmap.createHeatmap();


	/****************************************************************/
	/*										  		Summary Plot	 											*/
	/****************************************************************/

	/*
	//Get all go terms
	let allGoTerms = [];
	
	genesNoZeroData.forEach((e) => {
		allGoTerms = allGoTerms.concat(e["GO.term.name"]);
	});

	let tmpGoTerms = allGoTerms.slice(0,200)
	let summaryPlot = new SummaryPlot(tmpGoTerms);
	summaryPlot.create();
	summaryPlot.updateSize();
	*/


});
