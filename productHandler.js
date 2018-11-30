/**
 * a module for handling interactions related to the Product table of the
 * database.
 * @module productHandler
 */

/* eslint-disable no-undef */
var db = require("./databaseHandler")
var fs = require("fs")
var crypto = require("crypto")
/* eslint-enable no-undef */

/**
 * a callback that does not return data
 * @callback emptyCallback
 * @param {Error|null} err
 */

/**
 * a callback that returns the ID of the product affected
 * @callback updateCallback
 * @param {Error|null} err
 * @param {string} ID
 */

/**
 * a callback that returns product data
 * @callback getCallback
 * @param {Error|null} err
 * @param {Object} JSONToReturn - The return object containing the data
 * @param {Object[]} JSONToReturn.content - The list of product objects to return
 * @param {string} JSONToReturn.content.productID - The ID of the product
 * @param {string} JSONToReturn.content.title - The name of the product
 * @param {string} JSONToReturn.content.author - The author of the product
 * @param {string} JSONToReturn.content.location - The location of the product
 * @param {string} JSONToReturn.content.description - The description of the product
 * @param {string} JSONToReturn.content.price - The price of the product
 * @param {Object[]} JSONToReturn.content.links - A list of links that the recipient can access
 * @param {string} JSONToReturn.content.links.rel - The relation of the link to the product (always self)
 * @param {string} JSONToReturn.content.links.href - The image of the product if available
 */



/**
 * create a new product in the Product table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} req - The request object sent from ExpressJS
 * @param {string} req.body.title - The title of the new product
 * @param {string} req.body.description - The description of the new product
 * @param {string} req.body.location - The location of the new product
 * @param {string|float} req.body.price - The price of the new product. Must be parseable to float
 * @param {string} username - The username of the user adding the product
 * @param {updateCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.addProduct = function(conData, req, username, callback){
    db.connect(conData, function(err, data){
        if (err) {
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

/**
 * add an image to a product in the Product table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} fileData - The image data information object sent from ExpressJS
 * @param {string} fileData.ID - The ID of the product being updated
 * @param {string} fileData.currentUrl - The current internal URL (path) of the image
 * @param {updateCallback} 
 */
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
                        callback(null, fileData.ID)
                    }
                })
            })
        }
    })
}

/**
 * get products from the Product table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} req - The request object sent from ExpressJS
 * @param {string} [req.query.title] - The title of product to be searched for
 * @param {getCallback} 
 */
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

/**
 * deletes a product in the Product table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {string} id - The ID of the product to be deleted
 * @param {string} username - The author of the product to be deleted
 * @param {updateCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.deleteProduct = function(conData, id, username, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        }
        var sql = "DELETE FROM Products WHERE productID = ? AND author = ?"
        conn.query(sql, [id, username], function(err, result){
	    conn.end()
            if (err) {
                callback(err)
                return
            } else if (result.affectedRows === 0){
		var emptyErr = new Error("Didn't delete anything, is productID and author correct?")
		callback(emptyErr)
		return
	    } else {
                fs.unlink(`public/products/images/${id}.jpg`, function(){

                    /*
                     * we don't care about the error from fs.unlink, it's
                     *just a cleanup function. 
                     */
                    callback(null, id)
                })
            }
        })
    })
}
        
            
            
            
