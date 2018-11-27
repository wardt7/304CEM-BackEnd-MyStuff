/* eslint-disable no-undef */
var db = require("./databaseHandler")
var fs = require("fs")
var crypto = require("crypto")
/* eslint-enable no-undef */

/* eslint-disable-next-line no-undef */
exports.addProduct = function(conData, req, username, callback){
    db.connect(conData, function(err, data){
        if (err) {
            data.end()
            callback(err)
            return
        }
        var ID = crypto.randomBytes(16).toString('hex')
        var product = {
            productID: ID,
            title: req.body['title'],
            description: req.body['description'],
            img: null,
            location: req.body['location'],
            price: parseFloat(req.body['price']),
            author: username,
        }
        data.query('INSERT INTO Products SET ?', product, function(err){
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

/* eslint-disable-next-line no-undef */
exports.addImage = function(conData, fileData, callback){
    var newUrl = `public/products/images/${fileData.ID}.jpg`
    var routeUrl = `http://localhost:8080/products/images/${fileData.ID}.jpg`
    fs.rename(fileData.currentUrl, newUrl, function(err){
        if(err){
            callback(err)
            return
        } else {
            db.connect(conData, function(err, data){
                if (err) {
                    callback(err)
                    return
                }
                var sql = "UPDATE Products SET img = ? WHERE productID = ?;"
                data.query(sql, [routeUrl, fileData.ID], function(err){
                    if (err) {
                        data.end()
                        callback(err)
                        return
                    } else {
                        data.end()
                        callback(null)
                    }
                })
            })
        }
    })
}

/* eslint-disable-next-line no-undef */
exports.getAllProducts = function(conData, req, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        }
        var sql = "SELECT * FROM Products"
        if(req.query.title){
            sql = sql + " WHERE LOCATE(?,title) > 0"
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

/* eslint-disable-next-line no-undef */
exports.deleteProduct = function(conData, id, username, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        }
        var sql = "DELETE FROM Products WHERE productID = ? AND author = ?"
        conn.query(sql, [id, username], function(err){
            if (err) {
                conn.end()
                callback(err)
                return
            } else {
                conn.end()
                fs.unlink(`public/products/images/${id}.jpg`, function(){

                    /*
                     * we don't care about the error from fs.unlink, it's
                     *just a cleanup function. 
                     */
                    callback(null)
                })
            }
        })
    })
}
        
            
            
            
