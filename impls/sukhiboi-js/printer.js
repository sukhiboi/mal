const pr_str = (ast) => {
    if (Array.isArray(ast)) `(${ast.map(pr_str).join(' ')})`;
    return ast.toString();
};

module.exports = pr_str;