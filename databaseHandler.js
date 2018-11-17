var mysql = require('mysql')

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

exports.createTables = function(conData, callback){
    var con = mysql.createConnection({
	host: conData.host,
	user: conData.user,
	password: conData.password,
	database: conData.database
    })

    var sql = "CREATE TABLE Users (username VARCHAR(255) NOT NULL, password VARCHAR(32) NOT NULL, email VARCHAR(128) NOT NULL, PRIMARY KEY (username))"
    con.query(sql, function(err, result) {
	if (err) {
	    con.end()
	    callback(err)
	    return
	} else {
	    sql = "CREATE TABLE Products (productID VARCHAR(32) NOT NULL, title VARCHAR(255) NOT NULL, img VARCHAR(255), location VARCHAR(127) NOT NULL, price FLOAT(8,2) NOT NULL," +
		" description VARCHAR(4096), author VARCHAR(255) NOT NULL, PRIMARY KEY (productID), CONSTRAINT FK_ProductAuthor FOREIGN KEY (author) REFERENCES Users(username));"
	    con.query(sql, function(err, result) {
		if (err) {
		    con.end()
		    callback(err)
		    return
		} else {
		    sql = "CREATE TABLE Messages (messageID INTEGER NOT NULL AUTO_INCREMENT, toUser VARCHAR(255) NOT NULL, fromUser VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL," +
			" content VARCHAR(8192), PRIMARY KEY (messageID), CONSTRAINT FK_MessageTo FOREIGN KEY (toUser) REFERENCES Users(username)," +
			" CONSTRAINT FK_MessageFrom FOREIGN KEY (fromUser) REFERENCES Users(username));"
		    con.query(sql, function(err, result) {
			if (err) {
			    con.end()
			    callback(err)
			    return
			} else {
			    sql = "INSERT INTO Users VALUES ('admin','password','admin@gmail.com');"
			    con.query(sql, function(err, result) {
				con.end()
				if (err) {
				    callback(err)
				    return
				} else {
				    callback(err, result)
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
