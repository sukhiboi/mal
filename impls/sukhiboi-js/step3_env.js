const readline = require('readline');
const read_str = require('./reader');
const pr_str = require('./printer');
const {List, Symbol, Vector, HashMap, Nil} = require("./types");
const Env = require('./env');

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
            case 'def!':
                const value = EVAL(ast.seq[2], env);
                env.set(ast.seq[1], value)
                return value;
            case 'let*':
                const letEnv = new Env(env);
                for (let i = 0; i < ast.seq[1].seq.length; i += 2) {
                    letEnv.set(ast.seq[1].seq[i], EVAL(ast.seq[1].seq[i + 1], letEnv));
                }
                return EVAL(ast.seq[2], letEnv);
        }
        const [fnToCall, ...args] = eval_ast(ast, env).seq;
        return fnToCall.apply(null, args);
    }
};

const PRINT = pr_str;
const rep = (str, env) => PRINT(EVAL(READ(str), env));

const repl = repl_env => {
    rl.question('user> ', input => {
        try {
            console.log(rep(input, repl_env));
        } catch (err) {
            console.log(err);
        } finally {
            repl(repl_env);
        }
    });
};

const repl_env = new Env(new Nil());
repl_env.set(new Symbol('+'), (a, b) => a + b);
repl_env.set(new Symbol('-'), (a, b) => a - b);
repl_env.set(new Symbol('*'), (a, b) => a * b);
repl_env.set(new Symbol('/'), (a, b) => a / b);

repl(repl_env);
