class Heatmap{
	constructor(data){
		this.margin = {top: 100, right: 30, bottom: 30, left: 120};

		this.width = 1500 - this.margin.left - this.margin.right;

		this.height = 900 - this.margin.top - this.margin.bottom;

		this.heatmapData = data.slice(0,50);

		this.cells = Object.keys(this.heatmapData[0]).splice(1);

		this.genes = this.heatmapData.map(d => d[""]);


	}

	createHeatmap() {

		let stretched_data = []
		for (let i = 0; i < this.heatmapData.length; i++){
			let vals = []
			for (let j = 0; j < this.cells.length; j++){
				vals.push(parseFloat(this.heatmapData[i][this.cells[j]]))
			}

			var max = Math.max(...vals);
			var min = Math.min(...vals);

			for (let j = 0; j < this.cells.length; j++){
				stretched_data.push({"gene": this.heatmapData[i][""], "cell": this.cells[j], "value": ((parseFloat(this.heatmapData[i][this.cells[j]]) - min)/(Math.max(1,(max - min))))})
			}
		}
		console.log(stretched_data);

		var svg = d3.select("#heatmap")
			.append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + this.margin.left + "," + this.margin.top + ")");

		let genes_trunc = this.genes.map(d => d.slice(-5));
		console.log(genes_trunc);
		var x = d3.scaleBand()
			.range([ 0, this.width ])
			.domain(this.genes)
			.padding(0.01);

		svg.append("g")
			.attr("transform", "translate(0,0)")
			.call(d3.axisTop(x))
			.selectAll("text")
			.attr("transform","translate(0,-20) rotate(-20)")

		// Build X scales and axis:
		var y = d3.scaleBand()
			.range([ this.height, 0 ])
			.domain(this.cells)
			.padding(0.01);
		svg.append("g")
			.call(d3.axisLeft(y));

		// Build color scale
		var myColor = d3.scaleLinear()
			.range(["white", "#69b3a2"])
			.domain([0,1])

		//Read the data
		svg.selectAll()
			.data(stretched_data)
			.enter()
			.append("rect")
			.attr("x", d => x(d.gene))
			.attr("y", d => y(d.cell))
			.attr("width", x.bandwidth() )
			.attr("height", y.bandwidth() )
			.style("fill", d => myColor(d.value));

	}

	updateHeatmap() {
		return

	}
}
