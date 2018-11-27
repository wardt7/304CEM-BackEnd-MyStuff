/* eslint-disable no-undef */
var db = require('./databaseHandler')
/* eslint-enable no-undef */

/* eslint-disable-next-line no-undef */
exports.createMessage = function(conData, req, fromUser, callback){
    if(req.body['toUser'] === fromUser){
        var matchErr = new Error('toUser and fromUser cannot match!')
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
                toUser: req.body['toUser'],
                fromUser: fromUser,
                subject: req.body['subject'],
                content: req.body['content']
            }
            conn.query(sql, msg, function(err){
                if (err) {
                    conn.end()
                    callback(err)
                } else {
                    conn.end()
                    callback(null)
                }
            })
        }
    })
}

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
                }
            })
        }
    })
}

/* eslint-disable-next-line no-undef */
exports.deleteMessage = function(conData, id, username, callback){
    db.connect(conData, function(err, conn){
        if (err) {
            callback(err)
            return
        } else {
            var sql = "DELETE FROM Messages WHERE messageID = ? AND toUser = ?"
            conn.query(sql, [Number(id), username], function(err){
                if (err){
                    conn.end()
                    callback(err)
                } else {
                    conn.end()
                    callback(err)
                }
            })
        }
    })
}
                
