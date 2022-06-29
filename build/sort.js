/*
Bryce Fujita
Participatory Factor Mapping Software
Winter - Spring 2022
TCSS 498
Professor: Charles Bryan
*/

import { Matrix } from 'ml-matrix'

/**
 * Normalize a vector using the square root of the sum of squares normalization process. 
 * 
 * @param {*} theVector 
 *              A matrix object representing the vector to be normalized. 
 *  
 * @returns an object with the following key/value pairs:
 *              value: a number representing the normalizing value
 *              vector: A Matrix object representing the normalized vector
 */
const normSqrtSumSquares = (theVector) => {
    let normalizedValue = Math.sqrt(Matrix.pow(theVector, 2).sum())
    let normalizedVector = Matrix.div(theVector, normalizedValue)

    return {
        value: normalizedValue,
        vector: normalizedVector
    }
}

/**
 * Normalize a vector using the highest value reverts to 1 normalization process. 
 * 
 * @param {*} theVector 
 *              A Matrix object representing the vector to be normalized. 
 *  
 * @returns an object with the following key/value pairs:
 *              value: a number representing the normalizing value
 *              vector: A Matrix object representing the normalized vector
 */
const normHighestToOne = (theVector) => {
    let max = theVector.max()
    let normalizedVector = Matrix.div(theVector, max)

    return {
        value: max,
        vector: normalizedVector
    }
}


/**
 * Calculates an approximation of the dominant eigenvalue and eigenvector. 
 * 
 * @param {*} theWeightedMatrix 
 *                  an ordered 2D array of numbers representing Edge weights the Graph. The order of 
 *                  the edge weights in the array correspond with order, magnitude, and sign of original adjacency matrix
 *                      ex: [[0, 3, -1],
 *                           [1, 0, -3],
 *                           [0, 3,  0]]
 * 
 * @param {*} [useWeights = true] 
 *                  a boolean used to determine whether to use weights or 0/1 when determining the dominant eigenvalue/vector. 
 * 
 * @param {*} [usePageRank = true] 
 *                  a boolean used to determine whether to use the PageRank multiplication implementation V*A or the standard
 *                  math implementation A*V
 * 
 * @param {*} [theNormalizationFunction = normSqrtSumSquares]
 *                   the function used to normalize the converging eigenvector
 *                                  Expected arguments: 
 *                                      vector -> the vector to be normalize
 *                                  Expected return:
 *                                       an object with the following key:value pairs:
 *                                          eigenvalue: the current eigenvalue calculated when normalizing the input vector
 *                                          eigenvector: the normalized form of the input 
 *                  
 * @returns an object with the following key:value pairs:
 *              eigenvalue: a number representing an approximation of the dominant eigenvalue
 *              eigenvector: a 1D array representing an approximation of the dominant eigenvector
 */
const dominantEigenVector = (theWeightedMatrix, useWeights = true, usePageRank = true, theNormalizationFunction = normSqrtSumSquares) => {

    let adjacency = []
    let weightArray = []

    for(let i = 0; i < theWeightedMatrix.length; i++) {
        adjacency[i] = []
        weightArray[i] = []
        for(let j = 0; j < theWeightedMatrix.length; j++) {
            weightArray[i][j] = theWeightedMatrix[i][j]
            if (theWeightedMatrix[i][j] === 0) {
                adjacency[i][j] = 0
            } else {
                adjacency[i][j] = 1
            }
        }
        adjacency[i][i] = weightArray[i][i] = 0 //zeros down the diag 
    }

    let useMe = useWeights ? Matrix.abs(new Matrix(weightArray)) : new Matrix(adjacency)

    let mMult
    let vector

    if(usePageRank) {
        mMult = (theMatrix, theVector) => theVector.mmul(theMatrix)
        vector = Matrix.ones(1, theWeightedMatrix.length) //a 1x6 vector of 1s
    } else {
        mMult = (theMatrix, theVector) => theMatrix.mmul(theVector)
        vector = Matrix.ones(theWeightedMatrix.length, 1) //a 6x1 vector of 1s
    }

    let ev = powerIteration(useMe, theNormalizationFunction, mMult, vector)

    return {
        eigenvalue: ev.eigenvalue,
        eigenvector: ev.eigenvector.to1DArray()
    }
}

