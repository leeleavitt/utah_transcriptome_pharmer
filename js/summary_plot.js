class SummaryPlot {
	constructor(data) {
		let that = this;
		this.data = data.slice(0,50);
		this.data = this.data.map(function(d) {
				return {text: d, size: 10 + Math.random() * 90};
			});

		/* set size */
		this.margin = {top: 100, right: 30, bottom: 30, left: 120};
		this.width = 1500 - this.margin.left - this.margin.right;
		this.height = 900 - this.margin.top - this.margin.bottom;    

		/* scale */
		this.colorScale = d3.scaleOrdinal()
			.range(d3.schemeSet2);
		this.fontSizeScale = d3.scaleLinear()
			.domain([0, 100])
			.range([0, 100]);

	}

	createSummaryPlot() {
		let that = this;
		var layout = d3.layout.cloud()
			.size([that.width, that.height])
			.words(that.data)
			.padding(5)
			.rotate(0)//function() { return ~~(Math.random() * 2) * 90; })
			.font("Impact")
			.fontSize(function(d) { return d.size; })
			.on("end", draw);

		layout.start();

		function draw(words) {
			/* set summary plot */
			d3.select("#summaryPlot")
				.append("svg")
				.attr("width", that.width + that.margin.left + that.margin.right)
				.attr("height", that.height + that.margin.top + that.margin.bottom)
				.append("g")
				.attr("class","wordcloud")
				.attr("transform", "translate(" + that.width/2 + "," + that.height/2 + ")")
				.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function(d) { return d.size + "px"; })
				.style("font-family", "Impact")
				.attr("text-anchor", "middle")
				.attr("transform", function(d) {
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.text(function(d) { return d.text; });
		}
	}

	updateSummaryPlot() {
	}
}
