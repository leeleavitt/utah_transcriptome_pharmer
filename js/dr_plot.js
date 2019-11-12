
class drPlot{
    constructor(dataSet){
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
		var geneMatrix = this.dataSet

        //Find all genes
        this.genes = geneMatrix.map(d=>d[""])
        //Find all cells
        this.cells = Object.getOwnPropertyNames(geneMatrix[0])
        //First one is to define the gene, so remove it
        this.cells.shift()

		// Doing SVD decomposition in JS
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
        //Trying out PCA straight out of the box
        this.geneMatrix = this.dataSet

        //Find all genes
        this.genes = this.geneMatrix.map(d=>d[""])
        //Find all cells
        this.cells = Object.getOwnPropertyNames(this.geneMatrix[0])
        //First one is to define the gene, so remove it
        this.cells.shift()
        
        //Transform this into an array of Arrays
        this.geneMatrix = this.geneMatrix.map(obj => Object.values(obj))
		//Remove the First value since it is the gene name
		this.geneMatrix = this.geneMatrix.map(d =>{
			d.shift()
			return d
        })
        
        var geneMat = new ML.Matrix(this.geneMatrix)
        geneMat = geneMat.transpose()

        var genePCA = new ML.PCA(geneMat)
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


    }
    createPlot(){
        //SVG to add plot to
        d3.select('#drPlot')
            .append('svg')
            .attr('id','plotSvg')
            .attr('width',this.svgDim.width)
            .attr('height',this.svgDim.height)
        
        //Add a wrapper group
        d3.select('#plotSvg')
            .append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .attr('id','wrapperGroup')

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
        this.cellsGroups = [...new Set(this.cells.map(d => d.slice(0,-2)))];

        this.cellsColorScale = d3.scaleOrdinal(d3.schemeSet2)
            .domain(this.cellsGroups);
        
        //Start constructing the plot
        //PC1
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pc1axis')
            .attr('transform',`translate(${this.margin.left},${this.width - this.margin.top})`)
            .call(pc1Axis)
        
        //PC2
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pc2Axis')
            .attr('transform',`translate(${this.margin.left},${this.margin.bottom})`)
            .call(pc2Axis)

                    //Start constructing the plot
        //PD2
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pd2axis')
            .attr('transform',`translate(${(this.width - this.margin.right)},${this.margin.top})`)
            .call(pd2Axis)
    
        //PD2
        d3.select('#wrapperGroup')
            .append('g')
            .attr('id','pd1Axis')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`)
            .call(pd1Axis)


    }

    drawPlot(){
        //setup the plot
        console.log(this.pComps)

        var cellComp = d3.select('#plotSvg')
            .selectAll('circle')
            .data(this.pComps)
            
        var cellCompEnter = cellComp.enter()
            .append('circle')

        cellComp = cellCompEnter.merge(cellComp)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr('r',10)
            .attr('cx', d=> this.pc1Scale(d.pc1))
            .attr('cy', d=> this.pc2Scale(d.pc2))
            .attr('fill', d=>this.cellsColorScale(d.cell.slice(0,-2)))

        


    }
    
}
