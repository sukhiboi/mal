const readline = require('readline');
const read_str = require('./reader');
const pr_str = require('./printer');
const {List, Symbol, Vector, HashMap, Nil, Func, Keyword} = require("./types");
const Env = require('./env');
const CORE_ENV = require('./core');
const {zip, last, reverse} = require("ramda");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const eval_ast = (ast, env) => {
    if (ast instanceof List) return ast.map(form => EVAL(form, env))
    if (ast instanceof Vector) return ast.map(form => EVAL(form, env))
    if (ast instanceof HashMap) return ast.valueMap(form => EVAL(form, env))
    if (ast instanceof Symbol) return env.get(ast);
    if (ast instanceof Keyword) return env.get(ast);
    return ast;
}

const quasiquote = (ast) => {
    if(!(ast instanceof List || ast instanceof Vector)){
        if(ast instanceof Symbol || ast instanceof HashMap){
            return new List([new Symbol('quote'), ast]);
        }
        return ast;
    }

    if (ast instanceof List && ast.seq[0] && ast.seq[0].symbol === 'unquote') return ast.seq[1];

    let result = new List([]);
    reverse(ast.seq).forEach(elt => {
        if ((elt instanceof List) && elt.seq[0] && elt.seq[0].symbol === 'splice-unquote') {
            result = new List([new Symbol('concat'), elt.seq[1], result]);
        } else {
            result = new List([new Symbol('cons'), quasiquote(elt), result]);
        }
    })
    return (ast instanceof List) ? result : new List([new Symbol('vec'), result])
}

const is_macro_call = (ast, env) => {
    if(!(ast instanceof List)) return false;
    const elt = ast.seq[0];
    return elt instanceof Symbol &&
        !(env.find(elt) instanceof Nil) &&
        env.get(elt) instanceof Func &&
        env.get(elt).isMacro
}

const macroexpand = (ast, env) => {
    while(is_macro_call(ast, env)) {
        const macro = env.get(ast.seq[0]);
        ast = macro.apply(ast.seq.slice(1));
    }
    return ast;
}

const READ = read_str;
const EVAL = (ast, env) => {
    while (true) {
        ast = macroexpand(ast, env);
        if (!(ast instanceof List)) return eval_ast(ast, env);
        if (ast instanceof List && ast.isEmpty()) return ast
        if (ast instanceof List) {
            switch (ast.seq[0].symbol) {
                case 'def!':
                    const value = EVAL(ast.seq[2], env);
                    return env.set(ast.seq[1], value);
                case 'defmacro!':
                    const val = EVAL(ast.seq[2], env);
                    val.isMacro = true;
                    return env.set(ast.seq[1], val);
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
                    instructions.seq.forEach(inst => EVAL(inst, env))
                    ast = last(instructions.seq);
                    break;
                case 'if':
                    const [condition, truthyValue, falsyValue] = ast.seq.slice(1);
                    const evaluatedCondition = EVAL(condition, env);
                    if (evaluatedCondition !== false && !(evaluatedCondition instanceof Nil)) ast = truthyValue;
                    else ast = falsyValue ? falsyValue : new Nil();
                    break;
                case 'fn*':
                    const fn = (...args) => {
                        const newEnv = new Env(env, ast.seq[1], args);
                        return EVAL(ast.seq[2], newEnv);
                    }
                    return new Func(ast.seq[2], ast.seq[1], env, fn);
                case 'quote':
                    return ast.seq[1];
                case 'quasiquoteexpand':
                    return quasiquote(ast.seq[1]);
                case 'quasiquote':
                    ast = quasiquote(ast.seq[1]);
                    continue;
                case 'macroexpand':
                    return macroexpand(ast.seq[1], env);
                default:
                    const [fnToCall, ...args] = eval_ast(ast, env).seq;
                    if (fnToCall instanceof Func) {
                        ast = fnToCall.body;
                        env = new Env(env, fnToCall.params, args);
                    }
                    if (!(fnToCall instanceof Function)) {
                        return fnToCall;
                    }
                    return fnToCall.apply(null, args);
            }
        }
    }
};
const PRINT = pr_str;
const rep = (str, env) => PRINT(EVAL(READ(str), env), true);

CORE_ENV.set(new Symbol('eval'), ast => EVAL(ast, CORE_ENV));
CORE_ENV.set(new Symbol('swap!'), (atom, func, ...args) => {
    const list = new List([
        new Symbol('reset!'),
        atom,
        new List([
            func,
            atom.value,
            ...args
        ])
    ]);
    return EVAL(list, CORE_ENV);
});

/**
 * (def swap! (fn* [atom func, ...arg] (reset! atom (func (deref atom) ...args))))
 * @param env
 */

const repl = env => {
    // rep('(def! not (fn* (a) (if a false true)))', env);
    // rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\\nnil)")))))', env)
    // rep('(def! f "impls/tests/incA.mal")', env);
    rep('(defmacro! identity (fn* [x] x))', env);
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
