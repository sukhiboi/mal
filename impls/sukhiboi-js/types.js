class MalTypes {
    constructor() {
    }
}

class List extends MalTypes {
    constructor(seq) {
        super();
        this.seq = seq;
    }

    isEmpty() {
        return this.seq.length === 0;
    }

    map(fn) {
        return new List(this.seq.map(fn));
    }

    toString(readably) {
        return `(${this.seq.map(form => form.toString(readably)).join(' ')})`
    }
}

class Vector extends MalTypes {
    constructor(seq) {
        super();
        this.seq = seq;
    }

    isEmpty() {
        return this.seq.length === 0;
    }

    map(fn) {
        return new Vector(this.seq.map(fn));
    }

    toString(readably) {
        return `[${this.seq.map(form => form.toString(readably)).join(' ')}]`
    }
}

class Nil extends MalTypes {
    constructor() {
        super();
    }

    toString() {
        return 'nil';
    }
}

class HashMap extends MalTypes {
    constructor(seq) {
        super();
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

    toString(readably) {
        return `{${this.seq.map(form => form.toString(readably)).join(' ')}}`
    }
}

class Str extends MalTypes {
    constructor(string) {
        super();
        this.string = string;
    }

    concat(string) {
        return new Str(`${this.string}${string.string}`);
    }

    toString(readably) {
        if(readably) return `"${this.string
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .toString()}"`;
        return this.string;
    }
}

class Number extends MalTypes  {
    constructor(number) {
        super();
        this.number = number
    }

    toString() {
        return `${this.number}`;
    }
}

class Symbol extends MalTypes {
    constructor(symbol) {
        super();
        this.symbol = symbol
    }

    toString() {
        return `${this.symbol}`;
    }
}

class Func extends MalTypes {
    constructor(body, params, env) {
        super();
        this.env = env;
        this.params = params;
        this.body = body;
    }

    toString() {
        return '#<function>';
    }
}

class Keyword extends MalTypes {
    constructor(keyword) {
        super();
        this.keyword = keyword;
    }

    toString() {
        return `:${this.keyword.toString()}`;
    }
}

class Atom extends MalTypes {
    constructor(value) {
        super();
        this.value = value;
    }

    reset(value) {
        this.value = value;
        return this.value;
    }

    toString() {
        return `(Atom ${this.value})`;
    }
}

module.exports = {List, Vector, Nil, HashMap, Symbol, Str, Func, Keyword, Atom, Number, MalTypes};
