class GeneDescription {

	constructor() {
		//console.log("selectGene");
		//console.log(selectGene);

		//this.drawGeneDescription();
	}

	drawGeneDescription(selectGene) {
		this.selectGene = selectGene;
		this.cleanGeneDescription();
		let that = this;
		$("#geneDescription")
			.append("<p>" + that.selectGene.description + "</p>");

	}

	cleanGeneDescription() {
		$("#geneDescription").empty();
	}

}
