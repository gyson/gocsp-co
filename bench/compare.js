
var Bluebird = require('bluebird')
var Zalgo = require('bluebird/js/zalgo/bluebird.js')
var co = require('co')
var spawn = require('..').spawn
var fs = require('fs')
var thunk = require('gocsp-thunk')

var n = 30

// fs.stat = function (name, cb) {
//     console.log('called')
//     cb()
// }

var statPromiseZalgo = Zalgo.promisify(fs.stat)
var statPromise = Bluebird.promisify(fs.stat)
var statThunk = thunk.ify(fs.stat)

exports['baseline'] = function (done) {
    var i = 0
    fs.stat(__filename, function next() {
        i++
        if (i < n) {
            fs.stat(__filename, next)
        } else {
            done()
        }
    })
}

exports['baseline thunk'] = function (done) {
    var i = 0
    statThunk(__filename)(function next() {
        i++
        if (i < n) {
            statThunk(__filename)(next)
        } else {
            done()
        }
    })
}

exports['baseline promise'] = function (done) {
    var i = 0
    statPromise(__filename).then(function next() {
        i++
        if (i < n) {
            statPromise(__filename).then(next)
        } else {
            done()
        }
    })
}

exports['tj\'s co thunk'] = function (done) {
    co(function* () {
        for (var i = 0; i < n; i++) {
            yield statThunk(__filename)
        }
    })(done)
}

exports['tj\'s co promise'] = function (done) {
    co(function* () {
        for (var i = 0; i < n; i++) {
            yield statPromise(__filename)
        }
    })(done)
}

exports['spawn thunk'] = function (done) {
    spawn(function* () {
        for (var i = 0; i < n; i++) {
            yield statThunk(__filename)
        }
    })(done)
}

exports['spawn promise'] = function (done) {
    spawn(function* () {
        for (var i = 0; i < n; i++) {
            yield statPromise(__filename)
        }
    })(done)
}

exports['bluebird coroutine promise'] = function (done) {
    Bluebird.coroutine(function* () {
        for (var i = 0; i < n; i++) {
            yield statPromise(__filename)
        }
    })().then(done)
}

exports['bluebird zalgo promise'] = function (done) {
    Zalgo.coroutine(function* () {
        for (var i = 0; i < n; i++) {
            yield statPromiseZalgo(__filename)
        }
    })().then(done)
}
