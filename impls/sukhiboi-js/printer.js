const {MalTypes} = require("./types");

const pr_str = (ast, readably ) => {
    if (Array.isArray(ast)) return `(${ast.map(pr_str).join(' ')})`;
    if(ast instanceof MalTypes) return ast.toString(readably);
    return ast;
};

module.exports = pr_str;