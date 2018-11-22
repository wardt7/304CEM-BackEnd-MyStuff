var db = require("./databaseHandler")
var fs = require("fs")
var crypto = require("crypto")

exports.addProduct = function(conData, req, callback){
    console.log("in addproduct")
    db.connect(conData, function(err, data){
	if (err) {
	    data.end()
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
	    if (err) {
		data.end()
		callback(err)
		return
	    } else {
		data.end()
		callback(err, ID)
	    }
	})
    })
}

exports.addImage = function(conData, fileData, callback){
    var newUrl = `public/products/images/${fileData.ID}.jpg`
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
		if (err) {
		    data.end()
		    callback(err)
		    return
		} else {
		    data.end()
		    callback(err, fileData.ID)
		}
	    })
	})
    })
}

exports.getAllProducts = function(conData, req, callback){
    db.connect(conData, function(err, conn){
	if (err) {
	    callback(err)
	    return
	}
	sql = "SELECT * FROM Products"
	if(req.query.title){
	    sql = sql + " WHERE title = ?"
	}
	conn.query(sql, [req.query.title], function(err, result){
	    if (err) {
		conn.end()
		callback(err)
		return
	    }
	    conn.end()
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

exports.deleteProduct = function(conData, id, username, callback){
    db.connect(conData, function(err, conn){
	if (err) {
	    callback(err)
	    return
	}
	sql = "DELETE FROM Products WHERE productID = ? AND author = ?"
	conn.query(sql, [id, username], function(err, result){
	    if (err) {
		conn.end()
		callback(err)
		return
	    } else {
		conn.end()
		fs.unlink(`public/products/images/${id}.jpg`, function(err){
		    console.log(err)
		    callback(null, result)
		})
	    }
	})
    })
}
	
	    
	    
	    
