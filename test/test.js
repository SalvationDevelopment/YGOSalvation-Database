var walk = require('fs-walk'),
    fs = require('fs'),
    assert = require('chai').assert;

describe('Card form', function () {
    walk.filesSync('./http/json/', function (basedir, filename, stat, next) {
        var data = fs.readFileSync(basedir + filename);
        describe(filename + ' should be parsable', function (done) {
            var card = JSON.parse(data);
            it('should be have a name', function (done) {
                assert.isString(card.name);
                done();
            });
            it('should be have a desc', function (done) {
                assert.isString(card.desc);
                done();
            });
            it('should be have an id', function (done) {
                assert.isNumber(card.id);
                done();
            });
            it('should be have a type', function (done) {
                assert.isNumber(card.type);
                done();
            });
        });
    });
});