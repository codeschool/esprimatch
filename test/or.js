var assert = require('chai').assert,
    e = require('../lib/index.js');

describe('or', function() {
  var truePredicate = function() {return true;},
      falsePredicate = function() {return false;};

  it('returns true both true', function() {
    assert(e.or(truePredicate, truePredicate)());
  });

  it('returns true one true', function() {
    assert(e.or(truePredicate, falsePredicate)());
  });

  it('returns false none true', function() {
    assert(!e.or(falsePredicate, falsePredicate)());
  });

  it('handles more than two arguments', function() {
    assert(e.or(falsePredicate, falsePredicate, truePredicate)());
  });

  it('has either alias', function() {
    assert(e.or === e.either);
  });
});
