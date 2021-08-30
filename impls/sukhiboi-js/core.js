const Env = require("./env");
const {Nil, Symbol, List, Str} = require("./types");
const fs = require('fs');
const read_str = require("./reader");
const pr_str = require("./printer");

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
    "str": (...args) => new Str(args.map(arg => pr_str(arg, false)).join('')),
    "println": (...args) => {
        console.log(args.map(arg => pr_str(arg)).join(' '));
        return new Nil();
    },
    "prn": (...args) => {
        console.log(args.map(arg => pr_str(arg, true)).join(' '));
        return new Nil();
    },
    'read-string': str => {
        return read_str(str)
    },
    'slurp': fileName => new Str(fs.readFileSync(fileName.string, 'utf8'))
}

Object.keys(coreFunctions).forEach(key => CORE_ENV.set(new Symbol(key), coreFunctions[key]))

module.exports = CORE_ENV;