var esprima = require('esprima'),
    estraverse = require('estraverse'),
    escodegen = require('escodegen');

var esprimatch = function() {

  function allOf() {
    var all = arguments;
    return function(args) {
      var allMatch = true;
      for (var i = 0; i < all.length; i++) {
        var predicateToUse = predicateWrapper(all[i]);
        if (!predicateToUse(args[i])) {
          allMatch = false;
          break;
        }
      }
      return allMatch;
    }
  }

  function any() {
    return function(node, parent) {
      return true;
    };
  }

  function functionPredicate(id, params) {
    var idPredicate = predicateWrapper(id),
        paramsPredicate = predicateWrapper(params);
    return function(node) {
      if (id) {
        var idMatches = idPredicate(node.id);
        if (idMatches && params) {
          return paramsPredicate(node);
        }
      }
      return true;
    }
  }

  function identifier(name) {
    var namePredicate = predicateWrapper(name);
    return function(node, parent) {
      var typeMatches = type('Identifier')(node, parent);
      if (typeMatches && name) {
        return namePredicate(node, parent);
      }
      return typeMatches;
    };
  }

  function leftRightOperatorExpression(left, right, operator) {
    var leftPredicate = propertyWrapper(left),
        rightPredicate = propertyWrapper(right),
        operatorPredicate = value(operator);
    return function(node) {
      if (left) {
        var leftMatches = leftPredicate(node.left);
        if (leftMatches && right) {
          var rightMatches = rightPredicate(node.right);
          if (rightMatches && operator) {
            return operatorPredicate(node.operator);
          }
          return rightMatches;
        }
        return leftMatches;
      }
      return true;
    };
  }

  function literal(literalValue) {
    return function(node, parent) {
      var typeMatches = type('Literal')(node, parent);
      if (typeMatches && typeof literalValue !== 'undefined') {
        return nodeValue(literalValue)(node, parent);
      }
      return typeMatches;
    }
  }

  function literalOrIdentifier(value) {
    return function(node, parent) {
      return or(literal(value), identifier(value))(node, parent);
    }
  }

  function memberExpression(object, property) {
    return function(node) {
      if (type('MemberExpression')(node)) {
        return objectAndPropertyPredicate(object, property)(node);
      }
      return false;
    };
  }

  function name(name) {
    return function(node, parent) {
      return node && node.name === name;
    };
  }

  function nodeValue(matchValue) {
    return function(node, parent) {
      return value(matchValue)(node.value);
    }
  }

  function or() {
    var predicates = arguments;
    return function(node, parent) {
      var result = false;
      for (var current = 0, len = predicates.length; current < len; current++) {
        var currentResult = predicateWrapper(predicates[current])(node, parent);
        if (currentResult) {
          result = currentResult;
          break;
        }
      }
      return result;
    }
  }

  function objectAndPropertyPredicate(object, property) {
    var objectPredicate = predicateWrapper(object),
        propertyPredicate = predicateWrapper(property);
    return function(node, parent) {
      if (object) {
        var objectMatch = objectPredicate(node.object);
        if (objectMatch && property) {
          return propertyPredicate(node.property);
        }
        return objectMatch;
      }
      return true;
    }
  }

  function params() {
    var args = arguments;
    return function(node, parent) {
      return allOf.apply(null, args)(node.params);
    };
  }

  function type(type) {
    return function(node, parent) {
      return node && node.type === type;
    };
  }

  function value(matchValue) {
    return function(value) {
      return value === matchValue;
    }
  }

  function withIn(predicate, callback) {
    if (typeof predicate === 'string') {
      predicate = type(predicate);
    }

    return function(ast, options) {
      options = options || {};
      if (typeof ast === 'string') {
        ast = esprima.parse(ast, options);
      }
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (predicate(node, parent)) {
            callback(node, parent);
          }
        }
      });
    };
  }

  function predicateWrapper(predicate) {
    var predicateToUse = predicate;
    if (predicate == null) {
      // Predicate always matches
      predicateToUse = any;
    }
    else if (typeof predicate !== 'function') {
      // Predicate matches value against node name.
      predicateToUse = name(predicate);
    }
    return predicateToUse;
  }

  function propertyWrapper(property) {
    if (typeof property === 'function') {
      return property;
    }
    else {
      return literalOrIdentifier(property); 
    }
  }

  function args() {
    var args = arguments;
    return function(node, parent) {
      return allOf.apply(null, args)(node);
    };
  }

  return {
    any: any,

    allOf: allOf,

    args: args,

    assignment: function(left, right, operator) {
      return function(node, parent) {
        var typeMatches = type('AssignmentExpression')(node, parent);
        if (typeMatches) {
          return leftRightOperatorExpression(left, right, operator)(node);
        }
        return typeMatches;
      };
    },

    binaryExpression: function(left, right, operator) {
      return function(node, parent) {
        var typeMatches = type('BinaryExpression')(node);
        if (typeMatches) {
          return leftRightOperatorExpression(left, right, operator)(node);
        }
        return typeMatches;
      };
    },

    breakStatement: function() {
      return type('BreakStatement');
    },

    catchClause: function() {
      return type('CatchClause');
    },

    closureInvocation: function(closureArguments) {
      return function(node) {
        var isClosure = false;
        if (node) {
          var isCallExpression = type('CallExpression')(node);
          var calleeIsFunctionExpression = functionExpression()(node.callee);
          
          isClosure = isCallExpression && calleeIsFunctionExpression;
          if (isClosure && closureArguments) {
            return args.apply(null, closureArguments)(node);
          }
        }
        return isClosure;
      };
    },

    eachOf: function() {
      var callbacks = arguments;
      return function(node, parent) {
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i](node, parent)
        }
      }
    },

    either: or,

    expression: function() {
      return type('ExpressionStatement');
    },

    forStatement: function(init, test, update) {
      var initPredicate = predicateWrapper(init);
      var testPredicate = predicateWrapper(test);
      var updatePredicate = predicateWrapper(update);
      return function(node, parent) {
        var typeMatches = type('ForStatement')(node, parent);
        if (typeMatches && init) {
          var initMatches = initPredicate(node.init);
          if (initMatches && test) {
            var testMatches = testPredicate(node.test);
            if (testMatches && update) {
              return updatePredicate(node.update);
            }
            return testMatches;
          }
          return initMatches;
        }
        return typeMatches;
      }
    },

    functionDeclaration: function(name, params) {
      return function(node, parent) {
        var typeMatches = type('FunctionDeclaration')(node);
        if (typeMatches && arguments.length > 0) {
          return functionPredicate(name, params)(node);
        }
        return typeMatches;
      };
    },

    functionExpression: function(name, params) {
      return function(node, parent) {
        var typeMatches = type('FunctionExpression')(node);
        if (typeMatches && arguments.length > 0) {
          return functionPredicate(name, params)(node);
        }
        return typeMatches;
      };
    },

    has: withIn,

    having: withIn,

    identifier: identifier,

    ifStatement: function() {
      return type('IfStatement');
    },

    literal: literal,

    logicalExpression: function(left, right, operator) {
      return function(node) {
        var typeMatches = type('logicalExpression')(node);
        if (typeMatches) {
          return leftRightOperatorExpression(node);
        }
        return typeMatches;
      };
    },

    matches: function(predicate) {
      return function(code) {
        var matches = false;
        withIn(predicate, function() {
          matches = true;
        })(code);
        return matches;
      }
    },

    memberExpression: memberExpression,

    methodCall: function(object, method, methodArgs) {
      return function(node) {
        var typeMatches = type('CallExpression')(node);
        if (typeMatches) {
          var methodMatches = objectAndPropertyPredicate(object, method)(node.callee);
          if (methodMatches && methodArgs) {
            return args.apply(null, methodArgs)(node.arguments);
          }
          return methodMatches;
        }
        return typeMatches;
      };
    },

    name: name,

    newExpression: function(callee, newArguments) {
      var calleePredicate = predicateWrapper(callee);
      return function(node, parent) {
        var typeMatches = type('NewExpression')(node)
        if (typeMatches) {
          var calleeMatched = calleePredicate(node.callee);
          if (calleeMatched && arguments) {
            return args.apply(null, newArguments)(node);
          }
          return calleeMatched;
        }
        return typeMatches;
      };
    },

    type: function(type) {
      return function(node, parent) {
        return node && node.type === type;
      };
    },

    or: or,

    operator: value,

    params: params,

    program: function() {
      return type('Program');
    },

    property: function(key, value) {
      var keyPredicate = predicateWrapper(key);
      var valuePredicate = predicateWrapper(value);
      return function(node, parent) {
        var typeMatches = type('Property')(node);
        if (typeMatches && key) {
          var keyMatches = keyPredicate(node.key);
          if (keyMatches && value) {
            return valuePredicate(node.value);
          }
          return keyMatches;
        }
        return typeMatches;
      };
    },

    returnStatement: function(argument) {
      var argumentPredicate = predicateWrapper(argument);
      return function(node, parent) {
        var typeMatches = type('ReturnStatement')(node, parent);
        if (typeMatches && argument) {
          return argumentPredicate(node.argument);
        }
        return typeMatches;
      };
    },

    sameCode: function(expected, actual) {
      // Sanitize input
      if (typeof expected === 'string') {
        expected = esprima.parse(expected);
      }
      if (typeof actual === 'string') {
        actual = esprima.parse(actual);
      }

      // generate code from both asts.
      var expectedCode = escodegen.generate(expected),
          actualCode = escodegen.generate(actual);

      // Compare!
      return expectedCode === actualCode;
    },

    thisExpression: function() {
      return type('ThisExpression');
    },

    tryStatement: function() {
      return type('TryStatement');
    },

    updateExpression: function(argument, operator) {
      var argumentPredicate = predicateWrapper(argument);
      var operatorPredicate = (typeof operator !== 'function') ? value(operator) : operator;
      return function(node, parent) {
        var typeMatches = type('UpdateExpression')(node);
        if (typeMatches) {
          if (argument) {
            var argumentMatches = argumentPredicate(node.argument);
            if (argumentMatches && operator) {
              return operatorPredicate(node.operator);
            }
            return argumentMatches;
          }
        }
        return typeMatches;
      };
    },

    unaryExpression: function(argument, operator, prefix) {
      var argumentPredicate = predicateWrapper(argument);
      var operatorPredicate = predicateWrapper(operator);
      var prefixPredicate = predicateWrapper(prefix);
      return function(node) {
        var typeMatches = type('UnaryExpression')(node);
        if (typeMatches && argument) {
          var argumentMatches = argumentPredicate(node.argument);
          if (argumentMatches && operator) {
            var operatorMatches = operatorPredicate(node.operator);
            if (operatorMatches && operator) {
              return prefixPredicate(node.prefix);
            }
            return operatorMatches
          }
          return argumentMatches
        }
        return typeMatches;
      };
    },

    value: nodeValue,

    varStatement: function() {
      return function(node) {
        var typeMatches = type('VariableDeclaration')(node);
        if (typeMatches) {
          return node.kind === 'var';
        }
        return typeMatches;
      };
    },

    variableDeclaration: function(name, predicate) {
      var predicateToUse = predicateWrapper(predicate);
      var namePredicate = predicateWrapper(name);

      return function(node) {
        var typeMatches = type('VariableDeclarator')(node);
        if (typeMatches && name) {
          var nameMatches = namePredicate(node.id);
          if (nameMatches && predicate) {
            return predicateToUse(node.init);
          }
          return nameMatches;
        }
        return typeMatches;
      };
    },

    withArg: withIn,

    withIn: withIn
  };
}();
module.exports = esprimatch;
