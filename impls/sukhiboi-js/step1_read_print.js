const readline = require('readline');
const read_str = require('./reader');
const pr_str = require('./printer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = read_str;
const EVAL = str => str;
const PRINT = pr_str;
const rep = str => PRINT(EVAL(READ(str)));

const repl = () => {
  rl.question('user> ', input => {
    try {
      console.log(rep(input));
    } catch (err) {
      console.log(err);
    } finally {
      repl();
    }
  });
};

repl();
