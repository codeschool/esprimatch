var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn,
    allOf = esprimatch.allOf
    literal = esprimatch.literal,
    matches = esprimatch.matches;

describe.skip('allOf', function() {
  var code = '3;4;5;6;7;',
      ast = esprima.parse(code);

  it ('matches all predicates', function() {
    assert(allOf(
      matches(literal(3)),
      matches(literal(4)),
      matches(literal(5)),
      matches(literal(6)),
      matches(literal(7))
    )(ast));
  });

  it ('does not match all predicates', function() {
    assert(!allOf(
      literal(3),
      literal(4),
      literal(5),
      literal(6),
      literal(8)
    )(code));
  });

  it ('matches all with predicate errors', function() {
    assert.throws(function() {
      allOf(
        literal(3),
        literal(4),
        function() {
          throw Error('Ha ha! You fail!')
        },
        literal(6),
        literal(7)
      )(code);
    }, 'Ha ha! You fail!');
  });

});
