
class drPlot{
    constructor(dataSet, heatmap){
        this.heatmapObject = heatmap;
        this.dataSet = dataSet
        this.margin = {top:60, bottom:60, left:60, right:60}
        this.svgDim = {width:1000+this.margin.left+this.margin.right, height:1000+this.margin.top+this.margin.bottom}
        this.width = 1000;
        this.height = 1000;
        console.log
    }

    svdCompute(){
		//I'm following this link for my SVD PCA guidance
		//https://stats.stackexchange.com/questions/134282/relationship-between-svd-and-pca-how-to-use-svd-to-perform-pca
		//First rate the heatmapDat and extract only values
		var geneMatrix = this.dataSet.map(d=>Object.values(d.cell_values))

        //Find all genes
        this.genes = geneMatrix.map(d=>d['Gene.name'])
        //Find all cells
        this.cells = Object.getOwnPropertyNames(geneMatrix[0])

		//Start the SVD,
		//Do transpose this makes the data frame with cells/samples the rows, and collumns genes/obervations
		//Before transpose we need to center it.
		//This means calculate the mean for each gene and subtract this mean from each gene
		var geneMatrixCentered = geneMatrix.map(d=>{
			//Calcualte the mean of this array
			let colMean = d.reduce((a,b)=>a+b,0)/d.length
			//For each value in the array subtract the mean
			d = d.map(e=> e - colMean)
			return(d)
        })

        ////////////////////////////////////////////////////////////
        //Regularize TODO
        ////////////////////////////////////////////////////////////

		//At this point we need to transform it into a matrix that the SVD can perform on
		var geneMatrixCentered = new ML.Matrix(geneMatrixCentered)
		//Now transpose so our samples/cells are the rows, and the genes/features are collumns
		var geneMatCentTrans = geneMatrixCentered.transpose()

		//Do SVD
		var geneSVD = new ML.SVD(geneMatCentTrans)
		//Now compute the first and second principal components
		//Following this https://en.wikipedia.org/wiki/Biplot
		//Within this description there is the use of an alpha term
		var alphaVal = 1
		// principal component 1 = (d_1^a * U1i)
		// principal component 2 = (d_2^a * U2i)
		this.pc1 = geneSVD.U.transpose().data[0].map(d=> d * Math.pow(geneSVD.s[0], alphaVal))
        this.pc2 = geneSVD.U.transpose().data[1].map(d=> d * Math.pow(geneSVD.s[1], alphaVal))

        //Make an object to hold this information
        this.pComps = []
        for(var i=0; i<this.pc1.length;i++){
            var cell = {}
            cell['cell'] =  this.cells[i]
            cell['pc1'] = this.pc1[i]
            cell['pc2'] = this.pc2[i]
            this.pComps[i]=cell
        }

        console.log(this.pComps)

		//Compute the directional components. This is how the genes direct the data
		//Need to determine if i am using the correct region, collumns or row.
		this.pd1 = geneSVD.V.data[0].map(d=>d*Math.pow(geneSVD.s[0], 1-alphaVal))
        this.pd2 = geneSVD.V.data[1].map(d=>d*Math.pow(geneSVD.s[1], 1-alphaVal))

    }

    pcaCompute(){
		this.geneMatrix = this.dataSet.map(d=>Object.values(d.cell_values))

        console.log(this.dataSet)
        //Find all genes
        this.geneSet = this.dataSet.map(d=>d['Gene.name'])
        console.log(this.geneSet)
        //Find all cells
        this.cells = Object.getOwnPropertyNames(this.dataSet[0].cell_values)

        var geneMat = new ML.Matrix(this.geneMatrix)
        geneMat = geneMat.transpose()

        var genePCA = new ML.PCA(geneMat,{center:true, scale:false})
        var principalComps = genePCA.predict(geneMat).transpose()

        this.pc1 = principalComps.data[0]
        this.pc2 = principalComps.data[1]

        this.pComps = []
        for(var i=0; i<this.pc1.length;i++){
            var cell = {}
            cell['cell'] =  this.cells[i]
            cell['pc1'] = this.pc1[i]
            cell['pc2'] = this.pc2[i]
            this.pComps[i]=cell
        }

        console.log(this.pComps)

        var pDirs =  genePCA.U.transpose()

        this.pd1 = pDirs.data[0]
        this.pd2 = pDirs.data[1]

        this.pDims = []
        for(var i=0; i<this.pd1.length; i++){
            var gene = {}
            gene['gene'] = this.geneSet[i]
            gene['pd1'] = this.pd1[i]
            gene['pd2'] = this.pd2[i]
            this.pDims[i] = gene
        }
        console.log(this.pDims)


    }

