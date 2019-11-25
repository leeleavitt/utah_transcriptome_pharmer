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
    var dataButtonVals = ['Center','Scale','Ignore_Zero']

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

    /////////////////////////////////////////////////////
    //Search Bar with Autofill
    /////////////////////////////////////////////////////
    var SearchHolder = d3.select('#buttons')
      .append('div')
      .attr('id', 'search')

    SearchHolder
      .append('div')
      .attr('class','ui-widget')
      .append('label')
      .attr('for','tags')
      .append('input')
      .attr('id', 'genesSearch')
      .on('keyup', d=>this.geneSearcher(d))
      .attr('autocomplete',{source : this.geneSet})
      // .append('div')
      // .attr('class','col-md-6')
      // .append('input')
      // .attr('id', 'genesSearch')
      // .attr('class', 'form-control mdb-autocomplete')
      // .attr('type','text')
      // .attr('placeholder', 'Gene Search')
      // .attr('aria-label', 'Search')

      //Iniitialize the genset from the 
  }

  geneSearcher(){
    if(event.key == 'Enter'){
      var searchString = $('#genesSearch')
      console.log(searchString)
      console.log(searchString.val())
    }
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
    //Change the button logic
    this.dataLogic.map(d=>{
      if(d.dataButtonName === dataSel){
        if(d.logic === true){
          d.logic = false
        }else{
          d.logic = true
        }
      }
    })

    var selectedVals = this.dataLogic.filter(d=>d.logic).map(d=>d.dataButtonName)
    console.log(selectedVals)
    bob= selectedVals
    //
    if(selectedVals.includes('Center') && selectedVals.includes('Scale')){
      //This updates the cells and cells index to work with
      this.cellOps()

      //This subsets the matrix based on cell types
      this.matrixSubsetter()

      //THis will take the newly updated this.geneMat and center the matrix
      this.dataCenter()
      this.dataScale()

      //This will do the pca plot now
      this.pcaExecutor()

    }else if( selectedVals.includes('Center') ){
      //This updates the cells and cells index to work with
      this.cellOps()

      //This subsets the matrix based on cell types
      this.matrixSubsetter()

      //THis will take the newly updated this.geneMat and center the matrix
      this.dataCenter()

      //This will do the pca plot now
      this.pcaExecutor()
      
    }else if( selectedVals.includes('Scale')){
      this.cellOps()

      this.matrixSubsetter()

      this.dataScale()

      this.pcaExecutor()
    }else{
      this.cellOps()

      this.matrixSubsetter()

      this.pcaExecutor()

    }

  }

  //Function to Subset the cells based on the buttons clicked
  //Should retrun rownames of the data
  cellOps(){
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

    //Now calculate the new cells to work with
    var newCells = []
    for(var i=0; i<cellsSelectedAll.length; i++){
        let index = cellsSelectedAll[i]
        newCells[i] = cells[index]
    }
    
    this.cellsIndex = cellsSelectedAll
    this.cells = newCells
    ////////////////////////////////////////////////////////////////////////////
  }

  //THis subsets the matrix based on what is goin on in cellops
  //Also outputs the genes
  matrixSubsetter(){
    //////////////////////////////////////////////
    //Matrix Ops
    //////////////////////////////////////////////////
    //Extract the cell values out of the matrix
    var geneMatrix = this.data.map(d=>Object.values(d.cell_values))

    //Make the array of arrays a matrix
    var geneMat = new ML.Matrix(geneMatrix)
    //Transpose for cells to now be rows
    geneMat = geneMat.transpose()

    //Now Select the rows by cellsSelectedAll above,
    var geneMatNew = []
    for(var i=0; i< this.cellsIndex.length; i++){
        let index = this.cellsIndex[i]
        geneMatNew.push(geneMat.data[index])
    }
    
    ////////////////////////////////////////////////////////////////////////////
    this.geneMat = new ML.Matrix(geneMatNew)
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    //Gene Ops
    this.geneSet = this.data.map(d=>d['Gene.name'])
    this.geneArray = [...this.data.map(d=>d['Gene.name'])]
    ////////////////////////////////////////////////////////////////////////////
  }

  dataCenter(){
    ////////////////////////////////////////////////////////////////////////////
    //Center the data. This means to subtract the collumn means
    //Transpose to access the collumns
    var geneMatTmp = this.geneMat.transpose()
    //Calculate and subtract the mean
    let geneMatCentered = geneMatTmp.data.map(d=>{
      let colMean = d.reduce((a,b)=>a+b)/d.length
      d = d.map(e=> e - colMean)
      return(d)
    })

    geneMatCentered = new ML.Matrix(geneMatCentered)
    ////////////////////////////////////////////////////
    geneMatCentered = geneMatCentered.transpose()
    ////////////////////////////////////////////////////
    this.geneMat = geneMatCentered
  }

  dataScale(){
    ////////////////////////////////////////////////////////////////////////////
    //Center the data. This means to subtract the collumn means
    //Transpose to access the collumns
    var geneMatTmp = this.geneMat.transpose()
    //Calculate and subtract the mean
    let geneMatScaled = geneMatTmp.data.map((d,i)=>{
      let colstd = math.std([...d])
      d = d.map(e=> e/colstd)
      return(d)
    })

    geneMatScaled = new ML.Matrix(geneMatScaled)
    ////////////////////////////////////////////////////
    geneMatScaled = geneMatScaled.transpose()
    ////////////////////////////////////////////////////
    this.geneMat = geneMatScaled
  }

  pcaExecutor(){
    this.drPlot.pcaCompute2(this.geneMat, this.cells, this.geneSet)
    this.drPlot.drawPlot()
  }


}






    
