/*
Bryce Fujita
Participatory Factor Mapping Software
Winter - Spring 2022
TCSS 498
Professor: Charles Bryan
*/

const SortedLinkedList = require('./datastructures/SortedLinkedList')
const { genClsAvgEdgeWeight, genClsTotalEdgeWeight, genClsAvgEdgeWeightProdEigen, genClsAvgVertexEigen, genClsAvgEdgeWeightProdPageRank, calculateCentralityVectors}  = require('./algorithms.js')
const math = require('mathjs')

module.exports = {

    genClsAvgEdgeWeight, 
    genClsTotalEdgeWeight, 
    genClsAvgEdgeWeightProdEigen, 
    genClsAvgVertexEigen, 
    genClsAvgEdgeWeightProdPageRank,
    calculateCentralityVectors,

    /**
     * Function used to add every value of a 2D array
     * @param {Numbers [][]} theArray A 2D array of numbers
     * @returns The summation of every value
     */
    sum: (theArray) => {
        if (Array.isArray(theArray)) {
            if (Array.isArray(theArray[0])) {
                let sum = 0
                let InnerSum = x => x.forEach(element => { sum += parseInt(element)})
                theArray.forEach(element => {InnerSum(element)})
                return sum
            }
        }
        return undefined
    },

    
    getSigns:(theArray) => {
        let returnMe = []
        for (let i = 0; i < theArray.length; i++) {
            let inner = []
            for(let j = 0; j < theArray[0].length; j++) {
                let temp = theArray[i][j] < 0 ? -1 : 1
                inner.push(temp)
            }
            returnMe.push(inner)
        }
        return returnMe
    },

    /**
     * Takes in a 2D array of numbers and then multiplies on it self
     * the number of times the iterator is set to.
     * @param {Number [][]} theArray A 2D array of numbers
     * @param {Number} theIterator The number of times to iterate
     * @returns A 2D array of the multiplied over itself
     */
    iterate: (theArray, theIterator) => {
        let tempArray = JSON.parse(JSON.stringify(theArray))
        let signs = module.exports.getSigns(theArray)
        let multipliedArray = JSON.parse(JSON.stringify(theArray))
        for(let i = 0; i < theIterator; i++) {
            multipliedArray = math.multiply(multipliedArray,tempArray)
        }
        for(let i = 0; i < theArray.length; i++) {
            for(let j = 0; j < theArray[0].length; j++) {
                multipliedArray[i][j] = Math.abs(multipliedArray[i][j]) * signs[i][j]
            }
        }
        return multipliedArray
    },

    strip:(theArray, thePerc) => {
        //Place everything into single array, sort, and find limit based on spot in array
        let oneLine = []
        theArray.forEach((row) => row.forEach(element => oneLine.push(Math.abs(element))))
        oneLine.sort((a,b) => b - a)
        let index = parseInt(oneLine.length*thePerc)
        let limit = thePerc === 1 ? 0: oneLine[index]-1
        let returnMe = []
        for (let i = 0; i < theArray.length; i++){
            let innerArray = []
            for (let j = 0; j < theArray[0].length; j++) {
                if (Math.abs(theArray[i][j]) >= limit) {
                    innerArray.push(theArray[i][j])
                } else {
                    innerArray.push(0)
                }
            }
            returnMe.push(innerArray)
        }
        return returnMe
    },


    uniqueFBLoops:async (theAdjacencyMatrix, theWeightedMatrix, theFactors, theFactor, theLength, theSort, theLoopCount = 100) => {

        let bothLoops = new SortedLinkedList(theLoopCount, (a,b) => b.strength - a.strength)
        let balancingLoops = new SortedLinkedList(theLoopCount, (a,b) => b.strength - a.strength)
        let reinforcingLoops = new SortedLinkedList(theLoopCount, (a,b) => b.strength - a.strength)


        function checkEdges(theVertex){
            const index = theFactors.indexOf(theVertex)
            let returnMe = []
            for(let i = 0; i < theAdjacencyMatrix[index].length; i++) {
                if ((parseInt(theAdjacencyMatrix[index][i]) !== 0) && index !== i) {
                    returnMe.push({name: theFactors[i], weight:parseInt(theWeightedMatrix[index][i])});
                }
            }
            return returnMe
        }


        function getVertex(theName, theVertices) {
            for(let i = 0; i<theVertices.length; i++) {
                if (theVertices[i].name === theName) return theVertices[i]
            }
            return
        }

        function vertify() {
            // //TODO remove these three lines
            // console.log("In vertify...")
            // let verts = theFactors.map(factor => {return {name: factor, edges: [], }})
            // console.log(verts)

            return theFactors.map(factor => {return {name: factor, edges: [], }})
        }

        function addEdges(theVertices) {
            theVertices.forEach( (element) => {
                let factors = checkEdges(element.name)
                for (let i = 0; i < factors.length; i++) {
                    element.edges.push({
                        start: element,
                        end: getVertex(factors[i].name, theVertices),
                        weight: Math.abs(factors[i].weight)
                    })
                }
            })
            console.log(theVertices[2].edges)
        }

        let vertices = vertify()
        addEdges(vertices)
        let start = getVertex(theFactor, vertices)

        function DepthFirstSearch(theVertex, theLoop) {
            if ((theLoop.length >= theFactors.length) ||
                (theLoop.length >= theLength)) return //If length is at max, bail out

            let newLoop = theLoop.slice() //Copy loop
            newLoop.push(theVertex.name)

            for (let i = 0; i < theVertex.edges.length; i++) {
                if (theVertex.edges[i] === undefined) return
                if (!theLoop.includes(theVertex.edges[i].end.name)){
                     DepthFirstSearch(theVertex.edges[i].end, newLoop) //Recursive call
                } else if(theVertex.edges[i].end.name === start.name) {
                    
                    let loop = theSort(newLoop)
                    
                    bothLoops.add(loop)
                    if(loop.signum > 0) {
                        reinforcingLoops.add(loop)
                    } else {
                        balancingLoops.add(loop)
                    }
                }
            }
        }

        DepthFirstSearch(start, [])

        // console.log(loops.toArray()[0])

        return {
            both:bothLoops.toArray(),
            reinforcing:reinforcingLoops.toArray(),
            balancing:balancingLoops.toArray(),
        }
     },

    influence:(theArray, theFactors) => {
        const map = new Map()
        for(let i = 0; i < theArray.length; i++) {
            let sum = 0
            theArray[i].forEach(element => {sum += Math.abs(parseInt(element))})
            map.set(theFactors[i], sum)
        }
        const returnMe = new Map([...map.entries()].sort((a,b) => b[1] - a[1]))
        return returnMe
    },

    dependence:(theArray, theFactors) => {
        const map = new Map()
        for(let i = 0; i < theArray.length; i++) {
            let sum = 0
            for(let j = 0; j < theArray.length; j++) {
                sum += Math.abs(parseInt(theArray[j][i]))
            }
            map.set(theFactors[i], sum)
        }
        const returnMe = new Map([...map.entries()].sort((a,b) => b[1] - a[1]))
        return returnMe
    },

    applySigns:(theArray, theSigns) => {
        let returnMe = []
        for(let i = 0; i < theArray.length; i ++) {
            let inner = []
            for(let j = 0; j < theArray[0].length; j++) {
                inner.push(theArray[i][j] * theSigns[i][j])
            }
            returnMe.push(inner)
        }
        return returnMe
    },

    /**
     * Normalizes data for displacement graph of values
     * @param {Map} theMap A keyset of factors which map to values of strength
     * @returns A normalized map which which values are normalized between 0 and 1
     */    
    normalize:(theMap) => {
        let min = Array.from(theMap.values())[0]
        let max = Array.from(theMap.values())[0]
        let returnMe = new Map()
        for (let value of theMap.values()) {
            min = Math.min(min,value)
            max = Math.max(max,value)
        }
        let coef = max-min
        for (let key of theMap.keys()) {
            returnMe.set(key,(theMap.get(key)-min)/coef)
        }
        return returnMe
    },

    /**
     * Loads Array from CSV formmatted string
     * @param {String} theData a csv file represented as a string
     * @returns a 2D array of Data objects which hold the data and location in the array
     * and a list of the factors
     */
    loadArray: (theData) => {
        const lines = theData.trim().split('\n')
        let outerArray = []
        const rawFactors = lines[0].split(',')
        let parsedFactors = []
        for(let i = 1; i < rawFactors.length; i++) {
            let index =  rawFactors[i].indexOf(':')
            parsedFactors[i-1] = index >= 0 ? rawFactors[i].substring(index + 1).trim() : rawFactors[i].trim()
        }
        for(let i = 1; i < lines.length; i++) {
            const innerArray = []
            const matrixData = lines[i].split(',')
            let index = matrixData[0].indexOf(':')
            if (index >= 0 &&
              parsedFactors[i-1] !== matrixData[0].substring(index + 1).trim()){ 
                let sFactor = matrixData[0].substring(index + 1).trim();
                let longer = parsedFactors[i-1].length > sFactor.length ? parsedFactors[i-1] : sFactor
                parsedFactors[i-1] = longer;
            }
            for(let j = 1; j < matrixData.length; j++) {
                innerArray[j-1] = parseInt(matrixData[j])
            }
            outerArray[i-1] = innerArray
        }
        const returnJSON = JSON.stringify(
            {
                factors: parsedFactors,
                array: outerArray,
            }
        )
        return returnJSON
    }
}
