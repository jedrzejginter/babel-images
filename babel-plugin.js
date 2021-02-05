const { execSync } = require('child_process');
const { join } = require('path');
const { quote } = require('shell-quote');

module.exports = function plugin(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path;

        if (
          !t.isStringLiteral(node.source) ||
          !/^img:/.test(node.source.value)
        ) {
          return;
        }

        const defSpec = node.specifiers[0];
        const filenameIn = node.source.value.slice(4);

        const r = execSync(
          `node ${join(__dirname, 'resizer.js')} ${quote([
            join(process.cwd(), filenameIn),
            join(process.cwd(), 'out'),
          ])}`,
        );
        const d = JSON.parse(r.toString());

        const o = t.objectExpression([
          t.objectProperty(t.identifier('height'), t.numericLiteral(d.height)),
          t.objectProperty(t.identifier('width'), t.numericLiteral(d.width)),
          t.objectProperty(t.identifier('bytes'), t.numericLiteral(d.bytes)),
          t.objectProperty(t.identifier('base64'), t.stringLiteral(d.base64)),
          t.objectProperty(t.identifier('hash'), t.stringLiteral(d.hash)),
          t.objectProperty(
            t.identifier('filename'),
            t.stringLiteral(d.filename),
          ),
        ]);

        const dec = t.variableDeclarator(t.identifier(defSpec.local.name), o);

        path.replaceWith(t.variableDeclaration('const', [dec]));
      },
    },
  };
};
