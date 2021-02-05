const hasha = require('hasha');
const { join, parse } = require('path');
const sharp = require('sharp');

const [filenameIn, outDir] = process.argv.slice(2);

(async () => {
  const parsed = parse(filenameIn);
  const buf = await sharp(filenameIn)
    .jpeg({ quality: 10 })
    .resize(10)
    .toBuffer();

  const meta = await sharp(buf).metadata();
  const hash = await hasha.async(buf);
  const shortHash = hash.slice(0, 7);

  const filenameOut = `${parsed.name}.${shortHash}${parsed.ext}`;
  await sharp(buf).toFile(join(outDir, filenameOut));

  process.stdout.write(
    JSON.stringify({
      hash: shortHash,
      height: meta.height || 0,
      width: meta.width || 0,
      bytes: meta.size || 0,
      filename: filenameOut,
      base64: `data:image/${meta.format};base64,${buf.toString('base64')}`,
    }),
  );

  process.exit(0);
})();
