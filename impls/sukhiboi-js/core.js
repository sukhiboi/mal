const Env = require("./env");
const {Nil, Symbol, List, Str, Atom, Vector} = require("./types");
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
    'vec': (list) => new Vector([...list.seq]),
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
    'slurp': fileName => new Str(fs.readFileSync(fileName.string, 'utf8')),
    'atom': value => new Atom(value),
    'atom?': atom => atom instanceof Atom,
    'deref': atom => atom.value,
    'reset!': (atom, value) => atom.reset(value),
    'cons': (list1, list2 ) => new List([list1, ...list2.seq]),
    'concat': (...lists) => new List(lists.reduce((finalList, list = []) => finalList.concat(list.seq), []))
}

Object.keys(coreFunctions).forEach(key => CORE_ENV.set(new Symbol(key), coreFunctions[key]))

module.exports = CORE_ENV;
