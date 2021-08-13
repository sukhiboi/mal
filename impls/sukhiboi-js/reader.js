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
  if (token.match(/^-?[0-9]+$/)) return parseInt(token);
  if (token.match(/^-?[0-9]+\.?[0-9]+$/)) return parseFloat(token);
  return token;
};

const read_list = reader => {
  const result = [];
  while ((token = reader.peek()) !== ')') {
    if (!token) throw "unbalanced";
    result.push(read_form(reader));
    reader.next();
  }
  return result;
};

const read_form = reader => {
  const token = reader.peek();
  if (token === '(') {
    reader.next();
    return read_list(reader);
  }
  return read_atom(token);
};

const read_str = str => {
  if (str === '') return '';
  const reader = new Reader(tokenize(str));
  return read_form(reader);
};

module.exports = read_str;
