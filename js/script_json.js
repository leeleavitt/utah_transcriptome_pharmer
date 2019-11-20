d3.json('data_preprocessing/final_data.json').then(data => {
	/* convert json object to array */
	dataTotal = Object.values(data);
	//////////////////////////////////////////////////////////
	//Data Subsetting
	//////////////////////////////////////////////////////////
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
		return cellValsTot >= 50000
	})

	///////////////////////////////////////////////////
	//Grab the first cell values, this contains cell types names
	cells = Object.getOwnPropertyNames(dataTotal[0].cell_values)
	//Remove the number identifier at the and and obtain a unique set
	cellsUnique = [...new Set(cells.map(d=>d.slice(0,-2)))]

	//Creat a list of cell types objects with logic of the buttons
	cellsLogic = []
	cellsUnique.map((d,i)=>{
		cellsUniqueLogic = {}
		cellsUniqueLogic['cells']= d
		cellsUniqueLogic['logic'] = true
		cellsLogic[i] = cellsUniqueLogic
	})
	
	//Button Time!
	//Append Cell buttons
	d3.select('#buttons')
		.append('div')
		.attr('id','cellButtons')
	
	cellButtonHolder = d3.select('#cellButtons')

	cellButtonHolder
		.append('h6')
		.text('Cell Types')
	
	cellButton = cellButtonHolder.selectAll('button')
		.data(cellsUnique)

	cellButtonEnter = cellButton.enter()

	cellButton = cellButtonEnter.merge(cellButton)
		.append('button')
		.attr('class','btn btn-outline-primary cellButton active')
		.attr('id',d=> `${d}Button`)
		.attr('background-color','red')
		.attr('data-toggle','button')
		.attr('aria-pressed','true')
		.on('click', d=> buttonChecker(d))
		.text(d=>d)

	///////////////////////////////////////////////////

	/****************************************************************/
	/*										  		Heat Map		  											*/
	/****************************************************************/
	let heatmap = new Heatmap(genesNoZeroData);
	heatmap.createHeatmap();
	/****************************************************************/
	/*									Dimensional Reduction Plot									*/
	/****************************************************************/
	let drplot = new drPlot(genesNoZeroData, heatmap);
	drplot.pcaCompute(cellsLogic);
	drplot.createPlot();
	drplot.drawPlot();
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

	///////////////////////////////////////////////////
	//Add Buttons for cell selection
	///////////////////////////////////////////////////
	
	//This function update the button logic as well as the pca plot for now
	buttonChecker = function(cells){
		//Get the button clicked
		buttonSel = document.getElementById(`${cells}Button`)
		//Is the button Clicked?
		buttonLogic = buttonSel.classList.contains('active')
		//IF the button is clicked, then change the click logic to false
		//Else change it to true
		if(buttonLogic){
			buttonPressed = buttonSel.innerText
			console.log(buttonPressed)
			cellsLogic.filter(d=>d.cells === buttonPressed)[0].logic = false
			console.log(cellsLogic.filter(d=>d.cells === buttonPressed))
		}else{
			buttonPressed = buttonSel.innerText
			cellsLogic.filter(d=>d.cells === buttonPressed)[0].logic = true
		}

		console.log(cellsLogic)
		//Now that we have the button logic figured out, grab the cells that are within
		//these groups 
		cellsSelected = cellsLogic.map((d,i)=>{
            if(d.logic){return d.cells}
		}).filter(d=>d !== undefined)
		
		console.log(cellsSelected)

		//Now that we have updated the logic we need to do the PCA calculation again
		drplot.pcaCompute(cellsLogic);
		//drplot.createPlot();
		drplot.drawPlot();
		}




	///////////////////////////////////////////////////////
	//PROVING GROUND
	//////////////////////////////////////////////////////
	//Testing out the hcluster method
	geneMatrix = genesNoZeroData.map(d=>Object.values(d.cell_values))

	//Find all genes
	geneSet = genesNoZeroData.map(d=>d['Gene.name'])
	console.log(geneSet)
	//Find all cells
	cells = Object.getOwnPropertyNames(genesNoZeroData[0].cell_values)
	console.log(cells)

	geneMat = new ML.Matrix(geneMatrix)
	geneMat = geneMat.transpose()

	//COmpute the euclidean distance matrix for the clustering
	geneMatDistEuc = ML.distanceMatrix(geneMat.transpose().data, ML.Distance.euclidean)
	
	//Now compute the agnes heirarchal clsutering
	bob = ML.HClust.agnes(geneMatDistEuc, {isDistanceMatrix:true})


	//////////////////////////////////////////////////////

});
