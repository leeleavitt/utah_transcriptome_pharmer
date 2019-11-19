class Setup{
	  constructor(data, heatmapObj, drPlotObj){
      this.data = data;
      this.heatmap = heatmapObj;
      this.drPlot = drPlotObj;
    }

    initial(){

      //Hierarchical Clustering Button
      let clustButtons = d3.select('#buttons')
        .append('div')
        .attr('id','clustButtons');

      clustButtons.append('button')
      .attr('class','btn btn-primary clustButton')
      .attr('id','hClustButton')
      .attr('data-toggle','button')
      .attr('aria-pressed','true')
      .on('click',d => this.heatmap.hClustering())
      .text('Hierarchical Clustering');


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

      let cellButtonHolder = d3.select('#cellButtons')

      cellButtonHolder
        .append('h6')
        .text('Cell Types')

      let cellButton = cellButtonHolder.selectAll('button')
        .data(cellsUnique)

      let cellButtonEnter = cellButton.enter()

      let that = this;

      cellButton = cellButtonEnter.merge(cellButton)
        .append('button')
        .attr('class','btn btn-primary cellButton active')
        .attr('id',d=> `${d}Button`)
        .attr('background-color','red')
        .attr('data-toggle','button')
        .attr('aria-pressed','true')
        .on('click', function(d) {
          that.buttonChecker(d);
          that.heatmap.removeCell(d);
        })
        .text(d=>d)




    }

    //This function update the button logic as well as the pca plot for now
  	buttonChecker(cells){
  		//Get the button clicked
  		let buttonSel = document.getElementById(`${cells}Button`)
  		//Is the button Clicked?
  		let buttonLogic = buttonSel.classList.contains('active')
  		//IF the button is clicked, then change the click logic to false
  		//Else change it to true
  		if(buttonLogic){
  			let buttonPressed = buttonSel.innerText
  			console.log(buttonPressed)
  			cellsLogic.filter(d=>d.cells === buttonPressed)[0].logic = false
  			console.log(cellsLogic.filter(d=>d.cells === buttonPressed))
  		}else{
  			let buttonPressed = buttonSel.innerText
  			cellsLogic.filter(d=>d.cells === buttonPressed)[0].logic = true
  		}

  		console.log(cellsLogic)
  		//Now that we have the button logic figured out, grab the cells that are within
  		//these groups
  		let cellsSelected = cellsLogic.map((d,i)=>{
              if(d.logic){return d.cells}
  		}).filter(d=>d !== undefined)

  		console.log(cellsSelected)

  		//Now that we have updated the logic we need to do the PCA calculation again
  		this.drPlot.pcaCompute(cellsLogic);
  		//drplot.createPlot();
  		this.drPlot.drawPlot();
  		}
    }
