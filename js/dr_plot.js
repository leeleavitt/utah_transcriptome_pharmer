class drPlot{
    constructor(dataSet){
        this.genes = genes
        this.dataSet = dataSet
        console.log(dataSet)
        //this.PCA = require('ml-pca');
        var mydata = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

        //call R function: stats::sd(x=data)
        var req = ocpu.rpc("sd",{
            x : mydata
        }, function(output){
            alert("Standard Deviation equals: " + output);
        });
    }
    

    // dimensionReduction(){
    //     var dr = this.PCA(dataSet)
    // }
}