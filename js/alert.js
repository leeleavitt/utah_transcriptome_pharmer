class UTPAlert {
	constructor() {

	}

	edgeCaseAlert(issue, details) {
		if(issue === undefined) {
			console.log("[Edge Case Alert]");
		} else if (details === undefined) {
			console.log("[Edge Case Alert] (" + issue + ")");
		} else {
			console.log("[Edge Case Alert] (" + issue + "): " + details);
		}
	}
}
