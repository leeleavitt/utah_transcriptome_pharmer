class Heatmap{
	  constructor(data){
			    this.margin = {top: 100, right: 30, bottom: 30, left: 150};

			    this.width = 1000 - this.margin.left - this.margin.right;

			    this.height = 900 - this.margin.top - this.margin.bottom;

			    this.heatmapDataAll = data;

					this.clusterData = JSON.parse(JSON.stringify(this.heatmapDataAll));

					console.log(this.heatmapDataAll);

			    this.cells = Object.keys(this.heatmapDataAll[0].cell_values);
					this.cells.sort();

					this.selectedCells = Object.keys(this.heatmapDataAll[0].cell_values);
					this.selectedCells.sort();
					this.notSelectedCells = [];
					this.init = false;

			    this.genes = this.heatmapDataAll.map(d => d["Gene.name"]);

					this.newNorm = 'colvalue';

					this.oldrow = null;
					this.oldcol = null;

					this.brushed = this.genes;

					this.expanded = false;

					this.highlightedGenes = [];

					this.geneList = [];


				}

		stretchData(newdata) {
			this.heatmapData = newdata;

			this.stretched_data = [];
			let rowMinMax = {};
			for (let i = 0; i < this.cells.length; i++){
				let rowvals = [];
				rowvals = this.heatmapData.map(d => parseFloat(d.cell_values[this.cells[i]]));

				rowMinMax[this.cells[i]] = [Math.min(...rowvals),Math.max(...rowvals)];
			}

			let allvals = [];
			for (let i = 0; i < this.heatmapData.length; i++){
				for (let j = 0; j < this.cells.length; j++){
									allvals.push(parseFloat(this.heatmapData[i].cell_values[this.cells[j]]));
								}
				}

			let totalmax = Math.max(...allvals);
			let totalmin = Math.min(...allvals);

			for (let i = 0; i < this.heatmapData.length; i++){
							let colvals = []
							for (let j = 0; j < this.cells.length; j++){
												colvals.push(parseFloat(this.heatmapData[i].cell_values[this.cells[j]]));
												allvals.push(parseFloat(this.heatmapData[i].cell_values[this.cells[j]]));
											}

							var colmax = Math.max(...colvals);
							var colmin = Math.min(...colvals);




							for (let j = 0; j < this.cells.length; j++){
												this.stretched_data.push({"gene": this.heatmapData[i]["Gene.name"], "cell": this.cells[j],
																	"colvalue": ((parseFloat(this.heatmapData[i].cell_values[this.cells[j]]) - colmin)/(Math.max(1,(colmax - colmin)))),
																	"rowvalue": ((parseFloat(this.heatmapData[i].cell_values[this.cells[j]]) - rowMinMax[this.cells[j]][0])/(Math.max(1,(rowMinMax[this.cells[j]][1]-rowMinMax[this.cells[j]][0])))),
																	"totalvalue":((parseFloat(this.heatmapData[i].cell_values[this.cells[j]]) - totalmin)/(Math.max(1,(totalmax-totalmin)))),
																	"actualvalue": parseFloat(this.heatmapData[i].cell_values[this.cells[j]])})
											}
						}
		}

	  createHeatmap() {

			this.stretchData(this.heatmapDataAll);

			this.genes = this.heatmapData.map(d => d["Gene.name"]);

	    this.cellsGroups = [...new Set(this.cells.map(d => d.slice(0,-2)))];

	    this.cellsColorScale = d3.scaleOrdinal(d3.schemeSet2)
	        .domain(this.cellsGroups);

	    var svg = d3.select("#heatmap")
	      .append("svg")
	      .attr("width", this.width + this.margin.left + this.margin.right)
	      .attr("height", this.height + 400 + this.margin.top + this.margin.bottom)
				.attr("id","heatmapSVG")
	      .append("g")
				.attr("id","heatmapSVGgroup")
	      .attr("transform",
					            "translate(" + this.margin.left + "," + this.margin.top + ")");

			svg.append('g')
			.attr("id","lineGroup");

		    var x = d3.scaleBand()
		      .range([ 0, this.width ])
		      .domain(this.genes)
		      .padding(0.01);

				svg.append("g")
					.attr("id","xAxis")
			    .call(d3.axisTop(x))
			    .selectAll("text")
					.attr("y",0)
					.attr("x",9)
					.attr("dy",".35em")
			    .attr("transform","translate(0,0) rotate(-90)")
					.attr("text-anchor","start")
					.attr("fill-opacity",1);

				d3.select('#xAxis').selectAll('text').on('click',d => this.sortRows(d));



			// Build X scales and axis:
			var y = d3.scaleBand()
			  .range([0, this.height])
			  .domain(this.cells)
			  .padding(0.01);

			var yAxis = svg.append("g")
			  .attr("id","yAxis")
			  .call(d3.axisLeft(y));

			d3.select('#yAxis')
			  .selectAll('g')
			  .data(this.cells)
			  .insert('rect')
			  .attr("x", -150)
			  .attr("y", -(y.bandwidth()/2))
			  .attr("height", y.bandwidth())
			  .attr("width", 150)
			  .style("fill", d => this.cellsColorScale(d.slice(0,-2)))
			  .attr("opacity",0.2);

			d3.select('#yAxis')
				.append('g')
				.attr("id","cellsHeader")
				.append('text')
				.attr("x",-40)
				.attr("y",-10)
				.attr("font-size",12)
				.attr("fill","black")
				.text('Cell Types');

			let that = this;

			d3.select('#cellsHeader')
				.selectAll('text').on('click',function(){
					let inCells = that.cells.filter(d => that.selectedCells.indexOf(d) !== -1);
					inCells.sort();
					let outCells = that.cells.filter(d => that.selectedCells.indexOf(d) === -1);
					outCells.sort();
					that.cells = inCells.concat(outCells);
					that.updateHeatmap();
				})

			d3.select('#yAxis').selectAll('rect').on('click',d => this.sortCols(d))

			// Build color scale
			this.myColor = d3.scaleLinear()
			  .range(["white", "#69b3a2"])
			  .domain([0,1]);

			this.grayColor = d3.scaleLinear()
			  .range(["white", "#878787"])
			  .domain([0,1]);

			this.redColor = d3.scaleLinear()
				.range(["white", "#fc5b61"])
				.domain([0,1]);


			//Read the data
			  let rectGroup = svg
						.append('g')
						.attr('id','rectGroup');

				this.updateHeatmap();
		}

		// renderSwitch(div, labelText) {
    //   let button = div.append("label").classed("switch").append("input").attr("type", "checkbox").append("span").classed("slider round", true);
		//
    //   return button;
    // }

	  updateHeatmap() {
			let that = this;

			let inCells = this.cells.filter(d => this.selectedCells.indexOf(d) !== -1);

			let outCells = this.cells.filter(d => this.selectedCells.indexOf(d) === -1);
			outCells.sort();
			this.cells = inCells.concat(outCells);


			var x = d3.scaleBand()
				.range([ 0, this.width ])
				.domain(this.genes)
				.padding(0.01);

			var y = d3.scaleBand()
			  .range([0, this.height])
			  .domain(this.cells)
			  .padding(0.01);

			d3.select('#xAxis')
			.transition()
			.duration(1500)
			.call(d3.axisTop(x))
			.selectAll("text")
			.attr("id",d => `xAxisText${d}`)
			.attr("y",0)
			.attr("x",9)
			.attr("dy",".35em")
			.attr("transform","translate(0,0) rotate(-90)")
			.attr("text-anchor","start");


			d3.select('#xAxis').selectAll('text').on('click',d => this.sortRows(d));

			d3.select('#xAxis')
			.selectAll('text')
			.style("font-weight","normal")
			.style("font-size",12)
			.attr("fill-opacity",function() {
				if (that.heatmapData.length <= 120){
					return 1
				}
				return 0
			});

			d3.select(`#xAxisText${this.highlighted}`)
			.attr("fill-opacity",1)
			.style("font-weight","bold")
			.style("font-size",18);

			d3.select('#yAxis')
			.transition()
			.duration(1500)
			.call(d3.axisLeft(y));

			d3.select('#yAxis')
				.selectAll('g')
				.selectAll('rect')
				.style("fill", function(d) {
					if (that.selectedCells.indexOf(d) === -1){
						return "gray";
					}else{
						return that.cellsColorScale(d.slice(0,-2));
					}
				});

			if (that.brushed === null){
				d3.select('#rectGroup')
				.selectAll('rect')
				.data(this.stretched_data)
				.join('rect')
				.transition()
				.duration(1500)
				.attr("x", d => x(d.gene))
				.attr("y", d => y(d.cell))
				.attr("width", x.bandwidth() )
				.attr("height", y.bandwidth() )
				.style("fill", function(d) {
					if (that.selectedCells.indexOf(d.cell) === -1) {
						return that.grayColor(d[that.newNorm]);
					}else if(that.highlighted === d.gene){
						return that.redColor(d[that.newNorm]);
					}else {
						return that.myColor(d[that.newNorm]);
					}
				})
				.attr("opacity", function(d) {
					if (that.selectedCells.indexOf(d.cell) === -1) {
						return 0.3;
					}else if(that.highlighted === d.gene){
						return 1;
					}else{
						return 1;
					}
				})

			}else {
				d3.select('#rectGroup')
				.selectAll('rect')
				.data(this.stretched_data)
				.join('rect')
				.transition()
				.duration(1500)
				.attr("x", d => x(d.gene))
				.attr("y", d => y(d.cell))
				.attr("width", x.bandwidth() )
				.attr("height", y.bandwidth() )
				.style("fill", function(d) {
					if (that.brushed.indexOf(d.gene) === -1) {
						if (that.selectedCells.indexOf(d.cell) === -1) {
							return that.grayColor(d[that.newNorm]);
						}else if(that.highlighted === d.gene){
							return that.redColor(d[that.newNorm]);
						}else{
							return that.grayColor(d[that.newNorm]);
						}
					}else {
						if (that.selectedCells.indexOf(d.cell) === -1) {
							return that.grayColor(d[that.newNorm]);
						}else if(that.highlighted === d.gene){
							return that.redColor(d[that.newNorm])
						}else{
							return that.myColor(d[that.newNorm])
						}
					}
				})
				.attr("opacity", function(d) {
					if (that.brushed.indexOf(d.gene) === -1) {
						if (that.selectedCells.indexOf(d.cell) === -1) {
							return 0.3;
						}else if(that.highlighted === d.gene){
							return 1;
						}else{
							return 0.3;
						}
					} else {
						if (that.selectedCells.indexOf(d.cell) === -1) {
							return 0.3;
						}else if(that.highlighted === d.gene){
							return 1;
						}else{
							return 1;
						}
					}
				})
			}

			if (this.heatmapData.length <= 25) {
				d3.select('#rectGroup').selectAll('text')
					.data(this.stretched_data)
					.join("text")
					.transition()
					.duration(1500)
					.attr("x", d => x(d.gene) + (x.bandwidth()/2))
					.attr("y", d => y(d.cell) + (y.bandwidth()/2))
					.text(d => d.actualvalue)
					.attr("text-anchor","middle")
					.attr("dominant-baseline","middle")
					.attr("class","heatmapText")
					.attr("opacity",1);
				}

			if (this.heatmapData.length > 25) {
				d3.select('#rectGroup').selectAll('text')
					.remove();
			}



				var div = d3.select("body").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);


			d3.select("#rectGroup")
			.selectAll('rect')
			.on("mouseover", d => div.html(this.tooltipRender(d))
																			.style("opacity",1)
																			.style("left", (d3.event.pageX + 10) + "px")
																			.style("top", (d3.event.pageY - 35) + "px"))
			.on("mouseout",d => div.style("opacity",0));

			d3.select("#rectGroup")
			.selectAll('text')
			.on("mouseover", d => div.html(this.tooltipRender(d))
																			.style("opacity",1)
																			.style("left", (d3.event.pageX + 10) + "px")
																			.style("top", (d3.event.pageY - 35) + "px"))
			.on("mouseout",d => div.style("opacity",0));

		if (outCells.length !== 0){
			let lineData = [y(outCells[0])];

			let selection = d3.select('#lineGroup')
			.selectAll('line')
			.data(lineData)
			.join('line')
			.transition()
			.duration(1500)
			.style("stroke","black")
			.style("stroke-width","3px")
			.attr("x1",0)
			.attr("x2",this.width)
			.attr("y1",d => d)
			.attr("y2",d => d);

		}else{
			d3.select('#lineGroup').selectAll('line').remove();
		}

	}

	sortCols(col){
			if (this.oldcol === col){
					this.oldcol = null;
					this.heatmapData = this.heatmapData.sort((a, b) =>
									parseFloat(a.cell_values[col]) < parseFloat(b.cell_values[col]) ? -1 : 1);
					this.clusterData = this.clusterData.sort((a, b) =>
									parseFloat(a.cell_values[col]) < parseFloat(b.cell_values[col]) ? -1 : 1);
					}else {
						this.oldcol = col;
						this.heatmapData = this.heatmapData.sort((a, b) =>
									parseFloat(a.cell_values[col]) > parseFloat(b.cell_values[col]) ? -1 : 1);
						this.clusterData = this.clusterData.sort((a, b) =>
									parseFloat(a.cell_values[col]) > parseFloat(b.cell_values[col]) ? -1 : 1);
					}


			this.sorted = !this.sorted;

			this.genes = this.heatmapData.map(d => d["Gene.name"]);

			this.updateHeatmap();
	}

	sortRows(row) {
			let genes = this.heatmapData.map(d => d["Gene.name"]);

			let gene = JSON.parse(JSON.stringify(this.heatmapData[genes.indexOf(row)]));
			gene = gene.cell_values;

			var sortable = [];
			for (var cell in gene) {
					    sortable.push([cell, parseFloat(gene[cell])]);
					}

			if (row === this.oldrow){
					this.oldrow = null;
					sortable = sortable.sort((a, b) =>
								a[1] < b[1] ? -1 : 1);
					}else {
						this.oldrow = row;
						sortable = sortable.sort((a, b) =>
									a[1] > b[1]  ? -1 : 1);
					}

			this.cells = [];
			for (let i = 0; i < sortable.length; i++){
						this.cells.push(sortable[i][0]);
					}

			this.updateHeatmap();
	}

	tooltipRender(data) {
		    let text = "<h2>" + "Gene: " + data['gene'] + "<br>" + "Cell: " + data['cell'] +
			    "<br>" + "Value: " + data['actualvalue'] + "</h2>";
		    return text;
		  }


	brushHeatmap(brushed) {

		this.brushed = brushed;
		if (brushed === null){
			this.highlighted = '';
		}
		this.updateHeatmap();
	}

	hClustering(){

		if (this.expanded === true){
			d3.select('#yAxis').selectAll('rect').on('click',d => this.sortCols(d))


			d3.select("#hCluster")
			.transition()
			.duration(1500)
			.attr("opacity",0)
			.transition()
			.duration(1)
			.remove();

			d3.select("#heatmapSVGgroup").transition().duration(1500).attr("transform",
										"translate(" + this.margin.left + "," + this.margin.top + ")");
			this.expanded = false;
		}else{
			if (this.expanded === "yes"){
				d3.select("#hCluster").remove().transition().duration(1500);
			}
			this.geneMatrix = this.clusterData.map(d=>Object.values(d.cell_values))

			var geneMat = new ML.Matrix(this.geneMatrix)

			let distMat = ML.distanceMatrix(geneMat.data, ML.Distance.euclidean);

			let bob = ML.HClust.agnes(distMat, {isDistanceMatrix:true})

			// append the svg object above the heatmap
			var svg = d3.select("#heatmapSVG")
				.append("g")
				.attr("id","hCluster")
				.attr("transform","translate(150,0)")
				.attr("opacity",0)
				.transition()
				.duration(1500)
				.attr("opacity",1);

			function separation(a, b) {
			  return a.parent == b.parent ? 1 : 1;
			}

			var cluster = d3.cluster()
				.size([this.width, 250])
				.separation(separation);


			var root = d3.hierarchy(bob, function(d) {
					return d.children;
			});
			cluster(root);

			let nodes = root.descendants().slice(1);

			let endNodes = nodes.filter(d => d.children === undefined);

			endNodes = endNodes.sort((a, b) =>
							parseFloat(a.x) < parseFloat(b.x) ? -1 : 1);

			let indices = endNodes.map(d => d.data.index);

			d3.select("#hCluster").selectAll('path')
				.data( root.descendants().slice(1) )
				.enter()
				.append('path')
				.attr("d", function(d) {
						return "M" + d.x + "," + d.y
										+ "L" + d.x + "," + d.parent.y
										+ " " + d.parent.x + "," + d.parent.y;
									})
				.style("fill", 'none')
				.attr("stroke", '#ccc')
			if (this.heatmapData.length >= 120){
				d3.select("#heatmapSVGgroup").transition().duration(1500).attr("transform","translate(150,410)");
			}else {
				d3.select("#heatmapSVGgroup").transition().duration(1500).attr("transform","translate(150,450)");
			}

			this.newData = [];

			indices.forEach(d => this.newData.push(this.heatmapData[d]))

			this.genes = this.newData.map(d => d["Gene.name"]);

			this.expanded = true;

			d3.select('#yAxis').selectAll('rect').on('click',null);

			this.updateHeatmap();
		}
	}

	clearHClust(){
		console.log("here");
		this.expanded = true;
		d3.select('#hClustButton').classed("active",false);
		this.hClustering();
	}

	removeCell(cellType){
		this.clearHClust();
		this.clusterData = JSON.parse(JSON.stringify(this.heatmapData));

		if (this.cellsGroups.indexOf(cellType) !== -1){
			this.cellsGroups = this.cellsGroups.filter(e => e !== cellType);
		}else{
			this.cellsGroups.push(cellType);
		}

		this.notSelectedCells = this.cells.filter(e => this.cellsGroups.indexOf(e.slice(0,-2)) === -1);

		this.selectedCells = this.cells.filter(e => this.cellsGroups.indexOf(e.slice(0,-2)) !== -1);

		this.init = true;

		for (var i = 0; i < this.clusterData.length; i++){
			for (var j = 0; j < this.notSelectedCells.length; j++){
				delete this.clusterData[i].cell_values[this.notSelectedCells[j]]
			}
		}

		this.updateHeatmap();
	}

	highlightGene(geneName){
		if (this.highlighted === geneName){
			this.highlighted = '';
			this.updateHeatmap();
		}else{
			this.highlighted = geneName;
			this.updateHeatmap();
		}
	}

	setNorm(newNorm){
		this.newNorm = newNorm;
		this.updateHeatmap();
	}

	updateGenes(newGenes){
		this.clearHClust();
		this.geneList = this.geneList.concat(newGenes);
		this.genes = this.geneList;

		let temp = JSON.parse(JSON.stringify(this.heatmapDataAll));
		let newData = temp.filter(d => this.geneList.indexOf(d["Gene.name"]) !== -1);
		this.stretchData(newData);
		this.clusterData = JSON.parse(JSON.stringify(newData));
		for (var i = 0; i < this.clusterData.length; i++){
			for (var j = 0; j < this.notSelectedCells.length; j++){
				delete this.clusterData[i].cell_values[this.notSelectedCells[j]]
			}
		}
		this.updateHeatmap();
	}
}
