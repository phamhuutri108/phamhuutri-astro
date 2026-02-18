/**
 * migrate-data.mjs
 * Chuyển đổi cấu trúc dữ liệu:
 * - Short Films: vi/en blob → info, trailer_url, logline, statement, soundtrack_url, crew
 * - Commercials: vi/en blob → info, video_url, description
 * - Others: giữ nguyên vi/en
 * - Writings: giữ nguyên
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// ─── HELPERS ────────────────────────────────────────────────────────────────

/** Lấy nội dung HTML trước block element đầu tiên (<div hoặc <h3>) */
function extractInfoHtml(html) {
  const text = html.trim();
  const divIdx = text.indexOf('<div');
  const h3Idx  = text.indexOf('<h3>');

  let endIdx = text.length;
  if (divIdx !== -1) endIdx = Math.min(endIdx, divIdx);
  if (h3Idx  !== -1) endIdx = Math.min(endIdx, h3Idx);

  return text.substring(0, endIdx).trim();
}

/** Lấy nội dung sau thẻ <h3>heading</h3> cho đến <h3> tiếp theo */
function extractSectionContent(html, headingText) {
  const marker = `<h3>${headingText}</h3>`;
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return '';

  const start   = markerIdx + marker.length;
  const nextH3  = html.indexOf('<h3>', start);
  const end     = nextH3 === -1 ? html.length : nextH3;
  return html.substring(start, end).trim();
}

/** Lấy URL từ iframe YouTube */
function extractYoutubeUrl(html) {
  const match = html.match(/src="(https:\/\/www\.youtube\.com\/embed\/[^"]+)"/);
  return match ? match[1] : '';
}

/** Lấy URL từ iframe SoundCloud */
function extractSoundcloudUrl(html) {
  const match = html.match(/src="(https:\/\/w\.soundcloud\.com\/player\/[^"]+)"/);
  return match ? match[1] : '';
}

// ─── 1. SHORT FILMS ─────────────────────────────────────────────────────────
{
  const films = JSON.parse(readFileSync('./src/data/films.json', 'utf8'));
  mkdirSync('./src/content/short-films', { recursive: true });

  for (const [id, data] of Object.entries(films)) {
    const vi = data.vi || '';
    const en = data.en || '';

    const newData = {
      title:     data.title,
      thumbnail: data.thumbnail,
      info: {
        vi: extractInfoHtml(vi),
        en: extractInfoHtml(en)
      },
      trailer_url: extractYoutubeUrl(vi) || extractYoutubeUrl(en) || '',
      logline: {
        vi: extractSectionContent(vi, 'Logline'),
        en: extractSectionContent(en, 'Logline')
      },
      statement: {
        vi: extractSectionContent(vi, 'Director\u2019s Statement'),
        en: extractSectionContent(en, 'Director\u2019s Statement')
      },
      soundtrack_url: extractSoundcloudUrl(vi) || extractSoundcloudUrl(en) || '',
      crew: {
        vi: extractSectionContent(vi, 'Crew'),
        en: extractSectionContent(en, 'Crew')
      }
    };

    // Xóa fields rỗng
    if (!newData.trailer_url)   delete newData.trailer_url;
    if (!newData.soundtrack_url) delete newData.soundtrack_url;
    if (!newData.logline.vi && !newData.logline.en)   delete newData.logline;
    if (!newData.statement.vi && !newData.statement.en) delete newData.statement;
    if (!newData.crew.vi && !newData.crew.en)           delete newData.crew;

    // Giữ lại crewData và btsData nếu có
    if (data.crewData) newData.crewData = data.crewData;
    if (data.btsData)  newData.btsData  = data.btsData;

    writeFileSync(
      `./src/content/short-films/${id}.json`,
      JSON.stringify(newData, null, 2)
    );
  }
  console.log(`✓ short-films: ${Object.keys(films).length} files`);
}

// ─── 2. COMMERCIALS ─────────────────────────────────────────────────────────
{
  const commercials = JSON.parse(readFileSync('./src/data/commercials.json', 'utf8'));
  mkdirSync('./src/content/commercials', { recursive: true });

  for (const [id, data] of Object.entries(commercials)) {
    const vi = data.vi || '';
    const en = data.en || '';

    const newData = {
      title:     data.title,
      thumbnail: data.thumbnail,
      info: {
        vi: extractInfoHtml(vi),
        en: extractInfoHtml(en)
      },
      video_url: extractYoutubeUrl(vi) || extractYoutubeUrl(en) || '',
      description: {
        vi: extractSectionContent(vi, 'Mô tả vai trò'),
        en: extractSectionContent(en, 'Role Description')
      }
    };

    if (!newData.video_url) delete newData.video_url;
    if (!newData.description.vi && !newData.description.en) delete newData.description;

    writeFileSync(
      `./src/content/commercials/${id}.json`,
      JSON.stringify(newData, null, 2)
    );
  }
  console.log(`✓ commercials: ${Object.keys(commercials).length} files`);
}

// ─── 3. OTHERS (giữ nguyên vi/en) ──────────────────────────────────────────
{
  const others = JSON.parse(readFileSync('./src/data/others.json', 'utf8'));
  mkdirSync('./src/content/others', { recursive: true });

  for (const [id, data] of Object.entries(others)) {
    writeFileSync(
      `./src/content/others/${id}.json`,
      JSON.stringify(data, null, 2)
    );
  }
  console.log(`✓ others: ${Object.keys(others).length} files`);
}

// ─── 4. WRITINGS (giữ nguyên) ───────────────────────────────────────────────
{
  const writings = JSON.parse(readFileSync('./src/data/writings.json', 'utf8'));
  mkdirSync('./src/content/writings', { recursive: true });

  for (const item of writings) {
    const { id, ...rest } = item;
    writeFileSync(
      `./src/content/writings/${id}.json`,
      JSON.stringify({ id, ...rest }, null, 2)
    );
  }
  console.log(`✓ writings: ${writings.length} files`);
}

console.log('\nDone! Migration complete.');
