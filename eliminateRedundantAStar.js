module.exports = function(fileInfo, api) {
    var source = fileInfo.source,
        shift = api.jscodeshift,
        shiftSource = shift(fileInfo.source);

    var functionMakers = ["F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"];
    var functionCallers = ["A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"];
    var arities = {
        _elm_lang$core$Basics$compare: 2,
        _elm_lang$core$Basics$max: 2,
        _elm_lang$core$Basics$min: 2,
        _elm_lang$core$Basics$xor: 2,
        _elm_lang$core$Basics$rem: 2,
        _elm_lang$core$Basics$clamp: 3,
        _elm_lang$core$Basics$logBase: 2,
        _elm_lang$core$Basics$atan2: 2
    };

    shiftSource
        .find(shift.VariableDeclarator)
        .filter(function(path) {
            return (
                path.value.init &&
                path.value.init.type === "CallExpression" &&
                functionMakers.indexOf(path.value.init.callee.name) !== -1 &&
                path.value.id.name !== "update"
            );
        })
        .forEach(function(path) {
            arities[path.value.id.name] =
                functionMakers.indexOf(path.value.init.callee.name) + 2;
        });

    return shiftSource
        .find(shift.CallExpression)
        .filter(function(path) {
            var calledFunction, specifiedArity;

            return (
                functionCallers.indexOf(path.value.callee.name) !== -1 &&
                (calledFunction = path.value.arguments[0].name) &&
                (specifiedArity = arities[calledFunction]) &&
                specifiedArity == path.value.arguments.length - 1
            );
        })
        .map(function(path) {
            var args = path.value.arguments;
            var calledFunction = args.shift();

            return path.replace(
                shift.callExpression(
                    shift.memberExpression(
                        calledFunction,
                        shift.identifier("func")
                    ),
                    args
                )
            );
        })
        .toSource();
};
