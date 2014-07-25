var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn,
    literal = esprimatch.literal;

describe('literal', function() {
  var code = "var myVar; myVar = 'test';",
      ast = esprima.parse(code);

  it ('matches any literal', function() {
    var matches = false;
    withIn(literal(), function(node, parent) {
      matches = true;
    })(ast);
    assert(matches);
  });

  it ('matches literal string', function() {
    var matches = false;
    withIn(literal('test'), function(node, parent) {
      matches = true;
    })(ast);
    assert(matches);
  });

  it ('does not match literal string', function() {
    var matches = false;
    withIn(literal('poop'), function(node, parent) {
      matches = true;
    })(ast);
    assert(!matches);
  });

  it ('matches literal number', function() {
    var matches = false;
    withIn(literal(3), function(node, parent) {
      matches = true;
    })('myVar = 3;');
    assert(matches);
  });

  it ('does not match literal number', function() {
    var matches = false;
    withIn(literal(2), function(node, parent) {
      matches = true;
    })('myVar = 3;');
    assert(!matches);
  });

  it ('does not match no literals', function() {
    var matches = false;
    withIn(literal(), function(node, parent) {
      matches = true;
    })('myVar = test;');
    assert(!matches);
  });

});
