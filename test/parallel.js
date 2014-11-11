
var co = require('..')
var assert = require('assert')
var thunk = require('gocsp-thunk')
var Promise = require('es6-promise').Promise

describe('co.parallel()', function () {
    it('should accept []', function (done) {
        co.spawn(function* () {
            var result = yield co.parallel([])
            assert(result.length === 0)
            assert(Array.isArray(result))
        })(done)
    })
    it('should accept {}', function (done) {
        co.spawn(function* () {
            var result = yield co.parallel({})
            assert(Object.keys(result).length === 0)
            assert(result.constructor === Object)
        })(done)
    })
    it('should accept array', function (done) {
        co.spawn(function* () {
            assert((yield co.parallel([
                // thunk
                thunk(function (done) { done(null, 'l') }),
                // promise
                new Promise(function (resolve) { resolve('u') }),
                // generator function
                function* () { return 'c' },
                // generator
                function* () { return 'k'}()
            ])).join('') === 'luck')
        })(done)
    })
    it('should accept object', function (done) {
        co.spawn(function* () {
            var result = yield co.parallel({
                // thunk
                l: thunk(function (done) { done(null, 'l') }),
                // promise
                u: new Promise(function (resolve) { resolve('u') }),
                // generator function
                c: function* () { return 'c' },
                // generator
                k: function* () { return 'k'}()
            })
            Object.keys(result).forEach(function (key) {
                assert(key === result[key])
            })
        })(done)
    })
    it('should fail if any yieldable fail', function (done) {
        co.spawn(function* () {
            var err = new Error()
            try {
                yield [
                    thunk(function (done) { done() }),
                    new Promise(function (resolve, reject) { reject(err) })
                ]
            } catch (e) {
                assert(e === err)
            }
        })(done)
    })
    it('should fail if any yieldable fail', function (done) {
        co.spawn(function* () {
            var err = new Error()
            try {
                yield co.parallel({
                    a: thunk(function (done) { done(err) }),
                    b: new Promise(function (resolve, reject) { resolve() })
                })
            } catch (e) {
                assert(e === err)
            }
        })(done)
    })
    it('should works with nested array', function (done) {
        co.spawn(function* () {

            var result = yield co.parallel([
                thunk(function (done) { done(null, 0) }),
                new Promise(function (resolve, reject) { resolve(1) }),
                [
                    function* () { return 20 },
                    {
                        okk: function* () { return 210 }()
                    }
                ]
            ])
            assert(result[0] === 0)
            assert(result[1] === 1)
            assert(result[2][0] === 20)
            assert(result[2][1]['okk'] === 210)
        })(done)
    })
    it('should fail with nested array if invalid type', function (done) {
        co.spawn(function* () {
            var hasError = false
            try {
                yield co.parallel({
                    a: thunk(function (cb) { cb() }),
                    b: new Promise(function (resolve, reject) { resolve() }),
                    c: {
                        d: 'Invalid type'
                    }
                })
            } catch (e) {
                hasError = true
            }
            assert(hasError)
        })(done)
    })

})
