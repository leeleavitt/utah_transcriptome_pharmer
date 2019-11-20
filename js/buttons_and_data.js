class Setup{
	  constructor(data, heatmapObj, drPlotObj){
      this.data = data;
      this.heatmap = heatmapObj;
      this.drPlot = drPlotObj;
    }

    initial(){
      //////////////////////////////////////////////////////////
      //Hierarchical Clustering Buttons
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

      ////////////////////////////////////////////////////////////////////
      //Cell Type Buttons
      //Grab the first cell values, this contains cell types names
      var cells = Object.getOwnPropertyNames(this.data[0].cell_values)
      //Remove the number identifier at the and and obtain a unique set
      var cellsUnique = [...new Set(cells.map(d=>d.slice(0,-2)))]

      //Creat a list of cell types objects with logic of the buttons
      var cellsLogic = []
      cellsUnique.map((d,i)=>{
        let cellsUniqueLogic = {}
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
      /////////////////////////////////////////////////////
      //Data Operation Buttons. We need
      // Center
      // Scale
      // Row normalize
      // Collumn normalize
      // Whole Table Normalize
      var dataButtonVals = ['Center','Scale','Row_Normalize', 'Collumn_Normalize', 'Whole_Table_Normalize']

      //Use my logic object technique
      var datasLogic = []
      dataButtonVals.map((d,i)=>{
        let buttonLogic = {}
        buttonLogic['dataButton'] = d
        buttonLogic['logic'] = false
        dataLogic[i] = buttonLogic
      })

      //Make div for the data button
      d3.select('#buttons')
        .append('div')
        .attr('id', 'dataButtons')

      let dataButtonHolder = d3.select('#dataButtons')

      dataButtonHolder
        .append('h6')
        .text('Data Transformations')

      let dataButton = dataButtonHolder.selectAll('button')
        .data(datasLogic)

      let dataButtonEnter = dataButton.enter()

      databutton = dataButtonEnter.merge(dataButton)
        .append('button')
        .attr('class','btn btn-secondary dataButton active')
        .attr('id', d=>`${d}Button`)
        .attr('data-toggle','button')
        .on('click', function(d) {
          that.buttonChecker(d);
          that.heatmap.removeCell(d);
        })
        .text(d=>d.replace('_',' '))
        .on('click', d=>{
          print(d)
        })


      


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
    
    /////////////////////////////////////////////////////////////////////////
    //Data Operations
    ////////////////////////////////////////////////////////////////////////
    






    
    }
