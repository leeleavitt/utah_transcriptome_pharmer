class Setup {
  constructor(data, heatmapObj, drPlotObj) {
    //Total Data Set
    this.data = data;
    this.dataSubset = []
    this.geneSet = this.data.map(d=>d['Gene.name'])
    this.heatmap = heatmapObj;
    this.drPlot = drPlotObj;
    this.newNorm = 'colvalue';
		this.displayedResult;
    //To collecte serached genes into
    this.selectedGenes = [];
    //Select cells based on go terms
    this.goTermsSearchTerms = ['ion channel', 'G-protein']
    this.goTerms = [...new Set( this.data.map(d=>d['GO.term.name']).flat() )]
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

    ////////////////////////////////////////////////////////////
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
    let dataAreaSelect = d3.select('#dataButtons')

		dataAreaSelect.append('div')
			.attr('id', 'dataAreaSelectLabel')
			.classed('c-label', true)
      .append('text')
      .text('PCA Transformations')

		dataAreaSelect.append('div')
			.attr('id', 'dataAreaSelectDropdown');
			//.attr('class', 'selectpicker');

    let dataButtonHolder = d3.select('#dataAreaSelectDropdown');

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
    //Add the Search div to the autofill
    //https://jqueryui.com/autocomplete/
    var geneSearchHolder = d3.select('#buttons')
      .append('div')
      .attr('id', 'geneSearch')


    //I need to Subset this matrix because this.matrixSubsetter() creates this.geneSet
    this.cellOps()
    this.matrixSubsetter()

    //Now make a search bar. This is using jquery
    geneSearchHolder
      .append('div')
      .attr('class','ui-widget')
      .append('label')
      .attr('for','tags')
      .text('Gene Search: ')
      .append('input')
      .attr('id', 'genesSearch')
      .on('keyup', d=>this.geneSearcher(d))

    var gotermSearchHolder = d3.select('#buttons')
      .append('div')
      .attr('id', 'gotermSearch')

    gotermSearchHolder
      .append('div')
      .attr('class','ui-widget')
      .append('label')
      .attr('for','tags')
      .text('Go Term Search: ')
      .append('input')
      .attr('id', 'gotermsSearch')
      .on('keyup', d=>this.goTermSearcher(d))

    //Make a box to contain all searches
    gotermSearchHolder
      .append('div')
      .attr('id', "gotermBucket")
  
    /////////////////////////////////////////////////////////////////
    //SLIDER HOLDER
    var sliderHolder = d3.select('#buttons')
      .append('div')
      .attr('id','sliderHolder')

    var sliderDesc = sliderHolder
      .append('div')
			.attr('class', 'row align-items-center')

		let sliderLabel = sliderDesc.append('div')
												.attr('id', 'sliderLabel')
												.attr('class', 'col-xm-2 mx-3')
												.append('form')
												.attr('class', 'form-inline justify-content-center')
												.append('div')
												.attr('class', 'form-group');

		sliderLabel
      .append('label')
      .attr('for', 'sliderAmountMin')
      .text('Gene Totals:')

		sliderLabel
			.append('input')
			.attr('type', 'text')
			.attr('class', 'form-control-sm mx-sm-1 text-center')
			.attr('style', 'width:6em')
			.attr('id', 'sliderAmountMin');

		sliderLabel
			.append('span')
			.text('-')
		
		sliderLabel
			.append('input')
			.attr('type', 'text')
			.attr('class', 'form-control-sm mx-sm-1 text-center')
			.attr('style', 'width:6em')
			.attr('id', 'sliderAmountMax');
    //   .attr('readonly style', "border:0; color:#f6931f; font-weight:bold;")

    sliderDesc
      .append('div')
      .attr('id', 'slider-range')
			.attr('class', 'col mx-3')
      //.on('mouseup', (d,e)=>this.dataValueSelector(e))

    this.dataSlider()
    this.goTermBucketMaker()
  }

  dataSlider(){
    console.log('hello')
    //////////////////////////////////////////////////////////
    //Data slider
    //to select genes on a slider range
    //Find the most Genes
    //Find the gene totals
    var geneTotals = this.dataSubset.map(d=>{
      let cellVals = Object.values(d.cell_values);
      let cellValsTot = cellVals.reduce((a,b)=>a+b);
      return cellValsTot
    })

    //Determine the range for the slider
    var geneMax = Math.max(...geneTotals)
    var geneMin = Math.min(...geneTotals)

    var that = this
    $('#slider-range').slider({
      range: true,
      min : geneMin,
      max : geneMax,
      values:[50000, geneMax],
      slide : function(event, ui){
        //this.dataValueSelector(ui);
        $( "#sliderAmountMin" ).val(ui.values[ 0 ]);
        $( "#sliderAmountMax" ).val(ui.values[ 1 ]);
      },
      stop: function(event, ui){
        that.dataValueSelector(ui.values)
      }
    });

    $( "#sliderAmountMin" ).val($( "#slider-range" ).slider( "values", 0 ));
    $( "#sliderAmountMax" ).val($( "#slider-range" ).slider( "values", 1 ));

  }

  //This is the function that the slider calls on to subset the data based on the slider values
  dataValueSelector(sliderValues){
    console.log(sliderValues)
    //This takes in my slider values and subsets the data
    this.goTermGeneFinder()
    var subsetData = this.dataSubset.filter(d=>{
      let cellVals = Object.values(d.cell_values)
      let cellValsTot = cellVals.reduce((a,b)=>a+b);
      return cellValsTot >= sliderValues[0] && cellValsTot <= sliderValues[1]
    })
    this.dataSubset = subsetData
    console.log(this.dataSubset)
    //this.cellOps()
    this.matrixSubsetter()
    this.dataOps()
    this.pcaExecutor()

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

      let searchString = $('#genesSearch').focus()
      let searchStringVal = searchString.val();
      let displayedResultContent = that.displayedResult["content"];

      if(that.geneSet.includes(searchStringVal)) { /* check if user select one gene */

				$('#geneContainer>text.' + 'genePlot' + searchStringVal).addClass('selectedSearch');

			} else if(displayedResultContent.length > 0) { /* if multiple selections */

				//d3.selectAll('.selectedSearch').classed('selectedSearch',false);

				//Now change all genes green on the pca plot
				for(let i = 0; i < displayedResultContent.length; i++) {
					let tmpDRC = displayedResultContent[i];
					$('#geneContainer>text.' + 'genePlot' + tmpDRC.value).addClass('selectedSearch');
				}

			} else { /* if no selection */

			}

			/* heatmap */
      //console.log(displayedResultContent.map(d=>d.value))

      that.heatmap.updateGenes(displayedResultContent.map(d=>d.value));

      searchString.val('')
      $('#genesSearch').autocomplete('close')
    }
  }

  geneFinder(){
    
  }
  goTermSearcher(){

    console.log(event)

    let that = this;
		$('#gotermsSearch')
			.autocomplete({
        source : this.goTerms,
				response: function( event, ui ) {
					that.displayedResult = ui;
        },
        minLength : 3
			})
    
    console.log(event)
    if(event.key == 'Enter'){
      $('#gotermsSearch').autocomplete({
				  response: function( event, ui ) {}
			});

      //What was searched?
      var searchString = $('#gotermsSearch').focus()
      //Add it to the Search Terms
      this.goTermsSearchTerms.push(searchString.val());
      console.log(this.goTermsSearchTerms)

      this.goTermBucketMaker()

      //Subset the data based on the newly added gotermSearchTerm
      this.goTermGeneFinder()
      this.dataValueSelector([100000, 500000000])

      //that.heatmap.updateGenes(this.selectedGenes);

      searchString.val('')
      $('#gotermsSearch').autocomplete('close')
    }

  }

  goTermBucketMaker(){
    console.log(this.goTermsSearchTerms)
    var gotermBucket = d3.select('#gotermBucket')
      .selectAll('p')
      .data(this.goTermsSearchTerms)

    var gotermBucketEnter = gotermBucket.enter()
      .append('p')
    
    gotermBucket.exit()
      .style('opacity', 1)
      .transition()
      .duration(1000)
      .style('opacity',0)
      .remove()

    gotermBucket = gotermBucketEnter.merge(gotermBucket)
    
    gotermBucket
      .text(d=>d)
    
    gotermBucket
      .on('click', d=>this.bucketCleaner(d) )

  }

  bucketCleaner(bucketTermRemove){
    //Remove this term
    this.goTermsSearchTerms = this.goTermsSearchTerms.filter(d=> d !== bucketTermRemove)
    //Remake the bucket
    this.goTermBucketMaker()
    //Now find Genes
    this.goTermGeneFinder()
    //Now do the Slider()
    this.dataSlider()
    //Now make new values
    this.dataValueSelector([100000, 500000000])
  }

  //Function which subsets genes based on go terms
  //This creates dataSubset a subset of the larger dataset
  //added to this class
  goTermGeneFinder(){
    //subset the data based on the search Terms
    //this.dataSubset = []
    console.log(this.goTermsSearchTerms)

    for(var i=0; i<this.goTermsSearchTerms.length; i++){
      // Turn this into array
      var dataTotalArray = Object.values(this.data)

      //Filter all genes
      var dataSelect = dataTotalArray.filter(d=>{
        //filter if the array of go terms have a match for the term
        let goTermsVal = d['GO.term.name'].filter(d=>d.match(this.goTermsSearchTerms[i]))
        return goTermsVal.length > 0
      })
      this.dataSubset = this.dataSubset.concat(dataSelect)
    }

    //Remove duplicate genes.
    this.dataSubset = [...new Set(this.dataSubset)]

    //Some Gene values are null so remove them
    this.dataSubset = this.dataSubset.filter(d=>d.cell_values!=null)

    console.log(this.dataSubset)

  }

  //This function update the button logic as well as the pca plot for now
  cellButtonChecker(index, selected, allValues) {
    if(index !== null){
      //Get the button clicked
      let buttonSel = $("select#cellAreaSelectDropdown>option")[index]
      //Is the button Clicked?
      let buttonLogic = selected
      //IF the button is clicked, then change the click logic to false
      //Else change it to true
      if (buttonLogic) {
        let buttonPressed = buttonSel.innerText
        this.cellsLogic.filter(d => d.cells === buttonPressed)[0].logic = true
      } else {
        let buttonPressed = buttonSel.innerText
        this.cellsLogic.filter(d => d.cells === buttonPressed)[0].logic = false
      }

      //Now that we have the button logic figured out, grab the cells that are within
      //these groups
      let cellsSelected = this.cellsLogic.map((d, i) => {
        if (d.logic) { return d.cells }
      }).filter(d => d !== undefined)

      //Now that we have updated the logic we need to do the PCA calculation again
      this.cellOps()
      this.matrixSubsetter()
      this.dataOps()
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
    if (dataSel !== 'dontclear'){
      this.heatmap.clearHClust();
    }
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

    this.selectedVals = this.dataLogic.filter(d => d.logic).map(d => d.dataButtonName)
    this.dataOps()
  }

  dataOps(){
    var selectedVals = this.selectedVals

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

  geneOps(){

  }
  //Function to Subset the cells based on the buttons clicked
  //Should retrun rownames of the data
  cellOps() {
    //Find all cells
    var cells = Object.getOwnPropertyNames(this.dataSubset[0].cell_values)

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
    var geneMatrix = this.dataSubset.map(d => Object.values(d.cell_values))

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
    this.geneSet = this.dataSubset.map(d => d['Gene.name'])
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

        that.dataButtonChecker('dontclear');
      });

      /* active dropdown menu */
      $('#selectpicker_c').selectpicker();
  }

}
