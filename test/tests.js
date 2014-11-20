var esprimatch = require('../lib/index.js'),
    assert = require('chai').assert;
    sinon = require('sinon');

describe('esprimatch', function() {

  require('./any.js');
  require('./allOf.js');
  require('./withIn.js');
  require('./literal.js');
  require('./identifier.js');
  require('./assignment.js');
  require('./matches.js');
  require('./methodCall.js');
  require('./sameCode.js');
  require('./or.js');

});
