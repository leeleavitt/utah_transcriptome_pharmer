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
		d3.select("#geneDescriptionLayout")
			.attr("class", "alert alert-info")
			.append("div")
			.text(that.selectGene.description);

	}

	cleanGeneDescription() {
		$("#geneDescriptionLayout").empty();
		$("#geneDescriptionLayout").removeClass("alert alert-info");
	}

}
