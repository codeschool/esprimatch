var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn,
    identifier = esprimatch.identifier;

describe('identifier', function() {
  var code = "var myVar; myVar = 'test';",
      ast = esprima.parse(code);

  it ('matches variable myVar', function() {
    var matches = false;
    withIn(identifier('myVar'), function(node, parent) {
      matches = true;
    })(ast);
    assert(matches);
  });

  it ('does not match variable yourVar', function() {
    var matches = false;
    withIn(identifier('yourVar'), function(node, parent) {
      matches = true;
    })(ast);
    assert(!matches);
  });

  it ('does not match code without variable reference', function() {
    var matches = false;
    withIn(identifier('myVar'), function(node, parent) {
      matches = true;
    })('1+1;');
    assert(!matches);
  });

});
