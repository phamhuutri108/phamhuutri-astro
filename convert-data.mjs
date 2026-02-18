import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createRequire } from 'module';

// Helper: đọc JS file, bọc trong function để lấy giá trị
function evalJsData(filePath, varName) {
  let code = readFileSync(filePath, 'utf8');
  // Xóa comment đầu file
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Chuyển const/let/var thành gán vào object
  code = code.replace(/^const\s+/m, 'globalThis._result = ');
  code = code.replace(/^let\s+/m, 'globalThis._result = ');
  // Thực thi
  eval(code);
  return globalThis._result;
}

mkdirSync('./src/data', { recursive: true });

// 1. films.json
{
  let code = readFileSync('../portfolio-phamhuutri/short-films-data.js', 'utf8');
  code = code.replace(/const filmsData\s*=/, 'globalThis._data =');
  eval(code);
  writeFileSync('./src/data/films.json', JSON.stringify(globalThis._data, null, 2));
  console.log('✓ films.json -', Object.keys(globalThis._data).length, 'entries');
}

// 2. commercials.json
{
  let code = readFileSync('../portfolio-phamhuutri/commercials-data.js', 'utf8');
  code = code.replace(/const commercialData\s*=/, 'globalThis._data =');
  eval(code);
  writeFileSync('./src/data/commercials.json', JSON.stringify(globalThis._data, null, 2));
  console.log('✓ commercials.json -', Object.keys(globalThis._data).length, 'entries');
}

// 3. others.json
{
  let code = readFileSync('../portfolio-phamhuutri/others-data.js', 'utf8');
  code = code.replace(/const othersData\s*=/, 'globalThis._data =');
  eval(code);
  writeFileSync('./src/data/others.json', JSON.stringify(globalThis._data, null, 2));
  console.log('✓ others.json -', Object.keys(globalThis._data).length, 'entries');
}

// 4. writings.json
{
  let code = readFileSync('../portfolio-phamhuutri/writings-data.js', 'utf8');
  code = code.replace(/const writingData\s*=/, 'globalThis._data =');
  eval(code);
  writeFileSync('./src/data/writings.json', JSON.stringify(globalThis._data, null, 2));
  console.log('✓ writings.json -', globalThis._data.length, 'entries');
}

console.log('\nDone! All data converted to JSON.');
