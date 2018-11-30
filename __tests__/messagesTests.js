var uh = require('../userHandler')
var mh = require('../messageHandler')
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
	var req = {
	    body: {
		email: "dave@gmail.com",
		username: "dave",
		password: "password",
		rePassword: "password"
	    }
	}
	uh.createUser(databaseData, req, function(err){
	    if(err) {
		console.log(err.message)
	    }
	    done()
	})
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


test('Add Message - Invalid Sender/Receiver', (done) => {
    var req = {
	    body: {
		toUser: "admin",
		subject: "test",
		content: "test",
	    }
    }
    mh.createMessage(databaseData, req, "admin", function(err){
	expect(err).not.toBeNull()
	done()
    })
})

test('Add Message - Valid Data', (done) => {
    var req = {
	    body: {
		toUser: "dave",
		subject: "test",
		content: "test",
	    }
    }
    mh.createMessage(databaseData, req, "admin", function(err){
	expect(err).toBeNull()
	done()
    })
})

test('Get Messages', (done) => {
    mh.getMessages(databaseData, "dave", function(err, data){
	expect(err).toBeNull()
	expect(data).not.toBeNull()
	// Check we got an object with the content key
	expect(typeof data).toEqual('object')
	expect(Object.keys(data).sort()).toEqual(['content'])
	done()
    })
})

test('Delete message - Invalid toUser', (done) => {
    mh.deleteMessage(databaseData, "1", "nonexistent", function(err, id){
	expect(err).not.toBeNull()
	done()
    })
})

test('Delete message - Invalid messageID', (done) => {
    mh.deleteMessage(databaseData, "2", "dave", function(err, id){
	expect(err).not.toBeNull()
	done()
    })
})

test('Delete message - Valid Data', (done) => {
    mh.deleteMessage(databaseData, "1", "dave", function(err, id){
	expect(err).toBeNull()
	expect(id).toBeTruthy()
	done()
    })
})
    
