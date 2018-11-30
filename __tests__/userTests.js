var uh = require('../userHandler')
var db = require('../databaseHandler')

const databaseData = {
    host:"sql2.freemysqlhosting.net",
    user:"sql2267793",
    password:"mZ2*dU8!",
    database:"sql2267793"
}

beforeAll((done) => {
    db.createTables(databaseData, function(err){
	if(err) {
	    console.log(err.message)
	}
	done()
    })
})

afterAll((done) => {
    db.deleteTables(databaseData, function(err){
	if(err) {
	    console.log(err.message)
	}
	done()
    })
})

test('Create User - Invalid Password', (done) => {
    var req = {
	body: {
	    email: "username@gmail.com",
	    username: "username",
	    password: "password",
	    rePassword: "nope"
	}
    }
    uh.createUser(databaseData, req, function(err){
	expect(err).not.toBeNull()
	done()
    })
})

test('Create User - Valid Data', (done) => {
    var req = {
	body: {
	    email: "username@gmail.com",
	    username: "username",
	    password: "password",
	    rePassword: "password"
	}
    }
    uh.createUser(databaseData, req, function(err){
	expect(err).toBeNull()
	done()
    })
})

test('Authenticate User - Invalid Username', (done) => {
    var req = {
	body: {
	    username: "nonexistent",
	    password:"password"
	}
    }
    uh.authenticateUser(databaseData, req, function(err){
	expect(err).not.toBeNull()
	done()
    })
})

test('Authenticate User - Invalid Password', (done) => {
    var req = {
	body: {
	    username: "admin",
	    password: "wrong"
	}
    }
    uh.authenticateUser(databaseData, req, function(err){
	expect(err).not.toBeNull()
	done()
    })
})

test('Authenticate User - Valid Data', (done) => {
    var req = {
	body: {
	    username: "admin",
	    password:"password"
	}
    }
    uh.authenticateUser(databaseData, req, function(err){
	expect(err).toBeNull()
	done()
    })
})
