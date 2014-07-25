var assert = require('chai').assert,
    esprima = require('esprima'),
    esprimatch = require('../lib/index.js'),
    any = esprimatch.any;

describe('any', function() {

  it ('returns true always', function() {
    assert(any()());
  });

  it ('returns true always', function() {
    assert(any()(false, false));
  });

  it ('returns true always', function() {
    assert(any()(true, true));
  });

});
