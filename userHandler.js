var db = require('./databaseHandler')

exports.createUser = function(conData, req, callback){
    if(req.body['password'] !== req.body['rePassword']){
	var pwErr = new Error("Password and Verification Password do not match!")
	callback(pwErr)
	return
    }
    db.connect(conData, function(err, conn){
	if (err) {
	    callback(err)
	    return
	}
        var values = {
	    username: req.body['username'],
	    email: req.body['email'],
	    password: req.body['password']
    }
	var sql = "INSERT INTO Users SET ?"
	conn.query(sql, values, function(err, result){
	    if(err){
		conn.end()
		callback(err)
		return
	    } else {
		conn.end()
		callback(err, result)
		return
	    }
	})
    })
}

exports.authenticateUser = function(conData, req, callback){
    db.connect(conData, function(err, conn){
	if (err) {
	    callback(err)
	} else {
	    var sql = "SELECT username FROM Users WHERE username = ? AND password = ?"
	    var data = [req.body['username'], req.body['password']]
	    conn.query(sql, data, function(err, result){
		if(err){
		    conn.end()
		    callback(err)
		    return
		} else {
		    conn.end()
		    if(result.length === 0){
			var authErr = new Error('Username and Password combination not found!')
			callback(authErr)
			return
		    } else {
			callback(err, true)
			return
		    }
		}
	    })
	}
    })
}
