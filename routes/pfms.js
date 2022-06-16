//express is the framework we're going to use to handle requests
const express = require('express')

//retrieve the router object from express
var router = express.Router()

const logger = require('cfb3-log-package')

const PFMS = require('pfms')

/**
 * @api {get} /hello Request a Hello World message
 * @apiName GetHello
 * @apiGroup Hello
 *
 * @apiSuccess {String} message Hello World message
 */
router.get("/", (request, response) => {

    const matrix = request.body.matrix
    
    let sum = PFMS.sum(matrix)

    response.set('Access-Control-Allow-Origin', '*')
    response.send({
        message: `The sum is ${sum}`
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