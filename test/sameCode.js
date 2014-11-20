var assert = require('chai').assert,
  esprima = require('esprima'),
  e = require('../lib/index.js');

describe('sameCode', function() {
  it('matches two assignments', function() {
    var code1 = "var test = 5;",
        code2 = "var test = 5;";

    assert(e.sameCode(code1, code2));
  });

  it('doesn\'t match different code', function() {
    var code1 = "var test = 5;",
        code2 = "var test = 6;";

    assert(!e.sameCode(code1, code2));
  });

  it('matches pre-parsed asts', function() {
    var code1 = "var test = 5;",
        code2 = "var test = 5;",
        code1Ast = esprima.parse(code1),
        code2Ast = esprima.parse(code2);

    assert(e.sameCode(code1Ast, code2Ast));
  });

  it('matches two assignments with comment', function() {
    var code1 = "var test = 5;",
        code2 = "var test = 5; // testing with 5";
    assert(e.sameCode(code1, code2));
  });

  it('matches two assignments with different spacing', function() {
    var code1 = "var test = 5;",
        code2 = "var      test    =    5;";
    assert(e.sameCode(code1, code2));
  });

  it('matches function contents', function() {
    var code1 = "(function(request, response, next) { response.json({test: 5}); })",
        code2 = [
          "(function(request, response, next) {",
          "  // Return the test data",
          "  response.json({",
          "    test: 5",
          "  });",
          "})"
        ].join('\n');
    assert(e.sameCode(code1, code2));
  });

});
