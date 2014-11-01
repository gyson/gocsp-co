
'use strict'

module.exports = exports = co

var all = require('gocsp-all')
var thunk = require('gocsp-thunk')

function co(genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError(genFun + ' is not generator function')
    }
    return function () {
        return coroutine(genFun.apply(this, arguments))
    }
}
exports.co = co

// function async(genFun) {
//     if (!isGenFun(genFun)) {
//         throw new TypeError(genFun + ' is not generator function')
//     }
//     return function () {
//         return new Promise(coroutine(genFun.apply(this, arguments)))
//     }
// }
// exports.async = async

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

// internal
function coroutine(gen) {
    return thunk(function (cb) {
        next()
        // ES6 tail call should be able to
        // rescue deep recursive call if any
        function next(err, res) {
            var ret, value
            try {
                ret = err
                    ? gen.throw(err)
                    : gen.next(res)
            } catch (e) {
                cb(e)
                return
            }
            value = ret.value

            if (ret.done) {
                cb(null, value)
                return
            }

            try {
                // it's promise
                if (value && typeof value.then === 'function') {
                    value.then(function (val) {
                        next(null, val)
                    }, next)
                    return
                }
                // it's thunk or callback
                if (typeof value === 'function') {
                    if (!thunk.isThunk(value)) {
                        // need to support this ?
                        // wrap it as thunk if it's callback for safety
                        // e.g. yield cb => fs.readFile(..., cb)
                        // e.g. yield cb => { throw new Error() }
                        value = thunk(value)
                    }
                    value(next)
                    return
                }
                // it's array of thunks or promises
                if (Array.isArray(value)) {
                    all(value)(next)
                    return
                }
                if (isGenerator(value)) {
                    throw new TypeError('Please use `yield* generator`')
                }
                throw new TypeError(value + ' is not promise, thunk or array')
            } catch (e) {
                next(e)
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
