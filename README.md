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

### Traveral
In the above example, the `has` call is the start of the traversal. The `has` function is an alias
for `withIn`. `withIn` has several aliases to help with readability, depending on what you're
matching. For example:

```javascript
var code = "function() {}";
withIn(functionExpression(), function(node, parent){
  // Do something with the FunctionExpression node.
})(code);
```

###Predicates
The other predicates shown in the above example are `assignment` and `functionExpression`, each
matching their respective node types. Some predicates will accept values or other predicates as
arguments. For, example the `assignment` predicate will accept a left, right, and operator
arguments, that match against the node's left hand side, right hand side, and operator properties.

By combining predicates and traversal calls, it's possible to construct a complex expression to find
a specific node. For example, this will match a `for` statement that contains a method call to
`pack.feedBird(duneInhabitants)`.

```javascript
withIn(forStatement(),
  having(methodCall('pack','feedBird', [memberExpression('duneInhabitants')]), function(node) {
    // Do something.
  })
)(ast);
```

Here, the `forStatement` callback is another `withIn` call that is invoked with the matched
'ForStatement' node. This then traverses that node looking for a method call to `pack.feedBird()`
with the argument `duneInhabitants`.

### Grouping Predicates
It is also possible to group several unrelated calls on a matched node. Given the code:

```javascript
function feedAllBirds() {
  // array of all the inhabitants
  var duneInhabitants = [numba, loopy, tryCatcher];
  
  // loop through duneInhabitants and if Bird call feedBird()
  for (var i = 0; i < duneInhabitants.length; i++) {
    pack.feedBird(duneInhabitants[i]);
  }
}
```

`eachOf` allows for calling multiple matching statements with a matched node. For example:
```javascript
withIn(functionDeclaration('feedAllBirds'),
  eachOf(
    having(variableDeclaration('dunInhabitants'), function(node, parent) {
      // Do something.
    }),
    withIn(forStatement(),
      having(methodCall('pack','feedBird', [memberExpression('duneInhabitants', identifier('i'))]), function(node) {
        // Do something.
      }),
    )
  )
);
```

The AST node matching the `function feedAllBirds()` is matched and passed to `eachOf()`, which then
calls the two matching expressions given to it.

###Performance
To avoid parsing the same code repeatedly, the abtract syntax tree can be parsed once, and passed to
`withIn` or any of its aliases. The entire AST will be still be traversed.

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
