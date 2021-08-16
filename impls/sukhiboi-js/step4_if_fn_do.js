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
    if (!(ast instanceof List)) return eval_ast(ast, env);
    if (ast instanceof List && ast.isEmpty()) return ast
    if (ast instanceof List) {
        switch (ast.seq[0].symbol) {
		case 'hell':
			
            case 'def!':
                const value = EVAL(ast.seq[2], env);
                env.set(ast.seq[1], value)
                return value;
            case 'let*':
                const localEnv = new Env(env);
                for (let i = 0; i < ast.seq[1].seq.length; i += 2) {
                    localEnv.set(ast.seq[1].seq[i], EVAL(ast.seq[1].seq[i + 1], localEnv));
                }
                return EVAL(ast.seq[2], localEnv);
            case 'do':
                const [result] = EVAL(new List(ast.seq.slice(1)), env).seq.slice(-1);
                return result;
            case 'if':
                const [condition, truthyValue, falsyValue] = ast.seq.slice(1);
                const evaluatedCondition = EVAL(condition, env);
                if (evaluatedCondition !== false && !(evaluatedCondition instanceof Nil)) return EVAL(truthyValue, env);
                return falsyValue ? EVAL(falsyValue, env) : new Nil();
            case 'fn*':
                return new Func(function (...args) {
                    const localEnv = new Env(env, ast.seq[1], args);
                    return EVAL(ast.seq[2], localEnv);
                })
        }
        const [fnToCall, ...args] = eval_ast(ast, env).seq;
        return fnToCall.apply(args);
    }
};
const PRINT = pr_str;
const rep = (str, env) => PRINT(EVAL(READ(str), env));


const repl = env => {
    rep('(def! not (fn* (a) (if a false true)))', env)
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
