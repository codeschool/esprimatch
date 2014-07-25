var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    matches = esprimatch.matches,
    identifier = esprimatch.identifier;

describe('matches', function() {
  var code = "var myVar; myVar = 'test';",
      ast = esprima.parse(code);

  it ('returns true when match', function() {
    assert(matches(ast, identifier('myVar')));
  });

  it ('returns false when no match', function() {
    assert(!matches(ast, identifier('yourVar')));
  });

  it ('returns false when node type does not exist', function() {
    assert(!matches('1+1', identifier('myVar')));
  });

});
