/**
 * a module for handling interactions related to core database functionality
 * @module databaseHandler
 */

/* eslint-disable no-undef */
var mysql = require("mysql")
var bcrypt = require("bcrypt")
/* eslint-enable no-undef */

/**
 * a callback that does not return data
 * @callback emptyCallback
 * @param {Error|null} err
 */

/**
 * a callback that returns a connection to the database
 * @callback connectionCallback
 * @param {Error|null} err
 */

/**
 * provides a connection to the database
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {connectionCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.connect = function(conData, callback){
    var con = mysql.createConnection({
        host: conData.host,
        user: conData.user,
        password: conData.password,
        database: conData.database
    })
    con.connect(function(err) {
        if (err){
            callback(err)
        }
        callback(null, con)
    })
}

/**
 * initializes the database with the correct tables
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {emptyCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.createTables = function(conData, callback){
    var con = mysql.createConnection({
        host: conData.host,
        user: conData.user,
        password: conData.password,
        database: conData.database
    })
    var sql = "CREATE TABLE IF NOT EXISTS Users (username VARCHAR(255) NOT NULL, password CHAR(60) NOT NULL, email VARCHAR(128) NOT NULL, isAdmin BIT(1), PRIMARY KEY (username))"
    con.query(sql, function(err) {
        if (err) {
            con.end()
            callback(err)
            return
        } else {
            sql = "CREATE TABLE IF NOT EXISTS Products (productID VARCHAR(32) NOT NULL, title VARCHAR(255) NOT NULL, img VARCHAR(255), location VARCHAR(127) NOT NULL, price FLOAT(8,2) NOT NULL," +
                " description VARCHAR(4096), author VARCHAR(255) NOT NULL, PRIMARY KEY (productID), CONSTRAINT FK_ProductAuthor FOREIGN KEY (author) REFERENCES Users(username));"
            con.query(sql, function(err) {
                if (err) {
                    con.end()
                    callback(err)
                    return
                } else {
                    sql = "CREATE TABLE IF NOT EXISTS Messages (messageID INTEGER NOT NULL AUTO_INCREMENT, toUser VARCHAR(255) NOT NULL, fromUser VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL," +
                        " content VARCHAR(8192), PRIMARY KEY (messageID), CONSTRAINT FK_MessageTo FOREIGN KEY (toUser) REFERENCES Users(username)," +
                        " CONSTRAINT FK_MessageFrom FOREIGN KEY (fromUser) REFERENCES Users(username));"
                    con.query(sql, function(err) {
                        if (err) {
                            con.end()
                            callback(err)
                            return
                        } else {
                            bcrypt.hash("password", 10, function(err, hash){
                                if (err) {
                                    con.end()
                                    callback(err)
                                    return
                                } else {
                                    var data = {
                                        username: "admin",
                                        password: hash,
                                        email: "admin@gmail.com",
                                        isAdmin: 1
                                    }
                                    sql = "INSERT INTO Users SET ?;"
                                    con.query(sql, data, function(err) {
                                        con.end()
                                        if (err) {
                                            callback(err)
                                            return
                                        } else {
                                            callback(null)
                                            return
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

/**
 * deletes the tables in the database (used for cleanup after JEST tests)
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {emptyCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.deleteTables = function(conData, callback){
    var con = mysql.createConnection({
        host: conData.host,
        user: conData.user,
        password: conData.password,
        database: conData.database
    })
    con.query("SET FOREIGN_KEY_CHECKS = 0", function(err){
        if(err) {
            con.end()
            callback(err)
            return
        } else {
            con.query("DROP TABLE IF EXISTS Users", function(err){
                if(err) {
                    con.end()
                    callback(err)
                    return
                } else {
                    con.query("DROP TABLE IF EXISTS Products", function(err){
                        if(err) {
                            con.end()
                            callback(err)
                            return
                        } else {
                            con.query("DROP TABLE IF EXISTS Messages", function(err){
                                if(err) {
                                    con.end()
                                    callback(err)
                                    return
                                } else {
                                    con.query("SET FOREIGN_KEY_CHECKS = 1", function(err){
                                        con.end()
                                        if(err) {
                                            callback(err)
                                            return
                                        } else {
                                            callback(null)
                                            return
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}
            
