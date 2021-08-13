const readline = require('readline');
const read_str = require('./reader');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = read_str;
const EVAL = str => str;
const PRINT = str => str;
const rep = str => PRINT(EVAL(READ(str)));

const repl = () => {
  rl.question('user> ', input => {
    console.log(rep(input));
    repl();
  });
};

repl();
