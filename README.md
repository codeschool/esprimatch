# esprimatch

## Usage
Esprimatch is primarily a collection of predicate functions that operate on an abstract syntax tree.
It depends on esprima and estraverse to parse and traverse the abstract syntax tree, given code as
string input. These predicates will match on attributes & values of each node and invoke a callback
function if there's a match. Here's a basic example:

```javascript
var code = "myVar = 'test';";
has(assignment('myVar', 'test', '='), function(node, parent) {
  // Do something because the code is assigning 'test' to myCar.
})(code);
```

The `has` function is alias for the entry point method, called `withIn`. `withIn` has several
aliases to help with readability, depending on what you're matching. For example:

```javascript
var code = "function() {}";
withIn(functionExpression(), function(node, parent){
  // Do something with the FunctionExpression node.
})(code);
```

The other predicates shown here are `assignment` and `functionExpression`, each matching their
respective node types. Some predicates will accept values or other predicates as arguments. For,
example the `assignment` predicate will accept a left, right, and operator arguments, that match
against the node's left hand side, right hand side, and operator properties.

By combining predicates and traversal calls, it's possible to construct a complex expression to find
a specific node. For example, this will match a `for` statement that contains a method call to
`pack.feedBird(duneInhabitants)`.

```javascript
withIn(forStatement(),
  withIn(methodCall('pack','feedBird', [memberExpression('duneInhabitants')]), function(node) {
    // Do something.
  })
)(ast);
```

Here, the `forStatement` callback is another `withIn` call that is invoked with the matched
'ForStatement' node. This then traverses that node looking for a method call to `pack.feedBird()`
with the argument `duneInhabitants`.

To avoid parsing the same code repeatedly, the abtract syntax tree can be parsed once, and passed to
`withIn` or any of its aliases. The AST will be traversed multiple times.

```javascript
var code = "myVar = 'test';function() {}",
    ast = esprima.parse(code);

has(assignment('myVar', 'test', '='), function(node, parent) {
  // Do something because the code is assigning 'test' to myCar.
})(ast);

withIn(functionExpression(), function(node, parent){
  // Do something with the FunctionExpression node.
})(ast);
```

## Local Development
To set up for local development, follow these steps:
1. Clone this repository.
2. Run `npm install`.
3. Make changes, adding unit tests to /tests.
4. Run `npm test` to see if you broke anything.
