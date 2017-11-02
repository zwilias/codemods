module.exports = function(fileInfo, api) {
    var source = fileInfo.source,
        shift = api.jscodeshift,
        shiftSource = shift(fileInfo.source);

    var nodeToInsert = shift.ifStatement(
        shift.logicalExpression(
            "&&",
            shift.binaryExpression(
                "instanceof",
                shift.identifier("x"),
                shift.identifier("String")
            ),
            shift.binaryExpression(
                "===",
                shift.callExpression(
                    shift.memberExpression(
                        shift.identifier("x"),
                        shift.identifier("valueOf")
                    ),
                    []
                ),
                shift.callExpression(
                    shift.memberExpression(
                        shift.identifier("y"),
                        shift.identifier("valueOf")
                    ),
                    []
                )
            )
        ),
        shift.blockStatement([shift.returnStatement(shift.literal(true))])
    );

    return shiftSource
        .find("FunctionDeclaration")
        .filter(function(node) {
            return node.value.id.name === "eqHelp";
        })
        .find("BlockStatement")
        .at(0)
        .map(function(block) {
            block.node.body.splice(2, 0, nodeToInsert);
        })
        .toSource();
};
