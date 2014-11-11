
var co = require('..')
var assert = require('assert')
var thunk = require('gocsp-thunk')
var Promise = require('es6-promise').Promise

describe('co.limit()', function () {
    it('should works', function (done) {
        var max = 50
        var count = 0
        var highest = 0
        function check() {
            assert(count <= max)
            highest = highest > count ? highest : count
        }
        var task = co.limit(max, function* () {
            check()
            count += 1
            while (Math.random() > 0.5) {
                check()
                yield co.sleep(3)
                check()
            }
            count -= 1
            check()
        })
        co.spawn(function* () {
            var list = []
            for (var i = 0; i < 1000; i++) {
                list.push(task())
            }
            yield list
            assert(highest === max)
        })(done)
    })
})
