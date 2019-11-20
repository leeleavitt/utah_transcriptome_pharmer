class GeneDescription {

	constructor(selectGene) {
		this.selectGene = selectGene;

		console.log("selectGene");
		console.log(selectGene);

		this.drawGeneDescription();
	}

	drawGeneDescription() {
		let that = this;
		$("#geneDescription").empty();
		$("#geneDescription")
			.append("<p>" + that.selectGene.description + "</p>");

	}



}
