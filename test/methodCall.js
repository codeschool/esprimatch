var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    withIn = esprimatch.withIn;
    methodCall = esprimatch.methodCall,
    identifier = esprimatch.identifier;

describe('methodCall', function() {

  it ('returns true match expression', function() {
    var match = false;
    withIn(methodCall(), function() {
      match = true;
    })("window.open();");
    assert(match);
  });

  it ('returns true object match', function() {
    var match = false;
    withIn(methodCall('window'), function() {
      match = true;
    })("window.open();");
    assert(match);
  });

  it ('returns true object & method match', function() {
    var match = false;
    withIn(methodCall('window', 'open'), function() {
      match = true;
    })("window.open();");
    assert(match);
  });

  it('returns true object, method & arguments match', function() {
    var match = false;
    withIn(methodCall('window', 'open', [literal('_blank')]), function() {
      match = true;
    })("window.open('_blank');");
    assert(match);
  });

  it('returns true object, method & arguments match', function() {
    var match = false;
    withIn(methodCall('window', 'open', [literal('_blank'), identifier('test')]), function() {
      match = true;
    })("var test = 'http://www.google.com'; window.open('_blank', test);");
    assert(match);
  });

  it('returns false object, method & arguments mismatch', function() {
    var match = false;
    withIn(methodCall('window', 'open', [literal('_blank'), identifier('window')]), function() {
      match = true;
    })("var test = 'http://www.google.com'; window.open('_blank', test);");
    assert(!match);
  });

});
