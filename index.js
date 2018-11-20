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
var upload = multer({ dest: 'public/images/' });
var app = express();

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

app.post('/products',upload.single('product'), function (req, res, next) {
    // upload a new product
    ph.addProduct(databaseData, req, function(err, data){
	if(err){
	    res.status(500)
	    res.end("error:" + err)
	}
	console.log(req.file)
	var fileData = {
	    "ID": data,
	    "currentUrl": req.file.path
	}
	ph.addImage(databaseData, fileData, function(err, data){
	    if(err){
		res.status(500)
		res.end("error:" + err)
	    } else {
		res.status(201)
		res.end("Added product with image")
	    }
	})
    })
})

app.get('/products', function (req, res, next) {
    ph.getAllProducts(databaseData, req, function(err, data){
	if(err){
	    res.status(400)
	    res.end("error:" + err)
	} else {
	    res.status(201)
            res.json(data)
	    res.end()
	}
    })
})

app.get('/createTables', (req, res) => {
    db.createTables(databaseData, function(err, state){
	if(err) {
	    res.status(500)
	    res.end("An error has occured:" + err)
	    return
	}
	res.status(201)
	res.end("tables made")
    })
})

app.post('/users', (req, res) => {
    uh.createUser(databaseData, req, function(err, data){
	if(err){
	    res.status(500)
            console.log(err)
	    res.end("error:" + err)
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
    console.log('logging in')
    uh.authenticateUser(databaseData, req, function(err, data){
	if(err){
	    res.status(401)
	    res.end("error:" + err)
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
	    res.end("error:" + err)
	} else {
	    mh.createMessage(databaseData, req, function(err, data){
		if(err){
		    res.status(500)
		    res.end("error:" + err)
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
	    res.end("error:" + err)
	} else {
	    mh.getMessages(databaseData, decoded.username, function(err, data){
		if(err){
		    res.status(500)
		    res.end("error:" + err)
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
	    res.end("error:" + err)
	} else {
	    mh.deleteMessage(databaseData, req.params.id, decoded.username, function(err, data){
		if(err){
		    res.status(500)
		    console.log(err)
		    res.end("error:" + err)
		} else {
		    res.status(200)
		    res.json({"deleted": true})
		    res.end()
		}
	    })
	}
    })
})
	    
    

app.listen(port, err => {
    if (err) {
	console.error(err)
    } else {
	console.log('App is listening')
    }
})
	

