
var co = require('..')

co.spawn(function* () {
    console.log('okk')
    yield 1000
    console.log('okk')
    yield 1000
    console.log('okk')
})
