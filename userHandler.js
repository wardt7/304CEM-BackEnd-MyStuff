/**
 * a module for handling interactions related to the User table of the
 * database.
 * @module userHandler
 */

/* eslint-disable no-undef */
var db = require("./databaseHandler")
var bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken")
var config = require("./config")
/* eslint-enable no-undef */

/**
 * a callback that returns a JSON Web Token
 * @callback tokenCallback
 * @param {Error|null} err
 * @param {string|null} jwt - The JSON Web Token as a b64 string
 */

/**
 * create a new user in the User table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} req - The request object sent from ExpressJS
 * @param {string} req.body.username - The username of the new user
 * @param {string} req.body.password - The password of the user connecting
 * @param {string} req.body.rePassword - The password verification string to compare with password
 * @param {tokenCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.createUser = function(conData, req, callback){
    if(req.body["password"] !== req.body["rePassword"]){
        var pwErr = new Error("Password and Verification Password do not match!")
        callback(pwErr)
        return
    }
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        }
        bcrypt.hash(req.body["password"], 10, function(err, hash){
            if (err) {
                callback(err)
                return
            } else {
                var values = {
                    username: req.body["username"],
                    email: req.body["email"],
                    password: hash,
                }
                var sql = "INSERT INTO Users SET ?"
                conn.query(sql, values, function(err){
                    conn.end()
                    if(err){
                        callback(err)
                        return
                    } else {
                        var token = jwt.sign({"username":req.body["username"]}, config.secret, {
                            expiresIn: 86400
                        })
                        callback(null, token)
                        return
                    }
                })
            }
        })
    })
}

/**
 * authenticate a user using data in the User table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} req - The request object sent from ExpressJS
 * @param {string} req.body.username - The username of the user connecting
 * @param {string} req.body.password - The password of the user connecting
 * @param {tokenCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.authenticateUser = function(conData, req, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
	    return
        } else {
            var sql = "SELECT username, password, isAdmin FROM Users WHERE username = ?"
            var data = req.body["username"]
            conn.query(sql, data, function(err, result){
                if(err){
                    conn.end()
                    callback(err)
                    return
                } else {
                    conn.end()
                    if(result.length !== 1){
                        var authErr = new Error("Username and Password combination not found!")
                        callback(authErr)
                        return
                    } else {
                        bcrypt.compare(req.body["password"], result[0].password, function(err, res){
                            if (err || res === false){
                                var authErr = new Error("Username and Password combination not found!")
                                callback(authErr)
                                return
                            } else {
				var token = null
                                if(result[0].isAdmin === null){
                                    token = jwt.sign({"username": req.body["username"]}, config.secret, {
                                        expiresIn: 86400
                                    })
                                } else {
                                    token = jwt.sign({"username": req.body["username"], "isAdmin": true}, config.secret, {
                                        expiresIn: 86400
                                    })
                                }
                                callback(null, token)
                                return
                            }
                        })
                    }
                }
            })
        }
    })
}
