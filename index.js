
'use strict'

module.exports = exports = co

var thunk = require('gocsp-thunk')
var LinkList = require('link-list')

function co(genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError(genFun + ' is not generator function')
    }
    return function () {
        return coroutine(genFun.apply(this, arguments))
    }
}
exports.co = co

function async(genFun) {
    // only support native Promise or polyfill
    if (!Promise) {
        throw new Error('Cannot find Promise')
    }
    if (!isGenFun(genFun)) {
        throw new TypeError(genFun + ' is not generator function')
    }
    return function () {
        return new Promise(coroutine(genFun.apply(this, arguments)))
    }
}
exports.async = async

function spawn(gen) {
    // in case it's function* () {}.bind(ctx)
    if (typeof gen === 'function') {
        gen = gen()
    }
    if (isGenerator(gen)) {
        return coroutine(gen)
    }
    throw new TypeError(gen + ' is not generator or generator function')
}
exports.spawn = spawn

function limit(max, genFun) {
    if (max !== (~~max) || max <= 0) {
        throw new TypeError(max + ' is not positive integer')
    }
    if (!isGenFun(genFun)) {
        throw new TypeError(genFun + ' is not generator function')
    }

    var count = 0
    var list = new LinkList()

    function check() {
        if (!list.isEmpty() && count < max) {
            var task = list.shift() // let
            count += 1
            coroutine(task.gen)(function () {
                count -= 1
                task.done.apply(this, arguments)
                check()
            })
            check()
        }
    }

    return function () {
        var gen = genFun.apply(this, arguments)
        return thunk(function (done) {
            list.push({
                gen: gen,
                done: done
            })
            check()
        })
    }
}
exports.limit = limit

function parallel(list) {
    if (!isObjectOrArray(list)) {
        throw new TypeError(list + ' is not array or plain object')
    }
    return thunk(function (done) {
        var result
        if (Array.isArray(list)) {
            result = new Array(list.length)
        } else {
            result = {}
        }
        var keys = Object.keys(list)
        var length = keys.length
        if (length === 0) {
            done(null, result)
            return
        }
        keys.forEach(function (key) {
            if (result === null) { return }
            yieldable(list[key], function (err, val) {
                if (result === null) { return }
                if (err) {
                    result = null
                    done(err)
                    return
                }
                result[key] = val
                length -= 1
                if (length === 0) {
                    done(null, result)
                }
            })
        })
    })
}
exports.parallel = exports.all = parallel

function timeout(time) {
    var ref
    return thunk(function (done) {
        ref = setTimeout(done, time)
    }, function cancelTimeout() {
        clearTimeout(ref)
    })
}
exports.sleep = timeout
exports.timeout = timeout

// internal
function yieldable(value, _next) {
    var called = false
    function next() {
        if (called) { return }
        called = true
        _next.apply(this, arguments)
    }
    try {
        // gocsp-thunk
        // check it first because thunk may have `.then` in the future
        if (thunk.isThunk(value)) {
            value(next)
            return
        }
        // it's promise
        if (value && typeof value.then === 'function') {
            value.then(function (val) {
                next(null, val)
            }, next)
            return
        }
        // generator function
        if (isGenFun(value)) {
            coroutine(value())(next)
            return
        }
        // co-* lib or callback
        if (typeof value === 'function') {
            value(next)
            return
        }
        // it's recommanded to use `yield* generator`
        if (isGenerator(value)) {
            coroutine(value)(next)
            return
        }
        // parallel execution
        if (isObjectOrArray(value)) {
            parallel(value)(next)
            return
        }
        next(new TypeError(value +
            ' is not yieldable (thunk, promise, array, etc)'))
    } catch (e) {
        next(e)
    }
}

// internal
function coroutine(gen) {
    return thunk(function (done) {
        next()
        // ES6 tail call should be able to rescue deep recursive call if any
        // Most of time, it should be fine because of async IO operation
        function next(err, res) {
            var ret, value
            try {
                ret = err ? gen.throw(err) : gen.next(res)
                value = ret.value
            } catch (e) {
                done(e)
                return
            }
            if (ret.done) {
                done(null, value)
                return
            }
            // when yield a number, sleep for a while
            if (value === +value) {
                setTimeout(next, value)
            } else {
                yieldable(value, next)
            }
        }
    })
}

function isGenFun(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}
exports.isGenFun = exports.isGeneratorFunction = isGenFun

function isGenerator(obj) {
    return Object.prototype.toString.call(obj) === '[object Generator]'
}
exports.isGenerator = isGenerator

function isObjectOrArray(obj) {
    return obj && (Array.isArray(obj) || obj.constructor === Object)
}
