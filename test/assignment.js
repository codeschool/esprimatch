var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn,
    any = esprimatch.any,
    assignment = esprimatch.assignment,
    literal = esprimatch.literal,
    identifier = esprimatch.identifier;

describe('assignment', function() {
  var code = "var myVar; myVar = 'test';",
      ast = esprima.parse(code);

  it('matches code with assignment', function() {
    var nodeMatched = false;
    withIn(assignment(), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(nodeMatched);
  });

  it('does not match code without assignment', function() {
    var nodeMatched = false;
    withIn(assignment(), function(node, parent) {
      nodeMatched = true;
    })('var test;');
    assert(!nodeMatched);
  });

  it('matches operator', function() {
    var nodeMatched = false;
    withIn(assignment(any(), any(), '='), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(nodeMatched);
  });

  it('does not match operator', function() {
    var nodeMatched = false;
    withIn(assignment(any(), any(), '-='), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(!nodeMatched);
  });

  it('matches left with string', function() {
    var nodeMatched = false;
    withIn(assignment('myVar'), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(nodeMatched);
  });

  it('does not match left with string', function() {
    var nodeMatched = false;
    withIn(assignment('yourVar'), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(!nodeMatched);
  });

  it('matches left with predicate', function() {
    var nodeMatched = false;
    withIn(assignment(identifier('myVar')), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(nodeMatched);
  });

  it('does not match left with predicate', function() {
    var nodeMatched = false;
    withIn(assignment(identifier('yourVar')), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(!nodeMatched);
  });

  it('matches right with string', function() {
    var nodeMatched = false;
    withIn(assignment(any(), 'test'), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(nodeMatched);
  });

  it('does not match right with string', function() {
    var nodeMatched = false;
    withIn(assignment(any(), 'poop'), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(!nodeMatched);
  });

  it('matches right with predicate', function() {
    var nodeMatched = false;
    withIn(assignment(any(), literal('test')), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(nodeMatched);
  });

  it('does not match right with predicate', function() {
    var nodeMatched = false;
    withIn(assignment(any(), literal('poop')), function(node, parent) {
      nodeMatched = true;
    })(ast);
    assert(!nodeMatched);
  });

});
