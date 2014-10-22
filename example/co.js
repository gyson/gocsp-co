
var co = require('..')

co(function* (x, y) {

    return x + y

})(1, 2)(console.log)

co(function* (x, y) {

    throw new Error("something wrong")

})(1, 2)(console.log)
