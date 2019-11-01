//Load in the data from the CSV file
d3.csv("data/go_terms.csv").then(matchesCSV =>{
    //These are terms to reduce the data on
    terms = ['ion channel','G-protein']
    
    //Now we need to obtain genes that match our reducers above
    genes = []
    for(var i=0 ; i< terms.length; i++){
        genesMatch = matchesCSV.filter(d => d["GO.term.name"].match(terms[i])!==null)
        genes = genes.concat(genesMatch)
    }   

    //One main issue is that it returns many duplicate genes.
    //Because each gene can be described in a variety of ways. 
    console.log(`There are a total of ${genes.length} detected with the terms ${terms}`)
    
    
    //Now we need to figure out how many unique genes there are.
    genesUnique = [...new Set(genes.map(item => item['Gene.name'])) ]
    
    genesTotalUnique = [... new Set(matchesCSV.map(item => item['Gene.name']))]
    
    //This provides us with 2637 Unique genes that we can 
    //Now easily work with
    console.log(`But there are only ${genesUnique.length} genes within this sampling. Compared with ${genesTotalUnique.length} Total Genes`)

    
    
})