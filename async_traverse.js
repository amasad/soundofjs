var assert = require("assert");
var types = require('recast').types;
var Node = types.namedTypes.Node;
var isArray = types.builtInTypes.array;
var NodePath = types.NodePath;

module.exports = function(node, callback) {
    var next = [];
    function asyncTraverse(path) {
        assert.ok(path instanceof NodePath);

        if (isArray.check(path.value)) {
            next = next.concat(path.value);
        } else if (Node.check(path.value)) {
            var node = path.vlaue;

            next.push(node);

            types.eachField(node, function(name, child) {
                var childPath = path.get(name);
                assert.strictEqual(childPath.value, child);
                next.push(childPath);
            });
        }

        callback.call(next.pop(), node, asyncTraverse.bind(null, next.pop()));
    }


    if (node instanceof NodePath) {
        traverse(node);
        return node.value;
    } else {
        // Just in case we call this.replace at the root, there needs to
        // be an additional parent Path to update.
        var rootPath = new NodePath({ root: node });
        traverse(rootPath.get("root"));
        return rootPath.value.root;
    }
};