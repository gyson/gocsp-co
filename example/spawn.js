
var spawn = require('..').spawn

// spawn generator function
spawn(function* () {

    return 123

})(console.log)

// spawn generator function
spawn(function* () {

    throw 123

})(console.log)

// spawn generator
spawn(function* (x, y) {

    return x + y

}(1, 2))(console.log)


// spawn generator
spawn(function* (x, y) {

    throw x + y

}(1, 2))(console.log)