/**
 * Recursively *wink*wink* calculate an approximation of the dominant eigenvalue and eigenvector using the PowerIteration algorithm. 
 * 
 * @param {*} theMatrix
 *                      a Matrix object representing the original adjacency matrix as a Matrix object
 *
 *  @param {*} theNormFunction 
 *                      the function used to normalize the converging eigenvector for each iteration.
 *                                  Expected arguments: 
 *                                      vector -> the vector to be normalize
 *                                  Expected return:
 *                                       an object with the following key:value pairs:
 *                                          eigenvalue: the current eigenvalue calculated when normalizing the input vector
 *                                          eigenvector: the normalized form of the input 
 *
 *  @param {*} theMatrixMultFunction 
 *                      the function used to multiply the adjacency matrix and the converging eigenvector
 *                                  Expected arguments: 
 *                                      adjacency -> the adjacency matrix
 *                                      vector -> the converging eigenvector
 *                                  Expected return:
 *                                       A Matrix object which represents to result of multiplying the adjacency matrix by the vector
 * 
 * @param {*} theVector 
 *                      a Matrix object representing the converging eigenvector. This Matrix object should be N x 1 where N is 
 *                      derived from the original adjacency matrix (N x N). This vector can be filled with any values but 
 *                      filled with 1s is expected. 
 * 
 * @param {*} [theEigenValue = -99] 
 *                      a number representing the converging eigenvalue. As the function recurses, this value will converge 
 *                      on the dominate eigenvalue for the input matrix. 
 * 
 * @param {*} [theConvergenceTolerance = 0.0001] 
 *                      a number used to determine when the eigenvalue has converged. The difference between two converging
 *                      eigenvalues must be less than theConvergenceTolerance to stop the algorithm. 
 *                                                 
 * @param {*} [theMaxIterations = 30]
 *                      a number representing the total number of iterations to apply before exiting when the eigenvalue
 *                      fails to converge.
 *  
 * @returns an object with the following key:value pairs:
 *              eigenvalue: a number representing an approximation of the dominant eigenvalue
 *              eigenvector: a 1D array representing an approximation of the dominant eigenvector
 */
function powerIteration(theMatrix,
                        theNormFunction, 
                        theMatrixMultFunction,
                        theVector,
                        theEigenValue = -99,
                        theConvergenceTolerance = 0.0001,
                        theMaxIterations = 30) {

    // use for normal eigenvector calculation along with  Matrix.ones(theWeightedMatrix.length, 1)  
    // follows standard eigenvector calculations A*V  
    // let iterationVector = theMatrix.mmul(theVector)
    
    //this follows iGpraph algorithm V*A
    // let iterationVector = theVector.mmul(theMatrix)

    let iterationVector = theMatrixMultFunction(theMatrix, theVector)

    let eigen = theNormFunction(iterationVector)

    if(theMaxIterations <= 0) {
        //"safety" base case
        console.log(`Stopping iterations, failed to converge with tolerance of ${theConvergenceTolerance} `)
        return {
            eigenvalue: eigen.value,
            eigenvector:eigen.vector
        }
    } else if (Math.abs(theEigenValue - eigen.value) < theConvergenceTolerance) {
        //base case
        return {
            eigenvalue: eigen.value,
            eigenvector: eigen.vector
        }
    } else {
        //recursive case
        return powerIteration(theMatrix, 
                            theNormFunction, 
                            theMatrixMultFunction,
                            eigen.vector, 
                            eigen.value, 
                            theConvergenceTolerance, 
                            theMaxIterations - 1)
    }
}

/**
 * Unified calculate strength function. Generic function to use "in most cases" 
 * to calculate the strength of the input loop.  
 * 
 * @param {} theLoop 
 *                      an ordered 1D array of "factor names" representing Vertices (Vi) the loop. The order of 
 *                      the "factor names" in the array correspond with order of Vertices in the loop.  
 *                      ex: ['A', 'C', 'D'] 
 * 
 * @param {*} getWeightFunction 
 *                      function used to find the weight on the edge Vi - Vi+1. 
 *                                  Expected arguments: 
 *                                      Va -> the "factor name" from theLoop representing Vi
 *                                      Vb -> the "factor name" from theLoop representing Vi+1
 *                                  Expected return:
 *                                      a number representing the weight in ege Vi - Vi+1
 * 
 * @param {*} calcEdgeStrength 
 *                      function used to calculate the portion of the loop strength from Vi to Vi+1. This strength is
 *                      SUMMED with the other strengths along theLoop. 
 *                                  Expected arguments: 
 *                                      weight -> weight on the edge Vi - Vi+1
 *                                      Va -> the "factor name" from theLoop representing Vi
 *                                      Vb -> the "factor name" from theLoop representing Vi+1
 *                                  Expected return:
 *                                      a number representing the Strength of ege Vi - Vi+1
 * 
 * @param {*} calcFinalStrength 
 *                      function used to calculate overall strength of the loop. This strength is
 *                      calculated after all individual strengths between Vi - Vi+1 along the loop have been 
 *                      calculated and SUMMED. 
 *                                  Expected arguments: 
 *                                      strength -> the SUMMED strength of all individual strengths between Vi - Vi+1 along the loop
 *                                  Expected return:
 *                                      a number representing the overall Strength of the loop
 * 
 * @returns an object with the following key:value pairs:
 *              strength: a number representing the calculated overall strength of the loop
 *              loop: the original input theLoop
 *              signum: (1/-1) representing the sign of the product of all weights along the edges traversed in this loop
 *              test: a string representation of the values calculated by this function
 *              
 */
