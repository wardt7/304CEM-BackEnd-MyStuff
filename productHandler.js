var db = require("./databaseHandler")
var fs = require("fs")
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
	    data.end()
	    callback(err, ID)
	})
    })
}

exports.addImage = function(conData, fileData, callback){
    var newUrl = `public/images/${fileData.ID}.jpg`
    var routeUrl = `http://localhost:8080/products/images/${fileData.ID}.jpg`
    fs.rename(fileData.currentUrl, newUrl, function(err){
	db.connect(conData, function(err, data){
	    if (err) {
		callback(err)
		return
	    }
	    console.log("connected")
	    sql = "UPDATE Products SET img = ? WHERE productID = ?;"
	    data.query(sql, [routeUrl, fileData.ID], function(err, result){
		data.end()		
		callback(err, fileData.ID)
	    })
	})
    })
}

exports.getAllProducts = function(conData, queryData, callback){
    db.connect(conData, function(err, data){
	if (err) {
	    callback(err)
	    return
	}
	sql = "SELECT * FROM Products;"
	data.query(sql, function(err, result){
	    if (err) {
		callback(err)
		return
	    }
	    data.end()
	    var JSONToReturn = { "content": [] }
	    result.forEach(function(item){
		var product = {
		    "productID": item.productID,
		    "title": item.title,
		    "location": item.location,
		    "price": item.price,
		    "description": item.description,
		    "author": item.author,
		    "links": [ {
			"rel": "self",
			"href": item.img
		    } ],
		}
		JSONToReturn.content.push(product)
	    })
	    callback(err, JSONToReturn)
	})
    })
}
	
	    
	    
	    
