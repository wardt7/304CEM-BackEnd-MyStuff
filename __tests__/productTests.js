var ph = require('../productHandler')

const databaseData = {
    host:"sql2.freemysqlhosting.net",
    user:"sql2264805",
    password:"tE8!pB7*",
    database:"sql2264805"
}

const username = "admin"
var productID = null

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

test('Delete product', (done) => {
    expect(productID).not.toBeNull()
    ph.deleteProduct(databaseData, productID, username, function(err, ID){
	expect(err).toBeNull()
	expect(ID).toBeTruthy()
	productID = null
	done()
    })
})
