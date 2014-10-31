
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
    // it's a sugar for yield thunk
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

* You can only yield thunk or promise with gocsp-co.
* Use [gocsp-all](https://github.com/gyson/gocsp-all) to get result from an array of thunks or promises.
* Use `yield* generator` to do delegation.
* gocsp-co will return a wrapper function which will return a thunk when called, where tj's co use last argument as callback (it's also a thunk if no other arguments).

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
### `co.spawn( generator / generator_function )`

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

## Inspiration

* [co](https://github.com/tj/co)

## Licence

MIT
