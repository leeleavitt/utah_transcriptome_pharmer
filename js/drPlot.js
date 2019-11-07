class drPlot{
    constructor(genes, dataSet){
        this.genes = genes
        this.dataSet = dataSet
        console.log(genes)
        console.log(dataSet)
        this.PCA = require('ml-pca');

    }

    dimensionReduction(){
        var dr = this.PCA(dataSet)

    }
}