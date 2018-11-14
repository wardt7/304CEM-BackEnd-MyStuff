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
	sql = "CREATE TABLE Products (productID VARCHAR(32) NOT NULL, title VARCHAR(255) NOT NULL, img VARCHAR(255), location VARCHAR(127) NOT NULL, price FLOAT(8,2) NOT NULL," +
	    " description VARCHAR(4096), author VARCHAR(255) NOT NULL, PRIMARY KEY (productID), CONSTRAINT FK_ProductAuthor FOREIGN KEY (author) REFERENCES Users(username));"
	con.query(sql, function(err, result) {
	    sql = "INSERT INTO Users VALUES ('admin','password','admin@gmail.com');"
	    con.query(sql, function(err, result) {
		con.end()
		callback(err, result)
	    })
        })
    })
}
