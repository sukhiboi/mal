const readline = require('readline');
const read_str = require('./reader');
const pr_str = require('./printer');
const {List, Symbol, Vector, HashMap, Nil, Func} = require("./types");
const Env = require('./env');
const CORE_ENV = require('./core');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const eval_ast = (ast, env) => {
    if (ast instanceof List) return ast.map(form => EVAL(form, env))
    if (ast instanceof Vector) return ast.map(form => EVAL(form, env))
    if (ast instanceof HashMap) return ast.valueMap(form => EVAL(form, env))
    if (ast instanceof Symbol) return env.get(ast);
    return ast;
}

const READ = read_str;
const EVAL = (ast, env) => {
    while (true) {
        if (!(ast instanceof List)) return eval_ast(ast, env);
        if (ast instanceof List && ast.isEmpty()) return ast
        if (ast instanceof List) {
            switch (ast.seq[0].symbol) {
                case 'def!':
                    const value = EVAL(ast.seq[2], env);
                    env.set(ast.seq[1], value)
                    return value;
                case 'let*':
                    const localEnv = new Env(env);
                    const bindingList = ast.seq[1].seq;
                    for (let i = 0, j = i + 1; i < bindingList.length; i += 2) {
                        let evaluatedValue = EVAL(bindingList[j], localEnv);
                        localEnv.set(bindingList[i], evaluatedValue);
                    }
                    env = localEnv;
                    ast = ast.seq[2];
                    break;
                case 'do':
                    const instructions = new List(ast.seq.slice(1));
                    instructions.seq.slice(0, -1).forEach(inst => eval_ast(inst, env))
                    ast = instructions.seq[instructions.seq.length - 1];
                    break;
                case 'if':
                    const [condition, truthyValue, falsyValue] = ast.seq.slice(1);
                    const evaluatedCondition = EVAL(condition, env);
                    if (evaluatedCondition !== false && !(evaluatedCondition instanceof Nil)) ast = truthyValue;
                    else ast = falsyValue ? falsyValue : new Nil();
                    break;
                case 'fn*':
                    return new Func(ast.seq[2], ast.seq[1], env);
                default:
                    const [fnToCall, ...args] = eval_ast(ast, env).seq;
                    if (fnToCall instanceof Function) return fnToCall.apply(null, args);
                    if (fnToCall instanceof Func) {
                        ast = fnToCall.body;
                        env = new Env(env, fnToCall.params, args);
                    }
            }
        }
    }
};
const PRINT = pr_str;
const rep = (str, env) => PRINT(EVAL(READ(str), env));


const repl = env => {
    // rep('(def! not (fn* (a) (if a false true)))', env)
    rl.question('user> ', input => {
        try {
            console.log(rep(input, env));
        } catch (err) {
            console.log(err);
        } finally {
            repl(env);
        }
    });
};

repl(CORE_ENV);
