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

		let content = that.selectGene.description;

		let details = content.replace(re, '');
		let source = content.match(re);

		let tmpGDL = d3.select("#geneDescriptionLayout")
			.attr("class", "alert alert-info");

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

	}

	cleanGeneDescription() {
		$("#geneDescriptionLayout").empty();
		$("#geneDescriptionLayout").removeClass("alert alert-info");
	}

}
