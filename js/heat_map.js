class Heatmap{
  constructor(data){
    this.margin = {top: 100, right: 30, bottom: 30, left: 150};

    this.width = 1500 - this.margin.left - this.margin.right;

    this.height = 900 - this.margin.top - this.margin.bottom;

    this.heatmapData = data.slice(0,100);

    this.cells = Object.keys(this.heatmapData[0]).splice(1);

    this.genes = this.heatmapData.map(d => d[""]);
  }

  createHeatmap() {

    this.cellsGroups = [...new Set(this.cells.map(d => d.slice(0,-2)))];

    let cellsColorScale = d3.scaleOrdinal(d3.schemeSet2)
        .domain(this.cellsGroups);

    let stretched_data = [];

    for (let i = 0; i < this.heatmapData.length; i++){
      let vals = []
      for (let j = 0; j < this.cells.length; j++){
        vals.push(parseFloat(this.heatmapData[i][this.cells[j]]))
      }

      var max = Math.max(...vals);
      var min = Math.min(...vals);

      for (let j = 0; j < this.cells.length; j++){
        stretched_data.push({"gene": this.heatmapData[i][""], "cell": this.cells[j],
        "value": ((parseFloat(this.heatmapData[i][this.cells[j]]) - min)/(Math.max(1,(max - min)))), "actualValue": parseFloat(this.heatmapData[i][this.cells[j]])})
      }
    }

    var svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");

  let genes_trunc = this.genes.map(d => d.slice(-5));

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
  .range([0, this.height])
  .domain(this.cells)
  .padding(0.01);

var yAxis = svg.append("g")
  .attr("id","yAxis")
  .call(d3.axisLeft(y));

yAxis.selectAll('text')
  .attr("class","t1");

d3.select('#yAxis')
  .selectAll('g')
  .data(this.cells)
  .insert('rect')
  .attr("x", -150)
  .attr("y", -(y.bandwidth()/2))
  .attr("height", y.bandwidth())
  .attr("width", 150)
  .style("fill", d => cellsColorScale(d.slice(0,-2)))
  .attr("opacity",0.5);


// Build color scale
var myColor = d3.scaleLinear()
  .range(["white", "#69b3a2"])
  .domain([0,1])


  d3.select(".tooltip").remove();

  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


//Read the data
  svg.selectAll()
      .data(stretched_data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.gene))
      .attr("y", d => y(d.cell))
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", d => myColor(d.value))
      .on("mouseover", d => div.html(this.tooltipRender(d))
                              .style("opacity",1)
                              .style("left", (d3.event.pageX + 10) + "px")
                              .style("top", (d3.event.pageY - 35) + "px"))
      .on("mouseout",d => div.style("opacity",0));

  }

  updateHeatmap() {
    return

  }


tooltipRender(data) {
    let text = "<h2>" + "Gene: " + data['gene'] + "<br>" + "Cell: " + data['cell'] +
    "<br>" + "Value: " + data['actualValue'] + "</h2>";
    return text;
  }
}
//Version of createHeatmap where you get the average for each cell type. Talk to Lee about possibly implementing this if the current
//version seems too cumbersome.

// createHeatmap() {
//   const average = arr => arr.reduce( ( p,c) => p + c, 0) / arr.length;
//
//   this.cellsGroups = [...new Set(this.cells.map(d => d.slice(0,-2)))];
//
//   let cellsColorScale = d3.scaleOrdinal(d3.schemeSet2)
//       .domain(this.cellsGroups);
//
//   let stretched_data = [];
//
//   for (let i = 0; i < this.heatmapData.length; i++){
//     let vals = []
//     let group = 0;
//     let nextgroup = null;
//     let groupvals = [];
//     for (let j = 0; j < this.cells.length; j++){
//       groupvals.push(parseFloat(this.heatmapData[i][this.cells[j]]))
//       if (j !== this.cells.length-1){
//         nextgroup = this.cellsGroups.indexOf(this.cells[j+1].slice(0,-2));
//       } else{
//         vals.push(average(groupvals));
//         group = nextgroup;
//         groupvals = [];
//       }
//       if (nextgroup !== group) {
//         vals.push(average(groupvals));
//         group = nextgroup;
//         groupvals = [];
//       }
//
//     }
//     console.log(vals);
//     var max = Math.max(...vals);
//     var min = Math.min(...vals);
//
//     for (let j = 0; j < this.cellsGroups.length; j++){
//       stretched_data.push({"gene": this.heatmapData[i][""], "cell": this.cellsGroups[j], "value": ((vals[j] - min)/(Math.max(1,(max - min))))})
//     }
//   }
//   console.log(stretched_data);
//
//   var svg = d3.select("#heatmap")
//     .append("svg")
//     .attr("width", this.width + this.margin.left + this.margin.right)
//     .attr("height", this.height + this.margin.top + this.margin.bottom)
//     .append("g")
//     .attr("transform",
//           "translate(" + this.margin.left + "," + this.margin.top + ")");
//
// let genes_trunc = this.genes.map(d => d.slice(-5));
//
//   var x = d3.scaleBand()
//     .range([ 0, this.width ])
//     .domain(this.genes)
//     .padding(0.01);
//
// svg.append("g")
//   .attr("transform", "translate(0,0)")
//   .call(d3.axisTop(x))
//   .selectAll("text")
//   .attr("transform","translate(0,-20) rotate(-20)")
//
// // Build X scales and axis:
// var y = d3.scaleBand()
// .range([0, this.height])
// .domain(this.cellsGroups)
// .padding(0.01);
//
// var yAxis = svg.append("g")
// .attr("id","yAxis")
// .call(d3.axisLeft(y));
//
// yAxis.selectAll('text')
// .attr("class","t1");
//
// d3.select('#yAxis')
// .selectAll('g')
// .data(this.cells)
// .insert('rect')
// .attr("x", -150)
// .attr("y", -(y.bandwidth()/2))
// .attr("height", y.bandwidth())
// .attr("width", 150)
// .style("fill", d => cellsColorScale(d.slice(0,-2)))
// .attr("opacity",0.5);
//
//
// // Build color scale
// var myColor = d3.scaleLinear()
// .range(["white", "#69b3a2"])
// .domain([0,1])
//
// //Read the data
// svg.selectAll()
//     .data(stretched_data)
//     .enter()
//     .append("rect")
//     .attr("x", d => x(d.gene))
//     .attr("y", d => y(d.cell))
//     .attr("width", x.bandwidth() )
//     .attr("height", y.bandwidth() )
//     .style("fill", d => myColor(d.value));
//
// }
