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

app.use(express.static('public'))

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
        

