data <- read.csv('./data/GSE131230_counts_official.csv')

row.names(data)<-data[,1]
data <- data[-1]
dataSvd <- svd(data)

dataPCA <- prcomp(data)

pc1 = dataSvd$d[1]*dataSvd$u[1,]
pc2 = dataSvd$d[2]*dataSvd$u[2,]

plot(pc1,pc2)

text(pc1,pc2, colnames(data))

pcaData <- prcomp(t(data))

biplot(pcaData)