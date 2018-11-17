var db = require('./databaseHandler')

exports.createMessage = function(conData, req, callback){
    if(req.body['toUser'] === req.body['fromUser']){
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
		fromUser: req.body['fromUser'],
		subject: req.body['subject'],
		content: req.body['content']
	    }
	    conn.query(sql, msg, function(err, result){
		if (err) {
		    conn.end()
		    callback(err)
		} else {
		    conn.end()
		    callback(err, result)
		}
	    })
	}
    })
}

exports.getMessages = function(conData, username, callback){
    db.connect(conData, function(err, conn){
	if (err) {
	    callback(err)
	    return
	} else {
	    var sql = "SELECT * FROM Messages WHERE toUser = ?"
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
		
