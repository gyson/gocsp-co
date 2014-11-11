
var co = require('..')
var assert = require('assert')
var thunk = require('gocsp-thunk')
var Promise = require('es6-promise').Promise

var number_1 = thunk(function (done) { done(null, 1) })
var number_2 = thunk(function (done) { done(null, 2) })

describe('co.spawn()', function () {
    it('should accept generator function', function (done) {
        co.spawn(function* () {
            return 100
        })(function (err, val) {
            assert(!err)
            assert(val === 100)
            done()
        })
    })
    it('should accept generator function with ctx', function (done) {
        var ctx = {}
        co.spawn(function* () {
            assert(ctx === this)
            return 100
        }.bind(ctx))(function (err, val) {
            assert(!err)
            assert(val === 100)
            done()
        })
    })
    it('should accept generator', function (done) {
        co.spawn(function* (a, b) {
            return a + b
        }(1, 2))(function (err, val) {
            assert(!err)
            assert(val === 3)
            done()
        })
    })
    it('should accept generator with ctx', function (done) {
        var ctx = {}
        co.spawn(function* (a, b) {
            assert(this === ctx)
            return a + b
        }.call(ctx, 1, 2))(function (err, val) {
            assert(!err)
            assert(val === 3)
            done()
        })
    })
    it('should be able to yield thunk', function (done) {
        co.spawn(function* () {
            return (yield number_1) + (yield number_2)
        })(function (err, val) {
            assert(!err)
            assert(val === 3)
            done()
        })
    })
    it('should be able to yield promise', function (done) {
        var promise_1 = new Promise(function (resolve) { resolve(1) })
        var promise_2 = new Promise(function (resolve) { resolve(2) })
        co.spawn(function* () {
            return (yield promise_1) + (yield promise_2)
        })(function (err, val) {
            assert(!err)
            assert(val === 3)
            done()
        })
    })
})
