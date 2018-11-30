var ph = require('../productHandler')
var db = require('../databaseHandler')
var fs = require('fs')

const databaseData = {
    host:"sql2.freemysqlhosting.net",
    user:"sql2267793",
    password:"mZ2*dU8!",
    database:"sql2267793"
}

const username = "admin"
var productID = null

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

test('Upload product', (done) => {
    // Mock the request body
    var req = {
	body: {
	    title: "test title",
	    description: "test description",
	    location: "test location",
	    price: "10.00",
	}
    }
    ph.addProduct(databaseData, req, username, function(err, ID){
	expect(err).toBeNull()
	expect(ID).toBeTruthy()
	productID = ID
	done()
    })
})

test('Upload image', (done) => {
    expect(productID).not.toBeNull()
    // Mock the rename function as we don't actually have a file to change
    fs.rename = jest.fn()
    fs.rename.mockImplementation((currentUrl, newUrl, callback) => callback(null))
    // Mock the fileData body
    var fileData = {
	ID: productID,
	currentUrl: 'foo',
    }
    ph.addImage(databaseData, fileData, function(err, ID){
	expect(err).toBeNull()
	expect(ID).toMatch(productID)
	done()
    })
})

test('Get all products', (done) => {
    // Mocking the request body
    var req = {
	query: false,
    }
    ph.getAllProducts(databaseData, req, function(err, data){
	expect(err).toBeNull()
	expect(data).not.toBeNull()
	// Check we got an object with the content key
	expect(typeof data).toEqual('object')
	expect(Object.keys(data).sort()).toEqual(['content'])
	done()
    })
})

test('Delete product - Invalid productID', (done) => {
    // Mock the unlink function to save a bit of time on disk
    fs.unlink = jest.fn()
    fs.unlink.mockImplementation((url, callback) => callback(null))
    ph.deleteProduct(databaseData, "nonexistent", username, function(err, ID){
	expect(err).not.toBeNull()
	done()
    })
})

test('Delete product - Invalid username', (done) => {
    expect(productID).not.toBeNull()
    // Mock the unlink function to save a bit of time on disk
    fs.unlink = jest.fn()
    fs.unlink.mockImplementation((url, callback) => callback(null))
    ph.deleteProduct(databaseData, productID, "nonexistent", function(err, ID){
	expect(err).not.toBeNull()
	done()
    })
})

test('Delete product - Valid Data', (done) => {
    expect(productID).not.toBeNull()
    // Mock the unlink function to save a bit of time on disk
    fs.unlink = jest.fn()
    fs.unlink.mockImplementation((url, callback) => callback(null))
    ph.deleteProduct(databaseData, productID, username, function(err, ID){
	expect(err).toBeNull()
	expect(ID).toBeTruthy()
	productID = null
	done()
    })
})
