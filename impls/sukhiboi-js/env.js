const {Nil} = require("./types");

class Env {
    constructor(outerEnv) {
        this.outerEnv = outerEnv;
        this.data = {};
    }

    set(key, ast) {
        this.data[key.symbol] = ast;
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