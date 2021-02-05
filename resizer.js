const hasha = require('hasha');
const { join, parse } = require('path');
const querystring = require('querystring');
const sharp = require('sharp');

const [filenameIn, outDir, queryStr = ''] = process.argv.slice(2);

function hasOwn(o, p) {
  return Object.prototype.hasOwnProperty.call(o, p);
}

const knownFormats = ['png', 'jpeg', 'tiff'];

(async () => {
  const query = querystring.parse(queryStr);
  const parsed = parse(filenameIn);
  let f = await sharp(filenameIn);
  const originBuf = await f.toBuffer();

  if (hasOwn(query, 'width')) {
    f = f.resize(Number(query.width));
  }

  if (hasOwn(query, 'quality')) {
    const originMeta = await sharp(originBuf).metadata();
    const quality = Number(query.quality);

    if (originMeta.format === 'png') {
      f = f.png({ quality });
    } else if (originMeta.format === 'tiff') {
      f = f.tiff({ quality });
    } else {
      f = f.jpeg({ quality });
    }
  }

  if (hasOwn(query, 'format') && knownFormats.includes(query.format)) {
    f = f.toFormat(query.format);
  }

  const buf = await f.toBuffer();

  const meta = await sharp(buf).metadata();
  const hash = await hasha.async(buf);
  const shortHash = hash.slice(0, 7);

  const filenameOut = `${parsed.name}.${shortHash}.${meta.format}`;
  await sharp(buf).toFile(join(outDir, filenameOut));

  process.stdout.write(
    JSON.stringify({
      hash: shortHash,
      height: meta.height || 0,
      width: meta.width || 0,
      bytes: meta.size || 0,
      filename: filenameOut,
      format: meta.format,
      // base64: `data:image/${meta.format};base64,${buf.toString('base64')}`,
    }),
  );

  process.exit(0);
})();
