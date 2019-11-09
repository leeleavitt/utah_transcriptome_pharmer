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

		console.log("All data:");
		console.log(genes);

		//Now we need to figure out how many unique genes there are.
		genesUnique = [...new Set(genes.map(item => item['Gene.name'])) ]

		genesIdUnique = [...new Set(genes.map(item => item['Gene.stable.ID'])) ]

		genesTotalUnique = [... new Set(matchesCSV.map(item => item['Gene.name']))]

		heatmapData = countsCSV.filter(d => genesIdUnique.indexOf(d[""]) > -1);

		console.log(`But there are only ${genesUnique.length} genes within this sampling. Compared with ${genesTotalUnique.length} Total Genes`)

		//////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////
		//I'm following this link for my SVD PCA guidance
		//https://stats.stackexchange.com/questions/134282/relationship-between-svd-and-pca-how-to-use-svd-to-perform-pca


		// Playing with SVD decomposition in JS
		//First rate the heatmapDat and extract only values
		geneMatrix = heatmapData
		//Since this is an array of objects, we need an array of arrays
		geneMatrix = geneMatrix.map(obj => Object.values(obj))
		//Remove the First value since it is the gene name
		geneMatrix = geneMatrix.map(d =>{
			d.shift()
			return d
		})
		//Start the SVD,
		//Do transpose this makes the data frame with cells/samples the rows, and collumns genes/obervations
		//Before transpose we need to center it.
		//This means calculate the mean for each gene and subtract this mean from each gene 
		geneMatrixCentered = geneMatrix.map(d=>{
			//Calcualte the mean of this array
			let colMean = d.reduce((a,b)=>a+b,0)/d.length
			//For each value in the array subtract the mean 
			d = d.map(e=> e - colMean)
			return(d)
		})

		//At this point we need to transform it into a matrix that the SVD can perform on
		geneMatrixCentered = new ML.Matrix(geneMatrixCentered)
		//Now transpose so our samples/cells are the rows, and the genes/features are collumns
		geneMatCentTrans = geneMatrixCentered.transpose()
		
		//Do SVD 
		geneSVD = new ML.SVD(geneMatCentTrans)
		//Now compute the first and second principal components
		//Following this https://en.wikipedia.org/wiki/Biplot
		//Within this description there is the use of an alpha term
		alphaVal = 1
		// principal component 1 = (d_1^a * U1i)
		// principal component 2 = (d_2^a * U2i)
		pc1 = geneSVD.U.data[0].map(d=> d * Math.pow(geneSVD.s[0], alphaVal))
		pc2 = geneSVD.U.data[1].map(d=> d * Math.pow(geneSVD.s[1], alphaVal))
		//Compute the directional components. This is how the genes direct the data
		//Need to determine if i am using the correct region, collumns or row.
		dc1 = geneSVD.V.data[0].map(d=>d*Math.pow(geneSVD.s[0], 1-alphaVal))
		dc2 = geneSVD.V.data[1].map(d=>d*Math.pow(geneSVD.s[1], 1-alphaVal))


		
		//////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////


		let drplot =  new drPlot(heatmapData)

		/* heat map */
		let heatmap = new Heatmap(heatmapData);

		heatmap.createHeatmap();

		/* summary plot */
		let summaryPlotData = matchesCSV.map(d => d["GO.term.name"]).filter(function (e) { return e != "" });
		summaryPlotData = summaryPlotData.slice(0, 200);
		let summaryPlot = new SummaryPlot(summaryPlotData);
		summaryPlot.create();
		summaryPlot.updateSize();

	})
})
