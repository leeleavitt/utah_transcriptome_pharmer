//Load in the data from the CSV file
d3.csv("data/go_terms.csv").then(matchesCSV => {

	d3.csv("data/GSE131230_counts_official.csv").then(countsCSV =>{

		d3.csv("data/gene_descriptions.csv").then(genesCSV =>{

		console.log(genesCSV);
		var allgenes = [];

		// for (var i = 0; i < genesCSV.length; i++){
		// 	allgenes.push(genesCSV)
		// }









		//These are terms to reduce the data on
		terms = ['ion channel','G-protein']

		//Now we need to obtain genes that match our reducers above
		genes = []
		for(var i=0 ; i< terms.length; i++){
			genesMatch = matchesCSV.filter(d => d["GO.term.name"].match(terms[i])!==null)
			genes = genes.concat(genesMatch)
		}

		//One main issue is that it returns many duplicate genes.
		//Because each gene can be described in a variety of ways.
		console.log(`There are a total of ${genes.length} detected with the terms ${terms}`)

		// console.log("All data:");
		// console.log(genes);

		//Now we need to figure out how many unique genes there are.
		genesUnique = [...new Set(genes.map(item => item['Gene.name'])) ]

		genesIdUnique = [...new Set(genes.map(item => item['Gene.stable.ID'])) ]

		genesTotalUnique = [... new Set(matchesCSV.map(item => item['Gene.name']))]

		data = countsCSV.filter(d => genesIdUnique.indexOf(d[""]) > -1);

		//Now Lets remove columns that are entirly 0
		noZeroData = data.filter(d=>{
			cellsVal = Object.values(d);
			cellsVal.shift();
			var logic = cellsVal.reduce((a,b)=>parseInt(a)+parseInt(b));
			return logic >= 10000
		})

		console.log(`But there are only ${genesUnique.length} genes within this sampling. Compared with ${genesTotalUnique.length} Total Genes`)

		//Dimensional Reduction Plot
		let drplot =  new drPlot(noZeroData, genesUnique);
		drplot.pcaCompute();
        drplot.createPlot();
        drplot.drawPlot();


		// //////////////////////////////////////////////////////
		////THE PROVING GROUND
		/////////////////////////////////////////////////////////
		// geneMatrix = data

		// genes = geneMatrix.map(d=>d[""])
		// cells = Object.getOwnPropertyNames(geneMatrix[0])
		// cells.shift()

		// geneMatrix = geneMatrix.map(obj => Object.values(obj))
		// geneMatrix = geneMatrix.map(d =>{
		// 	d.shift()
		// 	return d
		// })

		// geneMatrixCentered = geneMatrix.map(d=>{
		// 	//Calcualte the mean of this array
		// 	let colMean = d.reduce((a,b)=>a+b,0)/d.length
		// 	//For each value in the array subtract the mean
		// 	d = d.map(e=> e - colMean)
		// 	return(d)
		// })

		// geneMat  = new ML.Matrix(geneMatrix)
		// geneMat = geneMat.transpose()

		// new ML.PCA(geneMat,{scale:true})

		/////////////////////////////////////////////////////////

		/* heat map */
		let heatmap = new Heatmap(data);

		heatmap.createHeatmap();

		/* summary plot */
		let summaryPlotData = matchesCSV.map(d => d["GO.term.name"]).filter(function (e) { return e != "" });
		summaryPlotData = summaryPlotData.slice(0, 200);
		let summaryPlot = new SummaryPlot(summaryPlotData);
		summaryPlot.create();
		summaryPlot.updateSize();

		})
	})
})
