/**
 * a module for handling interactions related to the Messages table of the
 * database.
 * @module messageHandler
 */

/* eslint-disable no-undef */
var db = require("./databaseHandler")
/* eslint-enable no-undef */

/**
 * a callback that does not return data
 * @callback emptyCallback
 * @param {Error|null} err
 */

/**
 * a callback that returns the ID of the message affected
 * @callback updateCallback
 * @param {Error|null} err
 * @param {string} ID
 */

/**
 * a callback that returns message data
 * @callback getCallback
 * @param {Error|null} err
 * @param {Object} JSONToReturn - The return object containing the data
 * @param {Object[]} JSONToReturn.content - The list of message objects to return
 * @param {integer} JSONToReturn.content.messageID - The ID of the product
 * @param {string} JSONToReturn.content.toUser - The name of the user the message is intended for
 * @param {string} JSONToReturn.content.fromUser - The name of the user who sent the message
 * @param {string} JSONToReturn.content.subject - The subject of the message
 * @param {string} JSONToReturn.content.content - The content of the message
 */

/**
 * add a message to the Messages table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} req - The request object sent from ExpressJS
 * @param {string} req.body.toUser - The username of the recipient of the message
 * @param {string} req.body.subject - The subject of the message
 * @param {string} req.body.content - The content of the message
 * @param {string} fromUser - The username of the user sending the message
 * @param {emptyCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.createMessage = function(conData, req, fromUser, callback){
    if(req.body["toUser"] === fromUser){
        var matchErr = new Error("toUser and fromUser cannot match!")
        callback(matchErr)
        return
    }
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        } else {
            var sql = "INSERT INTO Messages SET ?"
            var msg = {
                toUser: req.body["toUser"],
                fromUser: fromUser,
                subject: req.body["subject"],
                content: req.body["content"]
            }
            conn.query(sql, msg, function(err){
                if (err) {
                    conn.end()
                    callback(err)
		    return
                } else {
                    conn.end()
                    callback(null)
		    return
                }
            })
        }
    })
}

/**
 * get a user's received messages from the Messages table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {string} username - The username of the user whose messages we're obtaining
 * @param {getCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.getMessages = function(conData, username, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        } else {
            var sql = "SELECT * FROM Messages WHERE toUser = ? ORDER BY messageID DESC"
            conn.query(sql, [username], function(err, result){
                if (err){
                    conn.end()
                    callback(err)
		    return
                } else {
                    conn.end()
                    var JSONToReturn = { "content": [] }
                    result.forEach(function(item){
                        var msg = {
                            "messageID": item.messageID,
                            "toUser": item.toUser,
                            "fromUser": item.fromUser,
                            "subject": item.subject,
                            "content": item.content
                        }
                        JSONToReturn.content.push(msg)
                    })
                    callback(err, JSONToReturn)
		    return
                }
            })
        }
    })
}

/**
 * delete a message from the Messages table
 * @param {Object} conData - The connection data for the database
 * @param {string} conData.host - The name of the host we're connecting to
 * @param {string} conData.user - The username of the administrator of the database
 * @param {string} conData.password - The password of the administrator of the database
 * @param {string} conData.database - The name of the database to connect to
 * @param {Object} decoded - The decoded JWT token
 * @param {string} decoded.username - The username of the user whose message we're deleting
 * @param {boolean|undefined} decoded.isAdmin - Whether or not the user is an admin
 * @param {string} id - The ID of the message we're deleting
 * @param {updateCallback} 
 */
/* eslint-disable-next-line no-undef */
exports.deleteMessage = function(conData, id, decoded, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        } else {
            var sql = ""
            // bypass the toUser check in the SQL if the user is an admin
            if(decoded.hasOwnProperty("isAdmin")){
                sql = "DELETE FROM Messages WHERE messageID = ?"
            } else {
                sql = "DELETE FROM Messages WHERE messageID = ? AND toUser = ?"
            }
            conn.query(sql, [Number(id), decoded.username], function(err, result){
                conn.end()
                if (err){
                    callback(err)
		    return
                } else if (result.affectedRows === 0){
                    var emptyErr = new Error("Didn't delete anything, is messageID and toUser correct?")
                    callback(emptyErr)
		    return
                } else {
                    callback(err, id)
		    return
                }
            })
        }
    })
}
                
