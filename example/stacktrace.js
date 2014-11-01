
var co = require('..')

co(function* top() {
    try {
        yield co(function* inner() {
            yield setImmediate
            throw new Error('yield generator')
        })()
    } catch (e) {
        console.log(e.stack)
    }
})()

co(function* top() {
    try {
        yield* (function* inner() {
            yield setImmediate
            throw new Error('yield* generator')
        }())
    } catch (e) {
        console.log(e.stack)
    }
})()

// `yield* generator` will get better stack trace message
/*
$ node --harmony stacktrace.js
Error: yield generator
    at inner (/Users/yunsong/Projects/node_modules/gocsp-co/example/stacktrace.js:8:19)
    at GeneratorFunctionPrototype.next (native)
    at Immediate.next (/Users/yunsong/Projects/node_modules/gocsp-co/index.js:50:27)
    at tryCatch (/Users/yunsong/Projects/node_modules/gocsp-co/node_modules/gocsp-thunk/index.js:12:12)
    at Immediate._onImmediate (/Users/yunsong/Projects/node_modules/gocsp-co/node_modules/gocsp-thunk/index.js:53:17)
    at processImmediate [as _immediateCallback] (timers.js:374:17)
Error: yield* generator
    at inner (/Users/yunsong/Projects/node_modules/gocsp-co/example/stacktrace.js:19:19)
    at GeneratorFunctionPrototype.next (native)

    at top (/Users/yunsong/Projects/node_modules/gocsp-co/example/stacktrace.js:20:10)

    at GeneratorFunctionPrototype.next (native)
    at Immediate.next (/Users/yunsong/Projects/node_modules/gocsp-co/index.js:50:27)
    at tryCatch (/Users/yunsong/Projects/node_modules/gocsp-co/node_modules/gocsp-thunk/index.js:12:12)
    at Immediate._onImmediate (/Users/yunsong/Projects/node_modules/gocsp-co/node_modules/gocsp-thunk/index.js:53:17)
    at processImmediate [as _immediateCallback] (timers.js:374:17)
*/