const calculateLoopStrength = (theLoop, getWeightFunction, calcEdgeStrength, calcFinalStrength) => {
    let loopCopy = [...theLoop]
    //add the first vertex to the end, now no need for special case
    loopCopy[loopCopy.length] = loopCopy[0] 
    let strength = 0
    let sign = 1

    for(let i = 0; i < loopCopy.length - 1; i++) {
        let weight = getWeightFunction(loopCopy[i], loopCopy[i+1])
        strength += calcEdgeStrength(weight, loopCopy[i], loopCopy[i+1])
        sign *= weight
    }

    const finalStrength = calcFinalStrength(strength)

    return {
        strength: finalStrength,
        loop: theLoop,
        signum: (sign >= 0) ? 1 : -1 //normalize to 1 or -1
    }
}

/**
 * Function used to build a function that will return the weight on the edge Vi - Vi+1.
 * 
 * @param {*} theFactors 
 *                  an ordered 1D array of "factor names" representing Vertices the Graph. The order of 
 *                  the "factor names" in the array correspond with order of Vertices original adjacency matrix  
 *                      ex: ['A', 'B', 'C', 'D', 'E'] 
 * @param {*} theWeights 
 *                  an ordered 2D array of numbers representing Edge weights the Graph. The order of 
 *                  the edge weights in the array correspond with order, magnitude, and sign of original adjacency matrix
 *                      ex: [[0, 3, -1],
 *                           [1, 0, -3],
 *                           [0, 3,  0]]
 * @returns a function used to find the weight on the edge Vi - Vi+1. 
 *                      Expected arguments: 
 *                            Va -> the "factor name" from theLoop representing Vi
 *                            Vb -> the "factor name" from theLoop representing Vi+1
 *                      Expected return:
 *                            a number representing the weight in ege Vi - Vi+1
 */
function genGetWeightFunction(theFactors, theWeights) {
    let m = new Map()
    theFactors.forEach((e, i) => m.set(e,i)) 

    return (a, b) => parseInt(theWeights[m.get(a)][m.get(b)]) //create a closure on m! 
}

//"private" functions ^^^^^^^

/**************************************************************/

export const genClsAvgEdgeWeight = (theFactors, theWeights) => {
    return (theLoop) => 
        calculateLoopStrength(theLoop, 
            genGetWeightFunction(theFactors, theWeights),
            (weight) => Math.abs(weight),
            (strength) => strength / theLoop.length)
}


//"public" functions vvvvvvvv
module.exports = {
    
    // genClsAvgEdgeWeight : (theFactors, theWeights) => {
    //     return (theLoop) => 
    //         calculateLoopStrength(theLoop, 
    //             genGetWeightFunction(theFactors, theWeights),
    //             (weight) => Math.abs(weight),
    //             (strength) => strength / theLoop.length)
    // },
    
    genClsAvgEdgeWeightProdEigen : (theFactors, theWeights) => {

        let ev = dominantEigenVector(theWeights, true, false)
        console.log(ev.eigenvalue)
        console.log(ev.eigenvector)
        let domEv = ev.eigenvector
        const domEvMap = new Map();
        theFactors.forEach((e, i) => domEvMap.set(e, domEv[i]))

        return (theLoop) => 
            calculateLoopStrength(theLoop, 
                genGetWeightFunction(theFactors, theWeights),
                (weight, v1, v2) => Math.abs(weight) * domEvMap.get(v2),
                (strength) => strength / theLoop.length)
    },

    genClsAvgEdgeWeightProdPageRank : (theFactors, theWeights) => {

        let ev = dominantEigenVector(theWeights)
        console.log(ev.eigenvalue)
        console.log(ev.eigenvector)
        let domEv = ev.eigenvector
        const domEvMap = new Map();
        theFactors.forEach((e, i) => domEvMap.set(e, domEv[i]))

        return (theLoop) => 
            calculateLoopStrength(theLoop, 
                genGetWeightFunction(theFactors, theWeights),
                (weight, v1, v2) => Math.abs(weight) * domEvMap.get(v2),
                (strength) => strength / theLoop.length)
    },

    genClsAvgVertexEigen : (theFactors, theWeights) => {

        let domEv = dominantEigenVector(theWeights).eigenvector
        const domEvMap = new Map();
        theFactors.forEach((e, i) => domEvMap.set(e, domEv[i]))

        return (theLoop) => 
            calculateLoopStrength(theLoop, 
                genGetWeightFunction(theFactors, theWeights),
                (weight, v1, v2) => domEvMap.get(v1),
                (strength) => strength / theLoop.length)
    },
    
    genClsTotalEdgeWeight : (theFactors, theWeights) => {
        return (theLoop) => 
            calculateLoopStrength(theLoop, 
                genGetWeightFunction(theFactors, theWeights),
                (weight) => Math.abs(weight),
                (strength) => strength)
    },

    calculateCentralityVectors : (theWeights) => {

        //false for DO use PageRank
        let domEv = dominantEigenVector(theWeights, true, false)

        //true for DO use PageRank
        let pageRank = dominantEigenVector(theWeights, true, true)

        return {
            eigenvalue: domEv.eigenvalue,
            eigenvectorCentrality: domEv.eigenvector,
            pageRankCentrality: pageRank.eigenvector
        }
    }
}



