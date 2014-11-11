
var co = require('..')
var assert = require('assert')
var thunk = require('gocsp-thunk')
var Promise = require('es6-promise').Promise

describe('co()', function () {
    it('should just work', function (done) {
        co(function* () {
            // noop
        })()(done)
    })
    it('should return correct val', function (done) {
        co(function* (a, b) {
            return a + b
        })(1, 2)(function (err, val) {
            assert(val === 3)
            done()
        })
    })
    it('should be able to bind context', function (done) {
        var ctx = {}
        co(function* () {
            assert(this === ctx)
        }).call(ctx)(done)
    })
    it('should throw err', function (done) {
        var err = new Error()
        co(function* () {
            throw err
        })()(function (e) {
            assert(err === e)
            done()
        })
    })
    it('should be able to yield thunk', function (done) {
        co(function* () {
            var data = yield thunk(function (cb) {
                setTimeout(function () {
                    cb(null, 10)
                }, 10)
            })
            assert(data === 10)
        })()(done)
    })
    it('should be able to throw from thunk', function (done) {
        co(function* () {
            var match = false
            try {
                var err = new Error()
                var data = yield thunk(function (cb) {
                    setTimeout(function () {
                        cb(err)
                    }, 10)
                })
            } catch (e) {
                match = err === e
            }
            assert(match)
        })()(done)
    })
    it('should be able to yield promise', function (done) {
        co(function* () {
            var match = false
            try {
                var err = new Error()
                var data = yield new Promise(function (_, reject) {
                    reject(err)
                })
            } catch (e) {
                match = err === e
            }
            assert(match)
        })()(done)
    })
    it('should be able to throw from promise', function (done) {
        co(function* () {
            var data = yield new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(10)
                }, 10)
            })
            assert(data === 10)
        })()(done)
    })
    it('should be able to yield array', function (done) {
        co(function* () {
            var data = yield [
                new Promise(function (resolve, reject) {
                    resolve(0)
                }),
                thunk(function (cb) {
                    cb(null, 1)
                })
            ]
            assert(data[0] === 0)
            assert(data[1] === 1)
        })()(done)
    })
    it('should be able to yield* generator', function (done) {
        function* gen() {
            var data = yield thunk(function (cb) { cb(null, 100 )})
            assert(data === 100)
            return 200
        }
        co(function* () {
            var data = yield* gen()
            assert(data === 200)
        })()(done)
    })
    it('should be able to yield generator', function (done) {
        co(function* () {
            return yield (function* () { return 100 } ())
        })()(function (err, val) {
            assert(val === 100)
            done()
        })
    })
    it('should throw err if yield invalid type', function (done) {
        co(function* () {
            yield '1234'
        })()(function (err) {
            assert(err instanceof TypeError)
            done()
        })
    })
})