    createPlot(){
        //SVG to add plot to
        d3.select('#drPlot')
            .append('svg')
            .attr('id','plotSvg')
            .attr('width',this.svgDim.width)
            .attr('height',this.svgDim.height)

        //Add a wrapper group to hold the plot
        d3.select('#plotSvg')
            .append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .attr('id','wrapperGroup')

        // Add a wrapper to hold the Cell Points
        d3.select('#wrapperGroup')
            .append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .attr('id', 'cellContainer')

        // Add a Wrapper to hold the gens for the plot
        d3.select('#wrapperGroup')
            .append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .attr('id', 'geneContainer')

        //Add Brush Holder
        d3.select('#wrapperGroup')
            .append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .attr('id','brushContainer')
        this.createBrush()

        ////////////////////////////////////////////////////////////////////
        //Principal Components scale
        ////////////////////////////////////////////////////////////////////
        //PC1
        var pc1Max = Math.max(...this.pc1)
        var pc1Min = Math.min(...this.pc1)

        this.pc1Scale = d3.scaleLinear()
            .domain([pc1Min, pc1Max])
            .range([0, (this.width - this.margin.left - this.margin.right)])
            .nice();

        var pc1Axis = d3.axisBottom(this.pc1Scale)

        //PC2 SCALE
        var pc2Max = Math.max(...this.pc2)
        var pc2Min = Math.min(...this.pc2)

        this.pc2Scale = d3.scaleLinear()
            .domain([pc2Min, pc2Max])
            .range([0, (this.height- this.margin.top - this.margin.bottom)])
            .nice();

        var pc2Axis = d3.axisLeft(this.pc2Scale)

        ////////////////////////////////////////////////////////////////
        //Principal Directions scale
        ////////////////////////////////////////////////////////////////
        //PD1 Scale
        var pd1Max = Math.max(...this.pd1)
        var pd1Min = Math.min(...this.pd1)

        this.pd1Scale = d3.scaleLinear()
            .domain([pd1Min, pd1Max])
            .range([0, (this.height - this.margin.top - this.margin.bottom)])

        var pd1Axis = d3.axisTop(this.pd1Scale)

        //PD2 Scale
        var pd2Max = Math.max(...this.pd2)
        var pd2Min = Math.min(...this.pd2)

        this.pd2Scale = d3.scaleLinear()
            .domain([pd2Min, pd2Max])
            .range([0, (this.width - this.margin.left - this.margin.right)])

        var pd2Axis = d3.axisRight(this.pd2Scale)

        ///////////////////////////////////////////////////////////////
        //Color scale for the cells
        ///////////////////////////////////////////////////////////////
        console.log(this.cells)
        this.cellsGroups = [...new Set(this.cells.map(d => d.slice(0,-2)))];

        this.cellsColorScale = d3.scaleOrdinal(d3.schemeSet2)
            .domain(this.cellsGroups);

        //Start constructing the plot
        //PC1 X axis/ BOTTOM
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pc1axis')
            .attr('transform',`translate(${this.margin.left},${this.height - this.margin.top})`)
            .call(pc1Axis)

        d3.select('#wrapperGroup')
            .append('text')
            .attr('x', (this.width+this.margin.left)/2)
            .attr('y', (this.height-this.margin.top+40))
            .text('PC1')

        //PC2 y axis / LEFT
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pc2Axis')
            .attr('transform',`translate(${this.margin.left},${this.margin.bottom})`)
            .call(pc2Axis)

        d3.select('#wrapperGroup')
            .append('text')
            .attr('x', this.margin.left - 60 )
            .attr('y', (this.height - this.margin.top)/2)
            .text('PC2')


        //PD2
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pd2axis')
            .attr('transform',`translate(${(this.width - this.margin.right)},${this.margin.top})`)
            .call(pd2Axis)

        d3.select('#wrapperGroup')
            .append('text')
            .attr('x', (this.width - this.margin.left + 40))
            .attr('y', (this.height - this.margin.top)/2)
            .text('PD2')

        //PD1
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pd1Axis')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .call(pd1Axis)

        d3.select('#wrapperGroup')
            .append('text')
            .attr('y', this.margin.top - 40)
            .attr('x', (this.width - this.margin.left)/2)
            .text('PD1')


    }