/******************************************
 * 
 * Old non-refactored functions
 * 
 * VVVVVVVVVVVVVVV
 * 
 ******************************************/

// function getWeight(theStart, theEnd, theFactors, theArray) {
//     let start = theFactors.indexOf(theStart)
//     let end = theFactors.indexOf(theEnd)
//     return parseInt(theArray[start][end])
// }

// const totalStrength = (theFactors, theArray, theLoop) => {

//     let factors = ''
//     let strength = 0
//     let pos = 1
//     for(let i = 0; i < theLoop.length-1; i++) {
//         let weight = getWeight(theLoop[i], theLoop[i+1], theFactors, theArray)
//         strength += Math.abs(weight)
//         pos *= weight
//         factors += theLoop[i] + ' -> '
//     }
//     let lastWeight = getWeight(theLoop[theLoop.length-1], theLoop[0], theFactors, theArray)
//     strength += Math.abs(lastWeight)
//     pos *= lastWeight
//     factors += theLoop[theLoop.length-1]
//     let isPos = (pos >= 0) ? 'Reinforcing' : 'Balancing'
//     let string = isPos + '|| Total loop strength: ' + strength.toFixed(2) + '\n' + factors
//     return {
//         text: string,
//         weight: strength, 
//         loop: theLoop
//     }
// }

// const averageCentrality = (theFactors, theArray, theLoop, theDomEigenVector) => {

//     console.log("**********************")
//     console.log(theLoop)

//     let factors = ''
//     let strength = 0
//     let pos = 1
//     for(let i = 0; i < theLoop.length-1; i++) {
//         let weight = getWeight(theLoop[i], theLoop[i+1], theFactors, theArray)
//         strength += Math.abs(weight) * theDomEigenVector.get(theLoop[i+1])
//         pos *= weight
//         factors += theLoop[i] + ' -> '

//         // console.log("****")
//         // console.log(weight)
//         // console.log(theLoop[i+1])
//         // console.log(theDomEigenVector.get(theLoop[i+1]))
//         // console.log("****")
//     }
//     let lastWeight = getWeight(theLoop[theLoop.length-1], theLoop[0], theFactors, theArray)
//     strength += Math.abs(lastWeight) * theDomEigenVector.get(theLoop[0])
//     pos *= lastWeight
//     factors += theLoop[theLoop.length-1]

//     // console.log("****")
//     // console.log(lastWeight)
//     // console.log(theLoop[0])
//     // console.log(theDomEigenVector.get(theLoop[0]))
//     // console.log("****")

//     const avg = strength/theLoop.length
//     let isPos = (pos >= 0) ? 'Reinforcing' : 'Balancing'
//     let string = isPos + '|| Avg Centrality x Weight Score: ' + avg.toFixed(4) + ' ' + factors
    
//     // console.log(string)
//     // console.log("**********************")
//     return {
//         text: string,
//         weight: avg, 
//         loop: theLoop
//     }
// }

// const averageStrength = (theFactors, theArray, theLoop) => {
//     let factors = ''
//     let strength = 0
//     let pos = 1
//     for(let i = 0; i < theLoop.length-1; i++) {
//         let weight = getWeight(theLoop[i], theLoop[i+1], theFactors, theArray)
//         strength += Math.abs(weight)
//         pos *= weight
//         factors += theLoop[i] + ' -> '
//     }
//     let lastWeight = getWeight(theLoop[theLoop.length-1], theLoop[0], theFactors, theArray)
//     strength += Math.abs(lastWeight)
//     pos *= lastWeight
//     factors += theLoop[theLoop.length-1]
//     const avg = strength/theLoop.length
//     let isPos = (pos >= 0) ? 'Reinforcing' : 'Balancing'
//     let string = isPos + '|| Average loop strength: ' + avg.toFixed(2) + '\n' + factors
//     return {
//         text: string,
//         weight: avg, 
//         loop: theLoop
//     }
// }