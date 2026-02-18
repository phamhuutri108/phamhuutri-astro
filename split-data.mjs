import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const dirs = [
  'src/content/short-films',
  'src/content/commercials',
  'src/content/others',
  'src/content/writings'
];
dirs.forEach(d => mkdirSync(d, { recursive: true }));

// 1. Short Films
const films = JSON.parse(readFileSync('src/data/films.json', 'utf8'));
for (const [slug, data] of Object.entries(films)) {
  writeFileSync(`src/content/short-films/${slug}.json`, JSON.stringify(data, null, 2));
}
console.log(`✓ short-films: ${Object.keys(films).length} files`);

// 2. Commercials
const commercials = JSON.parse(readFileSync('src/data/commercials.json', 'utf8'));
for (const [slug, data] of Object.entries(commercials)) {
  writeFileSync(`src/content/commercials/${slug}.json`, JSON.stringify(data, null, 2));
}
console.log(`✓ commercials: ${Object.keys(commercials).length} files`);

// 3. Others
const others = JSON.parse(readFileSync('src/data/others.json', 'utf8'));
for (const [slug, data] of Object.entries(others)) {
  writeFileSync(`src/content/others/${slug}.json`, JSON.stringify(data, null, 2));
}
console.log(`✓ others: ${Object.keys(others).length} files`);

// 4. Writings
const writings = JSON.parse(readFileSync('src/data/writings.json', 'utf8'));
for (const item of writings) {
  const { id, ...data } = item;
  writeFileSync(`src/content/writings/${id}.json`, JSON.stringify({ id, ...data }, null, 2));
}
console.log(`✓ writings: ${writings.length} files`);

console.log('\nDone! Individual files created in src/content/');