    createBrush(){
        var geneBrush = d3.brush()
            .extent([ [0, 0], [this.width-this.margin.left-this.margin.right,this.height-this.margin.top-this.margin.bottom] ])
            .on('end', this.updateGenes.bind(this))

        d3.select('#brushContainer').append('g').call(geneBrush)


    }

    updateGenes(){
        console.log(this)
        var brushDims = d3.event.selection
        var pD1s = this.pDims.filter(d=>{
            return this.pd1Scale(d.pd1) >= brushDims[0][0] && this.pd1Scale(d.pd1) <= brushDims[1][0]
            })

        var pD2s = this.pDims.filter(d=>{
            return this.pd2Scale(d.pd2) >= brushDims[0][1] && this.pd2Scale(d.pd2) <= brushDims[1][1]
        })
        var pD1sgenes = pD1s.map(d=>d.gene)
        var pD2sgenes = pD2s.map(d=>d.gene)

        console.log(pD1sgenes.concat(pD2sgenes))
				this.heatmapObject.brushHeatmap(pD1sgenes.concat(pD2sgenes));
				/* create new summary */
				let allGoTerms = [];
				let currentData = pD1sgenes.concat(pD2sgenes);
				this.dataSet.filter(gene => {
					if(currentData.includes(gene['Gene.name'])) {
						allGoTerms = allGoTerms.concat(gene['GO.term.name']);
					}
				})

				//console.log("selectData:");
				//console.log(allGoTerms);

			  let summaryPlot = new SummaryPlot(allGoTerms);
    }

    drawPlot(){
        //Plot the cells
        console.log(this.pComps)

        var cellComp = d3.select('#cellContainer')
            .selectAll('circle')
            .data(this.pComps)

        var cellCompEnter = cellComp.enter()
            .append('circle')

        cellComp = cellCompEnter.merge(cellComp)
            //.attr('transform', `translate(${this.margin.left+this.margin.right},${this.margin.top+this.margin.bottom})`)
            .attr('r',10)
            .attr('cx', d=> this.pc1Scale(d.pc1))
            .attr('cy', d=> this.pc2Scale(d.pc2))
            .attr('fill', d=>this.cellsColorScale(d.cell.slice(0,-2)))

        //Plot the Genes
        console.log(this.pDims)

        var geneComp = d3.select('#geneContainer')
            .selectAll('text')
            .data('text')
            .data(this.pDims)

        var geneCompEnter = geneComp.enter()
            .append('text')

        geneComp = geneCompEnter.merge(geneComp)
            //.attr('transform', `translate(${this.margin.left+this.margin.right},${this.margin.top+this.margin.bottom})`)
            .attr('font-size', 10)
            .attr('opacity', .2)
            .attr('x', d=> this.pd1Scale(d.pd1))
            .attr('y', d=> this.pd2Scale(d.pd2))
            .text(d=>d.gene)


    }

}
