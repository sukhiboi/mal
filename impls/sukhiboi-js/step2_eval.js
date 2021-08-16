const readline = require('readline');
const read_str = require('./reader');
const pr_str = require('./printer');
const {List, Symbol, Vector, HashMap} = require("./types");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const eval_ast = (ast, env) => {
    if (ast instanceof List) return ast.map(form => EVAL(form, env))
    if (ast instanceof Vector) return ast.map(form => EVAL(form, env))
    if (ast instanceof HashMap) return ast.valueMap(form => EVAL(form, env))
    if (ast instanceof Symbol) return env[ast.symbol]
    return ast;
}

const READ = read_str;
const EVAL = (ast, env) => {
    if (!(ast instanceof List)) return eval_ast(ast, env);
    if (ast instanceof List && ast.isEmpty()) return ast
    if (ast instanceof List) {
        const evaluatedAst = eval_ast(ast, env);
        if (evaluatedAst instanceof List) {
            const [fnToCall, ...args] = evaluatedAst.seq;
            return fnToCall.apply(null, args);
        }
        return evaluatedAst;
    }
};
const PRINT = pr_str;
const rep = (str, env) => PRINT(EVAL(READ(str), env));

const repl = repl_env => {
    rl.question('user> ', input => {
        try{
            console.log(rep(input, repl_env));
        } catch (err) {
            console.log(err);
        } finally {
            repl(repl_env);
        }
    });
};

const repl_env = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
}

repl(repl_env);
