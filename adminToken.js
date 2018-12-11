// eslint-disable
var jwt = require('jsonwebtoken')
var config = require('./config')

var token = jwt.sign({"username": "admin", "isAdmin": true}, config.secret, {
    expiresIn: 86400
})

console.log(token)
