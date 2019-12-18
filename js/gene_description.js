class GeneDescription {

	constructor() {
		//console.log("selectGene");
		//console.log(selectGene);

		//this.drawGeneDescription();
		d3.select("#geneDescription")
			.append("div")
			.attr("id", "geneDescriptionLayout")
	}

	drawGeneDescription(selectGene) {
		this.selectGene = selectGene;
		this.cleanGeneDescription();
		let that = this;
		let re = /\[(.*?)\]/;
		console.log(that.selectGene)
		let content = that.selectGene.description;

		let details = content.replace(re, '');
		let source = content.match(re);

		let tmpGDL = d3.select("#geneDescriptionLayout")
			.attr("class", "alert alert-info mx-2")
			.attr("style", "height:363px; margin-bottom:0px");

		tmpGDL
			.append("h5")
			.attr("class", "alert-heading")
			.text("Gene Description");

		//tmpGDL
		//	.append("div")
		//	.text(content);

		tmpGDL
			.append("div")
			.text(details);

		tmpGDL
			.append("div")
			.attr("class", "font-italic font-weight-light")
			.attr("style", "font-size: smaller")
			.text(source[0]);
		
	
		//Add Go term description to the Gene Description
		let tmpGTD = tmpGDL
			.append('div')
			.attr('id', 'goTermDesc')
		
		let goTermString = ''
		
		that.selectGene['GO.term.name'].map(d=>{ goTermString = goTermString + ' /// '+ d})

		console.log(goTermString)

		tmpGTD
			.append('div')
			.attr("class", "font-weight-light")
			.attr("style", "font-size: xx-small")
			.text(goTermString)

	}

	cleanGeneDescription() {
		$("#geneDescriptionLayout").empty();
		$("#geneDescriptionLayout").removeClass("alert alert-info");
	}

}
