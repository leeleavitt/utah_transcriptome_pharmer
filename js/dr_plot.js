
class drPlot{

    constructor(dataSet){

        // ocpu.seturl("//public.opencpu.org/ocpu/library/base/R")    
        this.genes = genes
        this.dataSet = dataSet
        console.log(dataSet)

        var dataSetArray = dataSet.map(obj => Object.values(obj))
        dataSetArray = dataSetArray.map(d =>{
            let byeVal = d.shift()
            return d
        })
        console.log(dataSetArray)
        
        //Start the SVD 
        
        var vectors = new ML.SVD(dataSetArray);
        console.log(vectors)
        
    }
}