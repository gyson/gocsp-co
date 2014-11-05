
var co = require('gocsp-co')

var sleep = function (time) {
    return function (cb) {
        setTimeout(cb, time)
    }
}

var task = co.limit(3, function* (id) {
    console.log('%d start', id)
    yield sleep(2000)
    console.log('\t %d done', id)
})

for (var i = 0; i < 10; i++) {
    task(i)
}
