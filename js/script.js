//Load in the data from the CSV file
d3.csv("data/go_terms.csv").then(matchesCSV => {

	d3.csv("data/GSE131230_counts_official.csv").then(countsCSV =>{

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

		heatmapData = countsCSV.filter(d => genesIdUnique.indexOf(d[""]) > -1);

		console.log(`But there are only ${genesUnique.length} genes within this sampling. Compared with ${genesTotalUnique.length} Total Genes`)

		//Dimensional Reduction Plot
		let drplot =  new drPlot(heatmapData);
		drplot.svdCompute();
        drplot.createPlot();
        drplot.drawPlot();







		// /* heat map */
		// let heatmap = new Heatmap(heatmapData);

		// heatmap.createHeatmap();

		// /* summary plot */
		// let summaryPlotData = matchesCSV.map(d => d["GO.term.name"]).filter(function (e) { return e != "" });
		// summaryPlotData = summaryPlotData.slice(0, 200);
		// let summaryPlot = new SummaryPlot(summaryPlotData);
		// summaryPlot.create();
		// summaryPlot.updateSize();

	})
})
