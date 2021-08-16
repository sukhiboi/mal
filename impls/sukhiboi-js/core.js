const Env = require("./env");
const {Nil, Symbol, Func, List} = require("./types");

const CORE_ENV = new Env(new Nil());

const coreFunctions = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '<': (a, b) => a < b,
    '>': (a, b) => a > b,
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b,
    'list': (...elements) => new List(elements),
    'list?': ast => ast instanceof List,
    'empty?': list => list.isEmpty(),
    'count': list => list.seq.length,
    '=': (a, b) => JSON.stringify(a) === JSON.stringify(b),
}

Object.keys(coreFunctions).forEach(key => CORE_ENV.set(new Symbol(key), new Func(coreFunctions[key])))

module.exports = CORE_ENV;