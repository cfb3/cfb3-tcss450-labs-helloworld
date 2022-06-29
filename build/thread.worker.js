// const { uniqueFBLoops } = require('pfms').uniqueFBLoops


import {genClsAvgEdgeWeight} from './sort.js'

// const algorithmMap = new Map()
// algorithmMap.set('Average Strength', genClsAvgEdgeWeight)
// algorithmMap.set('Total Strength', genClsTotalEdgeWeight)
// algorithmMap.set('Centrality via Edge Weight x Left Eigenvector', genClsAvgEdgeWeightProdPageRank)
// algorithmMap.set('Centrality via Edge Weight x Right Eigenvector', genClsAvgEdgeWeightProdEigen)
// algorithmMap.set('Centrality via Right Eigenvector (no Edge Weight)', genClsAvgVertexEigen)

const uniqueFBLoops = (theArray, theFactors, theFactor, theLength, theSort, theLoopCount = 100) => {

    let loops = new SortedLinkedList(theLoopCount, (a,b) => b.strength - a.strength)

    function checkEdges(theVertex){
        const index = theFactors.indexOf(theVertex)
        let returnMe = []
        for(let i = 0; i < theArray[index].length; i++) {
            if ((parseInt(theArray[index][i]) !== 0) && index !== i) {
                returnMe.push({name: theFactors[i], weight:parseInt(theArray[index][i])});
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
        let verts = []
        theFactors.forEach((element) => {
            verts.push({
                name: element,
                edges: [],
            })
        })
        return verts
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
                loops.add(theSort(newLoop))
            }
        }
    }

    DepthFirstSearch(start, [])

    return loops.toArray()
 }

self.addEventListener("message", ({ data }) => {
  let { type, payload } = data
  let { matrix, factorNames, factor, maxLoopLength, weightAlgorithm, maxLoopCount } = payload
  console.log(`From worker ${payload}`)
  if (type === "UPDATE") {
    
    // const result = uniqueFBLoops(
    //     matrix,
    //     factorNames,
    //     factor,
    //     maxLoopLength,
    //     algorithmMap.get(weightAlgorithm)(factorNames, matrix),
    //     maxLoopCount
    // )
    self.postMessage({ type: "UPDATE_SUCCESS", payload: 'result' });
  }
})

self.addEventListener(
  "exit",
  () => {
    process.exit(0);
  },
  false
);