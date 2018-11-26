var bcrypt = require('bcrypt')
bcrypt.hash('password', 10, function(err, data){
    console.log(data)
})
