const { execSync } = require('child_process');
const { mkdirSync } = require('fs');
const { join } = require('path');
const { quote } = require('shell-quote');

const cache = {};

module.exports = function plugin(babel, options) {
  const { types: t } = babel;

  const {
    outDir: OUT_DIR = join(process.cwd(), 'out'),
    resolveDir: RESOLVE_DIR = process.cwd(),
  } = options;

  mkdirSync(OUT_DIR, { recursive: true });

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
        const filenamePath = node.source.value.slice(4);

        const [filenameIn, query = ''] = filenamePath.split('?');

        let d = cache[filenamePath];

        if (!d) {
          const r = execSync(
            `node ${join(__dirname, 'resizer.js')} ${quote([
              join(RESOLVE_DIR, filenameIn),
              join(OUT_DIR),
              query,
            ])}`,
            { stderr: 'inherit' },
          );

          d = JSON.parse(r.toString());
          cache[filenamePath] = d;
        }

        const o = t.objectExpression([
          t.objectProperty(t.identifier('height'), t.numericLiteral(d.height)),
          t.objectProperty(t.identifier('width'), t.numericLiteral(d.width)),
          t.objectProperty(t.identifier('bytes'), t.numericLiteral(d.bytes)),
          t.objectProperty(t.identifier('hash'), t.stringLiteral(d.hash)),
          t.objectProperty(t.identifier('format'), t.stringLiteral(d.format)),
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
