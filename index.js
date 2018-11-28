/*
 * Module for running the API with its routes
 * @module index
 */

/* eslint-disable no-undef */
var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var jwt = require('jsonwebtoken')
var config = require('./config')
var es6Renderer = require('express-es6-template-engine')
var db = require('./databaseHandler')
var ph = require('./productHandler')
var uh = require('./userHandler')
var mh = require('./messageHandler')
var cors = require('cors')
var upload = multer({ dest: 'public/products/images' });
var app = express();
/* eslint-enable no-undef */

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.engine('html', es6Renderer)
app.set('views', 'html')
app.set('view engine', 'html')

var port = 8080
const databaseData = {
    host:"sql2.freemysqlhosting.net",
    user:"sql2264805",
    password:"tE8!pB7*",
    database:"sql2264805"
}


app.use(cors())

/** 
 * Route for serving product image files
 * @name Static File Service
 * @route {GET} /products/images/:id.jpg
 */
app.use(express.static('public'))

/**
 * Route for serving a list of products
 * @name List Products
 * @route {GET} /products
 * @queryparam {string} [title] - The title of the product being searched for
 */
app.get('/products', function (req, res) {
    ph.getAllProducts(databaseData, req, function(err, data){
        if(err){
            res.status(500)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            res.status(200)
            res.json(data)
            res.end()
        }
    })
})

/**
 * Route for uploading a product
 * @name Upload Product
 * @route {POST} /products
 * @authentication JWT - A username is required in the decoded JWT
 * @bodyparam {string} title - The name of the product
 * @bodyparam {string} location - The location of the product
 * @bodyparam {string} description - The description of the product
 * @bodyparam {string|float} price - The price of the product
 * @bodyparam {file} product - The image of the product
 */
app.post('/products',upload.single('product'), function (req, res) {
    // upload a new product
    jwt.verify(req.headers.authorization, config.secret, function(err, decoded){
        if(err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            ph.addProduct(databaseData, req, decoded.username, function(err, data){
                if(err){
                    res.status(500)
                    res.json({"errMessage": err.message})
                    res.end()
                }
                var fileData = {
                    "ID": data,
                    "currentUrl": req.file.path
                }
                ph.addImage(databaseData, fileData, function(err){
                    if(err){
                        res.status(500)
                        res.json({"errMessage": err.message})
                        res.end()
                    } else {
                        res.status(201)
                        res.json({"addedProduct": fileData.ID})
                        res.end()
                    }
                })
            })
        }
    })
})

/**
 * Route for deleting a product
 * @name Delete Product
 * @route {DELETE} /products/:id
 * @authentication JWT - A username is required in the decoded JWT
 * @routeparam {string} id - The id of the product to delete
 */
app.delete('/products/:id', function (req, res) {
    jwt.verify(req.headers.authorization, config.secret, function(err, decoded) {
        if (err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            ph.deleteProduct(databaseData, req.params.id, decoded.username, function(err) {
                if (err){
                    res.status(500)
                    res.json({"errMessage": err.message})
                    res.end()
                } else {
                    res.status(200)
                    res.json({"deletedProduct": req.params.id})
                    res.end()
                }
            })
        }
    })
})

/**
 * Route for creating the database
 * @name Create Database
 * @route {GET} /createTables
 * @authentication JWT - A username is required in the decoded JWT that contains the string "admin"
 */
app.get('/createTables', (req, res) => {
    jwt.verify(req.headers.authorization, config.secret, function(err, decoded) {
        if (err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else if (decoded.username !== "admin") {
            res.status(401)
            res.json({"errMessage": "You're not an admin!"})
            res.end()
        } else {
            db.createTables(databaseData, function(err){
                if(err) {
                    res.status(500)
                    res.json({"errMessage": err.message})
                    res.end()
                    return
                } else {
                    res.status(201)
                    res.json({"createdTables": true})
                    res.end()
                }
            })
        }
    })
})

/**
 * Route for creating a user
 * @name Create User
 * @route {POST} /users
 * @bodyparam {string} username - The user to create
 * @bodyparam {string} password - The password for the user
 * @bodyparam {string} rePassword - The password verification string to compare with password
 */
app.post('/users', (req, res) => {
    uh.createUser(databaseData, req, function(err){
        if(err){
            res.status(500)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            var token = jwt.sign({"username":req.body["username"]}, config.secret, {
                expiresIn: 86400
            })
            res.status(201)
            res.json({"auth": true, "token": token})
            res.end()
        }
    })
})

/**
 * Route for logging in a user
 * @name Login User
 * @route {POST} /users/login
 * @bodyparam {string} username - The user to create
 * @bodyparam {string} password - The password for the user
 */
app.post('/users/login', (req, res) => {
    uh.authenticateUser(databaseData, req, function(err){
        if(err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            var token = jwt.sign({"username": req.body["username"]}, config.secret, {
                expiresIn: 86400
            })
            res.status(200)
            res.json({"auth": true, "token": token})
            res.end()
        }
    })
})

/**
 * Route for uploading a message
 * @name Upload Message
 * @route {POST} /messages
 * @authentication JWT - A username is required in the decoded JWT
 * @bodyparam {string} toUser - The username of the message's recipient
 * @bodyparam {string} subject - The subject of the message
 * @bodyparam {string} content - The content of the message
 */
app.post('/messages', (req, res) => {
    jwt.verify(req.headers.authorization, config.secret, function(err, decoded) {
        if (err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            mh.createMessage(databaseData, req, decoded.username, function(err){
                if(err){
                    res.status(500)
                    res.json({"errMessage": err.message})
                    res.end()
                } else {
                    res.status(201)
                    res.json({"sentMessage": true})
                    res.end()
                }
            })
        }
    })
})

/**
 * Route for getting a user's messages
 * @name Get Messages
 * @route {GET} /messages
 * @authentication JWT - A username is required in the decoded JWT
 */
app.get('/messages', (req, res) => {
    jwt.verify(req.headers.authorization, config.secret, function(err, decoded){
        if (err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            mh.getMessages(databaseData, decoded.username, function(err, data){
                if(err){
                    res.status(500)
                    res.json({"errMessage": err.message})
                    res.end()
                } else {
                    res.status(200)
                    res.json(data)
                    res.end()
                }
            })
        }
    })
})

/**
 * Route for deleting a message
 * @name Delete Message
 * @route {DELETE} /messages/:id
 * @authentication JWT - A username is required in the decoded JWT
 * @routeparam {string} id - The id of the message to delete
 */
app.delete('/messages/:id', (req, res) => {
    jwt.verify(req.headers.authorization, config.secret, function(err, decoded){
        if (err){
            res.status(401)
            res.json({"errMessage": err.message})
            res.end()
        } else {
            mh.deleteMessage(databaseData, req.params.id, decoded.username, function(err){
                if(err){
                    res.status(500)
                    res.json({"errMessage": err.message})
                    res.end()
                } else {
                    res.status(200)
                    res.json({"deletedMessage": true})
                    res.end()
                }
            })
        }
    })
})
            
    
/* eslint-disable no-console */
app.listen(port, err => {
    if (err) {
        console.error(err)
    } else {
        console.log('App is listening')
    }
})
        

