var walk = require('fs-walk'),
    fs = require('fs'),
    assert = require('chai').assert;

describe('Card form', function() {
    walk.filesSync('./http/json/', function(basedir, filename, stat, next) {
        var data = fs.readFileSync(basedir + filename);
        describe(filename + ' should be parsable', function(done) {
            var card = JSON.parse(data);
            it('should be have a proper formatting', function(done) {
                assert.isString(card.name);
                assert.isString(card.desc);
                assert.isNumber(card.id);
                assert.isNumber(card.type);
                assert.isObject(card.tcg);
                if (card.tcg.id) {
                    assert.isOk(card.tcg.pack);
                    assert.isOk(card.tcg.pack_id);
                }
                assert.isObject(card.ocg);
                if (card.ocg.id) {
                    assert.isOk(card.ocg.pack);
                    assert.isOk(card.ocg.pack_id);
                }
                if (card.def !== undefined) {
                    assert.isNumber(card.def);
                }
                if (card.atk !== undefined) {
                    assert.isNumber(card.atk);
                }
                if (card.level !== undefined) {
                    assert.isNumber(card.level);
                }
                done();
            });
        });
    });
});