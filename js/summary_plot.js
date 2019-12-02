class SummaryPlot {
	/* input an array of go terms, sort go terms by number of occurrences */
	constructor(data) {

		let that = this;
		this.summaryPlotLoc = d3.select("#summaryPlot");

		/* pre process */
		this.clear();
		this.reduceData(data);

		/* set size */
		this.margin = {top: 30, right: 30, bottom: 30, left: 30};
		this.height = 260;
		this.width = 290;

		/* scale */
		this.colorScale = d3.scaleOrdinal()
			.range(d3.schemeSet2);
		this.fontSizeScale = d3.scaleLinear()
			.domain([0, 100])
			.range([0, 100]);

		/* create go term summary */
		this.create();
	}

	setSize(height, width) {
		this.height = height;
		this.width = width;
	}

	/* reduceData(data)
	 * input: data
	 * return: {text, size}
	 * count the number of each element in given data 
	 */
	reduceData(data) {

		let map = new Map();
		let count;
		data.forEach(function(e) {
			count = map.get(e);
			map.set(e, count ? count + 1 : 1);
		});

		map[Symbol.iterator] = function* () {
			yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
		}

		//for (let [key, value] of map) { console.log(key + ' ' + value);}
		//console.log([...map]);              // sorted order
		//console.log([...map.entries()]);    // original insertation order

		this.data = [...map].map(function(d) {
			return {text: d[0], size: d[1]*30};
		});

	}

	create() {
		let width = this.width;
		let height = this.height;
		let that = this;
		that.height = height;
		that.width = width;
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
			let summaryPlotWrap = that.summaryPlotLoc
				.append("div")
				.attr("class", "alert alert-info mx-2")
				.attr("style", "height:363px; margin-bottom:0px");

			summaryPlotWrap
				.append("h5")
				.attr("class", "alert-heading")
				.text("Go Term Summary");

			/* set summary plot */
			summaryPlotWrap
				.append("svg")
				//.attr("viewBox", '0 0 2000 2000')
				.attr("preserveAspectRatio","xMidYMid meet")
				.attr("width", that.width + that.margin.left + that.margin.right)
				.attr("height", that.height + that.margin.top + that.margin.bottom)
				.append("g")
				.attr("id","wordcloud")
				.attr("transform", "translate(" + that.width/2 + "," + that.height/2 + ")")
				.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function(d) { return d.size + "px"; })
				.style("font-family", "Impact")
				.style("fill", function(d) { return that.colorScale(d.size); })
				.attr("text-anchor", "middle")
				.attr("transform", function(d) {
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.text(function(d) { return d.text; });
		}

	}

	clear() {
		this.summaryPlotLoc.selectAll("*").remove();
	}




	/* abandoned functions (need to be delete soon) */
	updateSize() {

		let that = this;
		window.onresize = function(event) {
			let width = document.getElementById('summaryPlot').offsetWidth;
			let height = document.getElementById('summaryPlot').offsetHeight;

			that.summaryPlotLoc.select('svg')
				.attr("width", width + that.margin.left + that.margin.right)
				.attr("height", height + that.margin.top + that.margin.bottom)
			d3.select("#wordcloud")
				.attr("transform", "translate(" + width/2 + "," + height/2 + ")")

		};
	}

	update(data) {
		this.clear();

		this.reduceData(data);
		this.create();

	}


}
