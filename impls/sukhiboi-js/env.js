const {Nil, List} = require("./types");

class Env {
    constructor(outerEnv, bindings = new List([]), expressions = []) {
        this.outerEnv = outerEnv;
        this.data = {};
        bindings.seq.forEach((binding, idx) => this.set(binding, expressions[idx]));
    }

    set(key, ast) {
        this.data[key.symbol] = ast;
        return ast;
    }

    find(key) {
        if (key.symbol in this.data) return this;
        if (!(this.outerEnv instanceof Nil)) return this.outerEnv.find(key);
        return new Nil();
    }

    get(key) {
        const value = this.find(key);
        if (value instanceof Nil) throw `${key.symbol} not found`;
        return value.data[key.symbol];
    }
}

module.exports = Env;