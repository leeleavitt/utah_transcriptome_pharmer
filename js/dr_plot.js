
class drPlot{

    constructor(dataSet){

        // ocpu.seturl("//public.opencpu.org/ocpu/library/base/R")    
        this.genes = genes
        this.dataSet = dataSet
        console.log(dataSet)

        dataSetMat = new ML.Matrix(dataSet)
    
        var data = [[40,50,60],[50,70,60],[80,70,90],[50,60,80]];
        var vectors = new ML.PCA(data);
        console.log(vectors)
        
    }
}