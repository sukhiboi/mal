const readline = require('readline');
const read_str = require('./reader');
const pr_str = require('./printer');
const {List, Symbol, Vector, HashMap, Nil, Func} = require("./types");
const Env = require('./env');
const CORE_ENV = require('./core');
const {zip, last} = require("ramda");
const chalk = require("chalk");

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
                    return env.set(ast.seq[1], value);
                case 'let*':
                    const localEnv = new Env(env);
                    const bindingList = ast.seq[1].seq;
                    const keyValuePairs = zip(bindingList, bindingList.slice(1));
                    keyValuePairs.forEach(([key, value]) => localEnv.set(key, EVAL(value, localEnv)));
                    env = localEnv;
                    ast = ast.seq[2];
                    break;
                case 'do':
                    const instructions = new List(ast.seq.slice(1));
                    instructions.seq.forEach(inst => eval_ast(inst, env))
                    ast = last(instructions.seq);
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
    rep('(def! not (fn* (a) (if a false true)))', env)
    const prompt = [
        chalk.blue(chalk.bold('❯ ')),
    ].join('');
    rl.question(prompt, input => {
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
