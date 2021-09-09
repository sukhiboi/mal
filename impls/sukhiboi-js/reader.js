const {List, Vector, Nil, HashMap, Symbol, Str, Keyword, Number} = require("./types");

class Reader {
    constructor(tokens) {
        this.tokens = [...tokens];
        this.position = 0;
    }

    peek() {
        return this.tokens[this.position];
    }

    next() {
        const token = this.peek();
        if (token) this.position++;
        return token;
    }
}

const tokenize = str => {
    const regex =
        /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    const tokens = [];
    while ((token = regex.exec(str)[1]) !== '')
        if (token[0] !== ';') tokens.push(token);
    return tokens;
};

const read_atom = token => {
    if (token.match(/^-?[0-9]+$/)) return new Number(parseInt(token));
    if (token.match(/^-?[0-9]+\.?[0-9]+$/)) return new Number( parseFloat(token));
    if (token === 'true') return true;
    if (token === 'false') return false;
    if (token === 'nil') return new Nil();
    if(token.startsWith(':')) return new Keyword(token.slice(1))
    return new Symbol(token);
};

const read_seq = (reader, closing) => {
    reader.next();
    const result = [];
    let token = reader.peek();
    while (token !== closing) {
        if (!token) throw 'unbalanced';
        result.push(read_form(reader));
        reader.next();
        token = reader.peek();
    }
    return result;
}

const read_hashmap = reader => {
    const seq = read_seq(reader, '}');
    if (seq.length % 2 !== 0) throw 'unbalanced'
    return seq;
}

const read_string = (token) => {
    if(!/[^\\]"$/.test(token)){
        throw "unbalanced";
    }
    return token.slice(1, -1).replace(/\\(.)/g,(_, c) => c === "n" ? "\n" : c);
}

const prependSymbol = (reader, symbolStr) => {
    reader.next();
    const symbol = new Symbol(symbolStr);
    const ast = read_form(reader);
    return new List([symbol, ast]);
}

const read_form = reader => {
    const token = reader.peek();
    if (token === '(') return new List(read_seq(reader, ')'));
    if (token === '[') return new Vector(read_seq(reader, ']'));
    if (token === '{') return new HashMap(read_hashmap(reader));
    if (token.startsWith('"'))return new Str(read_string(token));
    if (token === '@') return prependSymbol(reader, 'deref')
    if (token === `'`) return prependSymbol(reader, 'quote')
    if (token === '`') return prependSymbol(reader, 'quasiquote')
    if (token === '~') return prependSymbol(reader, 'unquote')
    if (token === '~@') return prependSymbol(reader, 'splice-unquote')
    return read_atom(token);
};

const read_str = str => {
    if (str === '') return '';
    const reader = new Reader(tokenize(str));
    return read_form(reader);
};

module.exports = read_str;
