var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer')
var es6Renderer = require('express-es6-template-engine')
var fs = require('fs')
var db = require('./databaseHandler')
var ph = require('./productHandler')
var upload = multer({ dest: 'public/images/' });
var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))


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

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.post('/products',upload.single('product'), function (req, res, next) {
    // req.file is the product file. See multer for details
    ph.addProduct(databaseData, req, function(err, data){
	if(err){
	    res.status(400)
	    res.end("error:" + err)
	}
	console.log(data)
	ph.addImage(databaseData, data, function(err, data){
	    if(err){
		res.status(400)
		res.end("error:" + err)
	    } else {
		res.status(201)
		res.end("Added product with image")
	    }
	})
    })
})

app.get('/createTables', (req, res) => {
    db.createTables(databaseData, function(err, state){
	if(err) {
	    res.status(400)
	    res.end("An error has occured:" + err)
	    return
	}
	res.status(200)
	res.end("tables made")
    })
})

app.listen(port, err => {
    if (err) {
	console.error(err)
    } else {
	console.log('App is listening')
    }
})
	

