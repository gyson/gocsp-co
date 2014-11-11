
# gocsp-co

Coroutine in js world

## Example

```js
var co = require('gocsp-co')
var thunk = require('gocsp-thunk')

co(function* (x, y) {

    // yield promise
    yield new Promise((resolve, reject) => {
        resolve('hi')
    })

    // yield thunk
    yield thunk(done => {
        done()
    })

    // yield callback
    yield done => {
        done()
    }

    return x + y

// !!! caution: unlike tj's co, callback is NOT last argument
})(1, 2)(function (err, val) {
    assert(val === 3)
})
```

## Difference with TJ's co

`co()` in gocsp-co will return a wrapper function which will return a thunk when called, where tj's co use last argument as callback (it's also a thunk if no other arguments).

## Async Function

Use it as ES7 async function.

Example:
```js
function asyncFunction(arg0, arg1, arg2) {
    return new Promise(co.spawn(function* () {
        // ...
        // ...
    }))
}
```

## API Reference
### `co( generator_function )`

Return a wrapper function which will return a [thunk](https://github.com/gyson/gocsp-thunk) when called.

Example:
```js
co(function* (x, y) {
    return x + y
})(1, 2)(function (err, val) {
    assert(val === 3)
})
```
---
### `co.spawn( generator_function / generator )`

Return a [thunk](https://github.com/gyson/gocsp-thunk). If argument is generator function, it will be called (e.g. `genFun()`) and returned generator will be used for coroutine.

Example:
```js
// with a generator
co.spawn(function* (x, y) {
    return x + y
}(1, 2))(function (err, val) {
    assert(val === 3)
})

// with a generator function
var x = 1, y = 2
co.spawn(function* () {
    return x + y
})(function (err, val) {
    assert(val === 3)
})
```
---
### `co.limit( num, generator_function )`

Example:
```js
co.spawn(function* () {
    // read max 10 files at the same time
    var read = co.limit(10, function* (filename) {
        return yield thunk.ify(fs.readFile)(filename)
    })
    var files = yield ['file1', 'file2', 'etc...'].map(read)
})

// gocsp-each
each(chan, co.limit(10, function* (data) {
    // ...
}))

// limit total number of connection
http.createServer(co.limit(1000, function* (req, res) {
    // ...
}))
```

## Inspiration

* [co](https://github.com/tj/co)

## Licence

MIT
