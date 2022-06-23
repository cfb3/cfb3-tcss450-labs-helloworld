//express is the framework we're going to use to handle requests
const express = require('express')

//retrieve the router object from express
var router = express.Router()

const logger = require('cfb3-log-package')

const PFMS = require('pfms')

const { genClsAvgEdgeWeight,
        genClsTotalEdgeWeight, 
        genClsAvgEdgeWeightProdPageRank,
        genClsAvgEdgeWeightProdEigen,
        genClsAvgVertexEigen,
        uniqueFBLoops
    } = require('../library/findloops.js')

const algorithmMap = new Map()
algorithmMap.set('Average Strength', genClsAvgEdgeWeight)
algorithmMap.set('Total Strength', genClsTotalEdgeWeight)
algorithmMap.set('Centrality via Edge Weight x Left Eigenvector', genClsAvgEdgeWeightProdPageRank)
algorithmMap.set('Centrality via Edge Weight x Right Eigenvector', genClsAvgEdgeWeightProdEigen)
algorithmMap.set('Centrality via Right Eigenvector (no Edge Weight)', genClsAvgVertexEigen)

router.post("/", (request, response) => {

    const matrix = request.body.matrix
    const factorNames = request.body.factorNames
    const factor = request.body.factor
    const maxLoopLength = request.body.maxLoopLength
    const algorithm = algorithmMap.get(request.body.algorithmName)(factorNames, matrix)
    const maxLoopCount = request.body.maxLoopCount

    // console.log(matrix)
    // console.log(factorNames)
    // console.log(factor)
    // console.log(maxLoopLength)
    // console.log(algorithm)
    // console.log(maxLoopCount)

    
    uniqueFBLoops(
            matrix,
            factorNames,
            factor,
            maxLoopLength,
            algorithm,
            maxLoopCount)
        .then(result => {
            console.log(result)
            response.set('Access-Control-Allow-Origin', '*')
            response.send({
                message: "Got here...",
                loops: result,
            })
        })
        .catch(error => {
            response.set('Access-Control-Allow-Origin', '*')
            response.status(400).send({
                error: error
            })
        })
})


// "return" the router
module.exports = router