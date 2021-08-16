class List {
    constructor(seq) {
        this.seq = seq;
    }

    isEmpty() {
        return this.seq.length === 0;
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

    toString() {
        return `{${this.seq.map(form => form.toString()).join(' ')}}`
    }
}

class Str {
    constructor(string) {
        this.string = string;
    }

    toString(){
        return `"${this.string}"`;
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

module.exports = {List, Vector, Nil, HashMap, Symbol, Str};