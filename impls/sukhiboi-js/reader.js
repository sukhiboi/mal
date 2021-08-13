class Reader {
  constructor(tokens) {
    this.tokens = tokens;
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
  while ((token = regex.exec(str)[0]) != '') tokens.push(token);
  return tokens;
};

const read_atom = token => {
  if (token.match(/^\-?[0-9]+$/)) return parseInt(token);
  if (token.match(/^\-?[0-9]+\.?[0-9]+$/)) return parseFloat(token);
};

const read_form = reader => {
  const token = reader.peek();
  reader.next();
  return read_atom(token);
};

const read_str = str => {
  const reader = new Reader(tokenize(str));
  return read_form(reader);
};

module.exports = read_str;
