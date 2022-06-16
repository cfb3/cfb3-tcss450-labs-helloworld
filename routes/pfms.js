//express is the framework we're going to use to handle requests
const express = require('express')

//retrieve the router object from express
var router = express.Router()

const logger = require('cfb3-log-package')

const PFMS = require('pfms')

const algorithmMap = new Map()
algorithmMap.set('Average Strength', PFMS.genClsAvgEdgeWeight)
algorithmMap.set('Total Strength', PFMS.genClsTotalEdgeWeight)
algorithmMap.set('Centrality via Edge Weight x Left Eigenvector', PFMS.genClsAvgEdgeWeightProdPageRank)
algorithmMap.set('Centrality via Edge Weight x Right Eigenvector', PFMS.genClsAvgEdgeWeightProdEigen)
algorithmMap.set('Centrality via Right Eigenvector (no Edge Weight)', PFMS.genClsAvgVertexEigen)

/**
 * @api {get} /hello Request a Hello World message
 * @apiName GetHello
 * @apiGroup Hello
 *
 * @apiSuccess {String} message Hello World message
 */
router.get("/", (request, response) => {

    const matrix = request.body.matrix
    const factorNames = request.body.factorNames
    const factor = request.body.factor
    const maxLoopLength = request.body.maxLoopLength
    const algorithm = algorithmMap.get(request.body.algorithmName)(factorNames, matrix)
    const maxLoopCount = request.body.maxLoopCount
    
    PFMS.uniqueFBLoops(
            matrix,
            factorNames,
            factor,
            loopLength,
            maxLoopLength,
            algorithm,
            maxLoopCount)
        .then(result => {
            response.set('Access-Control-Allow-Origin', '*')
            response.send({
                message: `The sum is ${sum}`
            })
        })
        .catch(error => {
            response.set('Access-Control-Allow-Origin', '*')
            response.send({
                error: error
            })
        })



})

router.post("/", (request, response) => {

    const matrix = request.body.matrix
    
    let sum = PFMS.sum(matrix)

    response.set('Access-Control-Allow-Origin', '*')
    response.send({
        message: `The sum is ${sum}`
    })
})


// "return" the router
module.exports = router