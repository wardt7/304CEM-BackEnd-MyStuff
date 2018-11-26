var db = require('./databaseHandler')
var bcrypt = require('bcrypt')

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
	bcrypt.hash(req.body['password'], 10, function(err, hash){
	    if (err) {
		callback(err)
		return
	    } else {
		var values = {
		    username: req.body['username'],
		    email: req.body['email'],
		    password: hash,
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
	    }
	})
    })
}

exports.authenticateUser = function(conData, req, callback){
    db.connect(conData, function(err, conn){
	if (err) {
	    callback(err)
	} else {
	    var sql = "SELECT username, password FROM Users WHERE username = ?"
	    var data = req.body['username']
	    conn.query(sql, data, function(err, result){
		if(err){
		    conn.end()
		    callback(err)
		    return
		} else {
		    conn.end()
		    if(result.length !== 1){
			var authErr = new Error('Username and Password combination not found!')
			callback(authErr)
			return
		    } else {
			bcrypt.compare(req.body['password'], result[0].password, function(err, res){
			    if (err || res === false){
				var authErr = new Error('Username and Password combination not found!')
				callback(authErr)
				return
			    } else {
				callback(err, true)
				return
			    }
			})
		    }
		}
	    })
	}
    })
}
