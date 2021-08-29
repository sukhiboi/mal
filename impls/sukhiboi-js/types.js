class List {
    constructor(seq) {
        this.seq = seq;
    }

    isEmpty() {
        return this.seq.length === 0;
    }

    map(fn) {
        return new List(this.seq.map(fn));
    }

    toString() {
        return `(${this.seq.map(form => form.toString()).join(' ')})`
    }
}

class Vector {
    constructor(seq) {
        this.seq = seq;
    }

    isEmpty() {
        return this.seq.length === 0;
    }

    map(fn) {
        return new Vector(this.seq.map(fn));
    }

    toString() {
        return `[${this.seq.map(form => form.toString()).join(' ')}]`
    }
}

class Nil {
    constructor() {
    }

    toString() {
        return 'nil';
    }
}

class HashMap {
    constructor(seq) {
        this.seq = seq;
        this.hashmap = new Map();
        for (let i = 0; i < seq.length; i += 2) {
            this.hashmap.set(seq[i], seq[i + 1]);
        }
    }

    isEmpty() {
        return this.seq.length === 0;
    }

    valueMap(fn) {
        const hashMapSeq = [];
        for (let i = 0; i < this.seq.length; i += 2) {
            hashMapSeq.push(this.seq[i]);
            hashMapSeq.push(fn(this.seq[i + 1]));
        }
        return new HashMap(hashMapSeq);
    }

    toString() {
        return `{${this.seq.map(form => form.toString()).join(' ')}}`
    }
}

class Str {
    constructor(string) {
        this.string = string;
    }

    toString() {
        return `"${this.string
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .toString()}"`;
    }
}

class Symbol {
    constructor(symbol) {
        this.symbol = symbol
    }

    toString() {
        return `${this.symbol}`;
    }
}

class Func {
    constructor(body, params, env) {
        this.env = env;
        this.params = params;
        this.body = body;
    }

    toString() {
        return '#<function>';
    }
}

class Keyword {
    constructor(keyword) {
        this.keyword = keyword;
    }

    toString() {
        return `:${this.keyword.toString()}`;
    }
}

module.exports = {List, Vector, Nil, HashMap, Symbol, Str, Func, Keyword};