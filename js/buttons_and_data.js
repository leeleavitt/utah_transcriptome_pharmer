class Setup {
  constructor(data, heatmapObj, drPlotObj) {
    this.data = data;
    this.heatmap = heatmapObj;
    this.drPlot = drPlotObj;
    this.newNorm = 'colvalue';
		this.displayedResult;
  }

  initial() {
    //////////////////////////////////////////////////////////
    //Hierarchical Clustering Buttons
    let clustButtons = d3.select('#clustButtons');

    clustButtons.append('button')
      .attr('class', 'btn btn-primary clustButton')
      .attr('id', 'hClustButton')
      .attr('data-toggle', 'button')
      .attr('aria-pressed', 'true')
      .on('click', d => this.heatmap.hClustering())
      //.on('click', d=>this.hClusterChecker(d))
      .text('Hierarchical Clustering');

    ////////////////////////////////////////////////////////////////////
    //Cell Type Buttons
    //Grab the first cell values, this contains cell types names
    var cells = Object.getOwnPropertyNames(this.data[0].cell_values)
    //Remove the number identifier at the and and obtain a unique set
    var cellsUnique = [...new Set(cells.map(d => d.slice(0, -2)))]

    //Creat a list of cell types objects with logic of the buttons
    this.cellsLogic = []
    cellsUnique.map((d, i) => {
      let cellsUniqueLogic = {}
      cellsUniqueLogic['cells'] = d
      cellsUniqueLogic['logic'] = true
      this.cellsLogic[i] = cellsUniqueLogic
    })

    //Button Time!
    //Append Cell buttons
    let cellAreaSelect = d3.select('#cellButtons');

		cellAreaSelect
			.append('div')
			.attr('id', 'cellAreaSelectLabel')
    	.classed('c-label', true)
      .append('text')
      .text('Select Cell Type/Row');

		cellAreaSelect
			.append('div')
			.append('select')
			.attr('id', 'cellAreaSelectDropdown')
			.attr('class', 'selectpicker')
			//.attr('data-actions-box', 'true')
			.attr('multiple', '');


    let cellButtonHolder = d3.select('#cellAreaSelectDropdown')

    /*cellButtonHolder
      .append('h6')
      .text('Cell Types')*/

    let cellButton = cellButtonHolder.selectAll('option')
      .data(cellsUnique)

    let cellButtonEnter = cellButton.enter()

    let that = this;

    cellButton = cellButtonEnter.merge(cellButton)
      .append('option')
      .attr('id', d => `${d}Button`)
      .on('click', function (d) {
        that.cellButtonChecker(d);
      })
      .text(d => d)

    $('#cellAreaSelectDropdown').selectpicker('refresh');

    $('#cellAreaSelectDropdown')
      .on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        console.log(e)
        console.log(clickedIndex)
        console.log(isSelected)
        console.log(previousValue)
        that.cellButtonChecker(clickedIndex, isSelected, previousValue);
      });
    /////////////////////////////////////////////////////
    //Data Operation Buttons. We need
    // Center
    // Scale
    // Row normalize
    let dropdownWrap = d3.select('#heatmapButtons');

    let cWrap = dropdownWrap.append('div').classed('dropdown-panel', true);

    cWrap.append('div').classed('c-label', true)
        .append('text')
        .text('Normalize Data Over: ');

    cWrap.append('div').attr('id', 'dropdown_c').classed('dropdown', true)
        .append('select').attr('id', 'selectpicker_c').classed('selectpicker', true);

    this.drawDropDown();


    // Collumn normalize
    // Whole Table Normalize
    var dataButtonVals = ['Center', 'Scale', 'Ignore_Zero']

    //Use my logic object technique
    this.dataLogic = []
    dataButtonVals.map((d, i) => {
      let buttonLogic = {}
      buttonLogic['dataButtonName'] = d
      buttonLogic['logic'] = false
      this.dataLogic[i] = buttonLogic
    })

    //Make div for the data button
    let dataButtonHolder = d3.select('#dataButtons')

    dataButtonHolder
      .append('h6')
      .text('PCA Transformations')

    let dataButton = dataButtonHolder.selectAll('button')
      .data(dataButtonVals)

    let dataButtonEnter = dataButton.enter()

    dataButton = dataButtonEnter.merge(dataButton)
      .append('button')
      .attr('class', 'btn btn-secondary dataButton')
      .attr('id', d => `${d}Button`)
      .attr('data-toggle', 'button')
      .text(d => d.replace('_', ' '))
      .on('click', d => {
        that.dataButtonChecker(d)
      })

		/* select all data by default */
    $('#cellAreaSelectDropdown').selectpicker('selectAll');

    //run dataButtonChecker on initialization
    this.dataButtonChecker();

    /////////////////////////////////////////////////////
    //Search Bar with Autofill
    /////////////////////////////////////////////////////
    //Add the Search div to the autofill
    //https://jqueryui.com/autocomplete/
    var SearchHolder = d3.select('#buttons')
      .append('div')
      .attr('id', 'search')

    //I need to Subset this matrix because this.matrixSubsetter() creates this.geneSet
    this.cellOps()
    this.matrixSubsetter()

    //Now make a search bar. This is using jquery
    SearchHolder
      .append('div')
      .attr('class','ui-widget')
      .append('label')
      .attr('for','tags')
      .append('input')
      .attr('id', 'genesSearch')
      .on('keyup', d=>this.geneSearcher(d))

      //This add autofill functionality
  //    $('#genesSearch')
  //      .autocomplete({source : this.geneSet,
	//			  response: function( event, ui ) {
	//				console.log(ui)
	//				}
	//			})

  }

  //This is the function to return whatever has been typed into the searchbar on enter press
	geneSearcher(){
		let that = this;
		$('#genesSearch')
			.autocomplete({source : this.geneSet,
				response: function( event, ui ) {
					that.displayedResult = ui;
				}
			})

    if(event.key == 'Enter'){
      $('#genesSearch').autocomplete({
				  response: function( event, ui ) {}
			});

      var searchString = $('#genesSearch').focus()
      console.log(searchString)
      console.log(searchString.val())
      console.log(that.displayedResult)
      console.log(that.displayedResult["content"])
      let displayedResultContent = that.displayedResult["content"];

			d3.selectAll('.selectedSearch').classed('selectedSearch',false);

			//console.log("list");
			for(let i = 0; i < displayedResultContent.length; i++) {
				let tmpDRC = displayedResultContent[i];
				//console.log(tmpDRC);
				console.log(tmpDRC.value);
				$('#geneContainer>text.' + 'genePlot' + tmpDRC.value).addClass('selectedSearch');
			}

		//	for(let x in displayedResultContent) {
		//		console.log(x);
		//		//console.log(Object.values(x));
		//	}

      searchString.val('')
      $('#genesSearch').autocomplete('close')
    }
  }

  hClusterChecker(d){
    console.log(d)
  }
  //This function update the button logic as well as the pca plot for now
  cellButtonChecker(index, selected, allValues) {
    if(index !== null){
      //Get the button clicked
      let buttonSel = $("select#cellAreaSelectDropdown>option")[index]
      //Is the button Clicked?
      let buttonLogic = selected
      console.log(buttonLogic)
      //IF the button is clicked, then change the click logic to false
      //Else change it to true
      if (buttonLogic) {
        let buttonPressed = buttonSel.innerText
        console.log(buttonPressed)
        this.cellsLogic.filter(d => d.cells === buttonPressed)[0].logic = true
        console.log(this.cellsLogic.filter(d => d.cells === buttonPressed))
      } else {
        console.log(buttonSel.innerText)
        let buttonPressed = buttonSel.innerText
        this.cellsLogic.filter(d => d.cells === buttonPressed)[0].logic = false
      }

      console.log(this.cellsLogic)
      //Now that we have the button logic figured out, grab the cells that are within
      //these groups
      let cellsSelected = this.cellsLogic.map((d, i) => {
        if (d.logic) { return d.cells }
      }).filter(d => d !== undefined)

      console.log(cellsSelected)

      //Now that we have updated the logic we need to do the PCA calculation again
      this.pcaExecutor()


      // Refactored to here!
      let buttonPressed = buttonSel.innerText
      this.heatmap.removeCell(buttonPressed);
    }
  }

  /////////////////////////////////////////////////////////////////////////
  //Data Operations
  ////////////////////////////////////////////////////////////////////////
  dataButtonChecker(dataSel) {
    //clear hierarchical Clustering
    this.heatmap.clearHClust();
    //Change the button logic
    this.dataLogic.map(d => {
      if (d.dataButtonName === dataSel) {
        if (d.logic === true) {
          d.logic = false
        } else {
          d.logic = true
        }
      }
    })

    var selectedVals = this.dataLogic.filter(d => d.logic).map(d => d.dataButtonName)

    bob = selectedVals
    //
    if (selectedVals.includes('Center') && selectedVals.includes('Scale')) {
      //This updates the cells and cells index to work with
      this.cellOps()

      //This subsets the matrix based on cell types
      this.matrixSubsetter()

      //this normalizes the data based on whatever has been chosen.
      this.dataNormalize();

      //THis will take the newly updated this.geneMat and center the matrix
      this.dataCenter()
      this.dataScale()

      //This will do the pca plot now
      this.pcaExecutor()

    } else if (selectedVals.includes('Center')) {
      //This updates the cells and cells index to work with
      this.cellOps()

      //This subsets the matrix based on cell types
      this.matrixSubsetter()

      //this normalizes the data based on whatever has been chosen.
      this.dataNormalize();

      //THis will take the newly updated this.geneMat and center the matrix
      this.dataCenter()

      //This will do the pca plot now
      this.pcaExecutor()

    } else if (selectedVals.includes('Scale')) {
      this.cellOps()

      this.matrixSubsetter()

      //this normalizes the data based on whatever has been chosen.
      this.dataNormalize();

      this.dataScale()

      this.pcaExecutor()
    } else {
      this.cellOps()

      this.matrixSubsetter()

      //this normalizes the data based on whatever has been chosen.
      this.dataNormalize();

      this.pcaExecutor()

    }

  }

  //Function to Subset the cells based on the buttons clicked
  //Should retrun rownames of the data
  cellOps() {
    //Find all cells
    var cells = Object.getOwnPropertyNames(this.data[0].cell_values)

    //Now we need find which match up with the cells in the dataframe
    var cellsGenericNames = cells.map(d => d.slice(0, -2))

    //Unpack the loigc object input to this function
    var cellsSelectedUnpack = this.cellsLogic.filter(d => d.logic).map(d => d.cells)
    //Set it to filter through
    var cellsSelected = new Set(cellsSelectedUnpack)

    //This return the rows of each selected cell type
    var cellsSelectedAll = cellsGenericNames.map((d, i) => {
      if (cellsSelected.has(d)) {
        return i
      }
    }).filter(d => d !== undefined)

    //Now calculate the new cells to work with
    var newCells = []
    for (var i = 0; i < cellsSelectedAll.length; i++) {
      let index = cellsSelectedAll[i]
      newCells[i] = cells[index]
    }

    this.cellsIndex = cellsSelectedAll
    this.cells = newCells
    ////////////////////////////////////////////////////////////////////////////
  }

  //THis subsets the matrix based on what is goin on in cellops
  //Also outputs the genes
  matrixSubsetter() {
    //////////////////////////////////////////////
    //Matrix Ops
    //////////////////////////////////////////////////
    //Extract the cell values out of the matrix
    var geneMatrix = this.data.map(d => Object.values(d.cell_values))

    //Make the array of arrays a matrix
    var geneMat = new ML.Matrix(geneMatrix)
    //Transpose for cells to now be rows
    geneMat = geneMat.transpose()

    //Now Select the rows by cellsSelectedAll above,
    var geneMatNew = []
    for (var i = 0; i < this.cellsIndex.length; i++) {
      let index = this.cellsIndex[i]
      geneMatNew.push(geneMat.data[index])
    }

    ////////////////////////////////////////////////////////////////////////////
    this.geneMat = new ML.Matrix(geneMatNew)
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    //Gene Ops
    this.geneSet = this.data.map(d => d['Gene.name'])
    ////////////////////////////////////////////////////////////////////////////
  }

  dataCenter() {
    ////////////////////////////////////////////////////////////////////////////
    //Center the data. This means to subtract the collumn means
    //Transpose to access the collumns
    var geneMatTmp = this.geneMat.transpose()
    //Calculate and subtract the mean
    let geneMatCentered = geneMatTmp.data.map(d => {
      let colMean = d.reduce((a, b) => a + b) / d.length
      d = d.map(e => e - colMean)
      return (d)
    })

    geneMatCentered = new ML.Matrix(geneMatCentered)
    ////////////////////////////////////////////////////
    geneMatCentered = geneMatCentered.transpose()
    ////////////////////////////////////////////////////
    this.geneMat = geneMatCentered
  }

  dataScale() {
    ////////////////////////////////////////////////////////////////////////////
    //Center the data. This means to subtract the collumn means
    //Transpose to access the collumns
    var geneMatTmp = this.geneMat.transpose()
    //Calculate and subtract the mean
    let geneMatScaled = geneMatTmp.data.map((d, i) => {
      let colstd = math.std([...d])
      d = d.map(e => e / colstd)
      return (d)
    })

    geneMatScaled = new ML.Matrix(geneMatScaled)
    ////////////////////////////////////////////////////
    geneMatScaled = geneMatScaled.transpose()
    ////////////////////////////////////////////////////
    this.geneMat = geneMatScaled
  }

  dataNormalize() {

    if (this.newNorm === 'colvalue'){
      var geneMatTmp = this.geneMat.transpose();
      let geneMatNormed = geneMatTmp.data.map((d, i) => {
        let colmax = math.max([...d])
        let colmin = math.min([...d])
        d = d.map(e => (e - colmin) / (Math.max(1,(colmax - colmin))))
        return (d)
      })
      geneMatNormed = new ML.Matrix(geneMatNormed);

      geneMatNormed = geneMatNormed.transpose()

      this.geneMat = geneMatNormed;

    }else if (this.newNorm === 'rowvalue'){
      let geneMatNormed = this.geneMat.data.map((d, i) => {
        let rowmax = math.max([...d])
        let rowmin = math.min([...d])

        d = d.map(e => (e - rowmin) / (Math.max(1,(rowmax - rowmin))))
        return (d)
      })
      geneMatNormed = new ML.Matrix(geneMatNormed);

      this.geneMat = geneMatNormed;

    }else if (this.newNorm === 'totalvalue'){
      var totmax = 0;
      var totmin = 100;
      for (var i = 0; i < this.geneMat.data.length; i++){
        let rowmax = math.max([...this.geneMat.data[i]]);
        let rowmin = math.min([...this.geneMat.data[i]]);

        if (rowmax > totmax){
          totmax = rowmax;
        }
        if (rowmin < totmin){
          totmin = rowmin;
        }
      }

      let geneMatNormed = this.geneMat.data.map((d, i) => {
        d = d.map(e => (e - totmin) / (Math.max(1,(totmax - totmin))))
        return (d)
      })
      geneMatNormed = new ML.Matrix(geneMatNormed);

      this.geneMat = geneMatNormed;

    }

  }

  pcaExecutor() {
    console.log(this.geneMat);
    this.drPlot.pcaCompute2(this.geneMat, this.cells, this.geneSet)
    this.drPlot.drawPlot()
  }

  drawDropDown() {

      let that = this;
      let dropDownWrapper = d3.select('#heatmapButtons').select('.dropdown-panel');
      let dropData = [['Genes','colvalue'],['Cells','rowvalue'],['Whole Table','totalvalue']];


      /* CIRCLE DROPDOWN */
      let dropC = dropDownWrapper.select('#dropdown_c').select('.selectpicker');

      let optionsC = dropC.selectAll('option')
          .data(dropData);


      optionsC.exit().remove();

      let optionsCEnter = optionsC.enter()
          .append('option')
          .attr('value', (d, i) => d[1]);

      optionsCEnter.append('text')
          .text((d, i) => d[0]);

      optionsC = optionsCEnter.merge(optionsC);

      dropC.on('change', function(d, i) {
        that.newNorm = this.options[this.selectedIndex].value;
        that.heatmap.setNorm(that.newNorm);

        that.dataButtonChecker()
      });

      /* active dropdown menu */
      $('#selectpicker_c').selectpicker();
    }
}
