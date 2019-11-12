data <- read.csv('./data/GSE131230_counts_official.csv')
row.names(data)<-data[,1]
data <- data[-1]

goTerms <- read.csv("./data/go_terms.csv")
terms <- c('ion channel','G-protein')

#These are the genes we want
ions <- grep('ion channel', goTerms$GO.term.name)
gpcrs <- grep('GPCR', goTerms$GO.term.name)
genes <- union(ions,gpcrs)

#Now get the unique genes
goTermReduce <- goTerms[genes,]
uniqueGenes <- unique(goTermReduce$Gene.stable.ID)

#Reduce the data
dataReduce <- data[uniqueGenes,]

#Get rid of the NA 
dataReduce <- dataReduce[rownames(dataReduce)!='NA',]






dataSvd <- svd(t(dataReduce))

dataPCA <- prcomp(t(dataReduce))

pc1 = dataSvd$d[1]*dataSvd$u[,1]
pc2 = dataSvd$d[2]*dataSvd$u[,2]

dc1 = dataSvd$d[1] * dataSvd$v[,1]
dc2 = dataSvd$d[2] * dataSvd$v[,2]


plot(pc1,pc2)

text(pc1,pc2, colnames(data))

pcaData <- prcomp(t(dataReduce))

biplot(pcaData)





plotPCfunc <- function(tmp.pca,pdf.name=NULL,i1=1,i2=2,p.col="black",main="PCA plot",gi=NULL,pch=1)
{
        n <- nrow(tmp.pca$rot) 
        A4.rot <- data.frame(tmp.pca$rot)
        A4.x <- data.frame(tmp.pca$x)

        A4.x[,"label"] <- row.names(A4.x)
        if(!is.null(pdf.name))
        {pdf(pdf.name,width=10,height=10)}
        else
        {dev.new()}
        par(fig=c(.1,1,.1,1))
        plot(A4.x[,i1],A4.x[,i2],pch=pch,col=p.col,xlab=paste("PC",i1),ylab=paste("PC",i2),main=main,cex=2)
        if(is.null(gi)){gi <- rep(TRUE,nrow(A4.x))}
        text(A4.x[gi,i1],A4.x[gi,i2],A4.x[gi,"label"],cex=.5)

        par(fig=c(.2,.9,0,.1), new=TRUE,mar=c(0,0,0,0))
        plot(tmp.pca$rot[,i1],rep(0,n),type="n",xaxt="n",yaxt="n",xlab="",ylab="",bty="n")#,ylim=c(-.01,.01)
        text(tmp.pca$rot[,i1],rep(0,n),row.names(A4.rot),xaxt="n",yaxt="n",xlab="",ylab="",bty="n",srt=90,cex=.75)
        par(fig=c(0,.1,.2,.9), new=TRUE,mar=c(0,0,0,0))
        plot(rep(0,n),tmp.pca$rot[,i2],type="n",xaxt="n",yaxt="n",xlab="",ylab="",bty="n")#,ylim=c(-.01,.01)
        text(rep(0,n),tmp.pca$rot[,i2],row.names(A4.rot),xaxt="n",yaxt="n",xlab="",ylab="",bty="n",cex=.75)

        if(!is.null(pdf.name))
        {dev.off()}
}


plotPCfunc2 <- function(tmp.pca,pdf.name=NULL,i1=1,i2=2,p.col="black",main="PCA plot",gi=NULL,pch=1)
{
        library(plotrix)
        n <- nrow(tmp.pca$rot) 
        A4.rot <- data.frame(tmp.pca$rot)
        A4.x <- data.frame(tmp.pca$x)
        A4.imp <- summary(tmp.pca)$importance
        A4.x[,"label"] <- row.names(A4.x)
        pc1p <- round(A4.imp[2,i1]*100,0)
        pc2p <- round(A4.imp[2,i2]*100,0)
        pc1lab <- paste("PC",i1," (",pc1p,"%)")
        pc2lab <- paste("PC",i2," (",pc2p,"%)") 
        
        if(!is.null(pdf.name))
        {pdf(pdf.name,width=10,height=10)}
        else
        {dev.new()}
        
        

        labtext <- row.names(A4.x)
        labpos <- c(2,4)[as.integer(A4.x[,i1] < 0)+1]
        
        par(fig=c(0,0.8,0,0.8)) 
        plot(A4.x[,i1],A4.x[,i2],pch=pch,col=p.col,xlab=pc1lab,ylab=pc2lab,main="",cex=2)
#       plot(A4.x[,i1],A4.x[,i2],pch=16,col=pcol,cex=2,xlab=pc1lab,ylab=pc2lab)
        
        #text(pca.x[,1],pca.x[,2],labtext,pos=labpos)
        #legend("bottomleft",legtext,pch=16,col=c("red","blue"))
        par(fig=c(0,0.8,0.6,1), new=TRUE,xaxt="n",yaxt="n",bty="n")
        plot(A4.rot[,i1],rep(1,nrow(A4.rot)), type="n",xlab="",ylab="")
        gx <- rep(1.05,nrow(A4.rot))
        #gx[rank(A4.rot[,i1])%%2==0] <- .95
        thigmophobe.labels(A4.rot[,i1],gx,row.names(A4.rot),srt=90)#,pos=1,cex=.75)
        par(fig=c(0.6,1,0,0.8),new=TRUE,xaxt="n",yaxt="n",bty="n")
        plot(rep(1,nrow(A4.rot)),A4.rot[,i2],type="n",xlab="",ylab="")
        gx <- rep(1.05,nrow(A4.rot))
        #gx[rank(A4.rot[,i2])%%2==0] <- .95
        thigmophobe.labels(gx,A4.rot[,i2],row.names(A4.rot))#,pos=4,cex=.75)
        mtext(main, side=3, outer=TRUE, line=-3)
        if(!is.null(pdf.name))
        {dev.off()}
}

plotPCfunc2(pcaData)
