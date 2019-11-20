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
    this.cellsLogic = []
    cellsUnique.map((d,i)=>{
      let cellsUniqueLogic = {}
      cellsUniqueLogic['cells']= d
      cellsUniqueLogic['logic'] = true
      this.cellsLogic[i] = cellsUniqueLogic
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
        that.cellButtonChecker(d);
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
    this.dataLogic = []
    dataButtonVals.map((d,i)=>{
      let buttonLogic = {}
      buttonLogic['dataButtonName'] = d
      buttonLogic['logic'] = false
      this.dataLogic[i] = buttonLogic
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
      .data(dataButtonVals)

    let dataButtonEnter = dataButton.enter()

    dataButton = dataButtonEnter.merge(dataButton)
      .append('button')
      .attr('class','btn btn-secondary dataButton')
      .attr('id', d=>`${d}Button`)
      .attr('data-toggle','button')
      .text(d=>d.replace('_',' '))
      .on('click', d=>{
        that.dataButtonChecker(d)
      })

  }

  //This function update the button logic as well as the pca plot for now
  cellButtonChecker(cells){
    //Get the button clicked
    let buttonSel = document.getElementById(`${cells}Button`)
    //Is the button Clicked?
    let buttonLogic = buttonSel.classList.contains('active')
    //IF the button is clicked, then change the click logic to false
    //Else change it to true
    if(buttonLogic){
      let buttonPressed = buttonSel.innerText
      console.log(buttonPressed)
      this.cellsLogic.filter(d=>d.cells === buttonPressed)[0].logic = false
      console.log(this.cellsLogic.filter(d=>d.cells === buttonPressed))
    }else{
      let buttonPressed = buttonSel.innerText
      this.cellsLogic.filter(d=>d.cells === buttonPressed)[0].logic = true
    }

    console.log(this.cellsLogic)
    //Now that we have the button logic figured out, grab the cells that are within
    //these groups
    let cellsSelected = this.cellsLogic.map((d,i)=>{
            if(d.logic){return d.cells}
    }).filter(d=>d !== undefined)

    console.log(cellsSelected)

    //Now that we have updated the logic we need to do the PCA calculation again
    this.drPlot.pcaCompute(this.cellsLogic);
    //drplot.createPlot();
    this.drPlot.drawPlot();
  }
  
  /////////////////////////////////////////////////////////////////////////
  //Data Operations
  ////////////////////////////////////////////////////////////////////////
  dataButtonChecker(dataSel){
    console.log(dataSel)
    //Find button clicked
    let buttonSel = document.getElementById(`${dataSel}Button`)
    console.log(buttonSel)
    //Is it clicked?
    buttonLogic = buttonSel.classList.contains('active')
    // If button is clicked
    // unclick all other buttons
    if(!buttonLogic){
      //turn off all other buttons
      d3.selectAll('.dataButton').classed('active',false)
      d3.select(`.${dataSel}Button`).classed('active',true)
      //Turn off the logic for everything
      this.dataLogic.map(d=>d.logic = false)
      //Except for the input, keep on
      this.dataLogic[dataSel.dataButtonName] = true
    }

    if(dataSel == 'Center'){
      this.dataCenter()
    }

  }

  dataCenter(){
    //passing in the cellTypesLogic allows us to 
    // Only compute the PCs on these still selected cells

    //Extract the cell values out of the matrix
    var geneMatrix = this.data.map(d=>Object.values(d.cell_values))

    ////////////////////////////////////////////////////////////////////////////
    //Find all genes
    this.geneSet = this.data.map(d=>d['Gene.name'])
    ////////////////////////////////////////////////////////////////////////////
    
    //Find all cells
    var cells = Object.getOwnPropertyNames(this.data[0].cell_values)

    //Now we need find which match up with the cells in the dataframe
    var cellsGenericNames = cells.map(d=>d.slice(0,-2))

    //Unpack the loigc object input to this function
    var cellsSelectedUnpack = this.cellsLogic.filter(d=>d.logic).map(d=>d.cells)
    //Set it to filter through
    var cellsSelected = new Set(cellsSelectedUnpack)

    //This return the rows of each selected cell type
    var cellsSelectedAll = cellsGenericNames.map((d,i)=>{
      if(cellsSelected.has(d)){
        return i
      }
    }).filter(d=>d!==undefined)

    //Make the array of arrays a matrix
    var geneMat = new ML.Matrix(geneMatrix)
    //Transpose for cells to now be rows
    geneMat = geneMat.transpose()

    //Now Select the rows by cellsSelectedAll above,
    var geneMatNew = []
    for(var i=0; i< cellsSelectedAll.length; i++){
        let index = cellsSelectedAll[i]
        geneMatNew.push(geneMat.data[index])
    }
    
    ////////////////////////////////////////////////////////////////////////////
    geneMat = new ML.Matrix(geneMatNew)
    ////////////////////////////////////////////////////////////////////////////

    //Now calculate the new cells to work with
    var newCells = []
    for(var i=0; i<cellsSelectedAll.length; i++){
        let index = cellsSelectedAll[i]
        newCells[i] = cells[index]
    }

    ////////////////////////////////////////////////////////////////////////////  
    var cells = newCells
    ////////////////////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////////////////////
    //Center the data. This means to subtract the collumn means
    //Transpose to access the collumns

    console.log(geneMat.data[1])

    geneMat = geneMat.transpose()
    //Calculate and subtract the mean
    let geneMatCentered = geneMat.data.map(d=>{
      let colMean = d.reduce((a,b)=>a+b)/d.length
      d = d.map(e=> e - colMean)
      return(d)
    })

    geneMatCentered = new ML.Matrix(geneMatCentered)
    ////////////////////////////////////////////////////
    geneMatCentered = geneMatCentered.transpose()
    console.log(geneMatCentered.data[1])
    ////////////////////////////////////////////////////
    this.drPlot.pcaCompute2(geneMatCentered, cells, this.geneSet)
    this.drPlot.drawPlot()
    //drplot.createPlot();
    this.drPlot.drawPlot();

    console.log('hi')
  }


}






    
