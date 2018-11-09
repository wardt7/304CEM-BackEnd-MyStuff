var db = require("./databaseHandler")
var crypto = require("crypto")

exports.addProduct = function(conData, req, callback){
    console.log("in addproduct")
    db.connect(conData, function(err, data){
	if (err) {
	    callback(err)
	    return
	}
	console.log("connected")
	var ID = crypto.randomBytes(16).toString('hex')
	var product = {
	    productID: ID,
	    title: req.body['title'],
	    description: req.body['description'],
	    img: null,
	    location: req.body['location'],
	    price: parseFloat(req.body['price']),
	    author: req.body['author']
	}
	data.query('INSERT INTO Products SET ?', product, function(err, result){
	    callback(err, ID)
	})
    })
}

exports.addImage = function(conData, ID, callback){
    console.log("in addimage")
    db.connect(conData, function(err, data){
	if (err) {
	    callback(err)
	    return
	}
	console.log("connected")
	var url = `public/images/${ID}.jpg`
	sql = "UPDATE Products SET img = ? WHERE productID = ?;"
	data.query(sql, [url, ID], function(err, result){
	    console.log(err)
	    callback(err, ID)
	})
    })
}
	    
	    
	    
