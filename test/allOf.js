var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn,
    allOf = esprimatch.allOf
    literal = esprimatch.literal;

describe('allOf', function() {
  var code = '3;4;5;6;7;';

  it ('matches all predicates', function() {
    assert(withIn(allOf(
      literal(3),
      literal(4),
      literal(5),
      literal(6),
      literal(7)
    )));
  });

  it ('does not match all predicates', function() {
    assert(!withIn(allOf(
      literal(3),
      literal(4),
      literal(5),
      literal(6),
      literal(8)
    )));
  });

  it ('matches all predicates despite errors', function() {
    assert.throws(withIn(allOf(
      literal(3),
      literal(4),
      function() {
        throw Error('Ha ha! You fail!')
      },
      literal(6),
      literal(7)
    )), 'Ha ha! You fail!');
  });

});
