const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
        result = [];
    return result;
}

function validateRequiredParams(func, values) {
    if (func === undefined) {
        throw new Error("Cannot validate parameters if function is not passed in");
    }
    if (values === undefined || values.length < 1) {
        throw new Error("Cannot validate parameters if parameters to validate is empty or undefined");
    }

    let argumentNames = getParamNames(func);
    let argumentNameIndex = argumentNames.reduce(
        (hash, elem, index) => {
            hash[elem] = index;
            return hash;
        }, {});

    let requiredArgsNames = Array.from(arguments).slice(2);
    for (let requiredArgName of requiredArgsNames) {
        let index = argumentNameIndex[requiredArgName];
        if (values[index] === undefined) {
            throw new Error("function " + func.name + " is missing required parameter \"" + requiredArgName + "\"");
        }
    }

}
