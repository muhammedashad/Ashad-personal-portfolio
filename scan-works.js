/**
 * ASHAD — 3D CREATIVE UNIVERSE
 * Asset Scanning & Structured Manifest Generation Script
 * 
 * - Scans C:\Ashadcreative\assets\workes\
 * - 183 individual creative images (1-49, 51-184)
 * - 30 multi-image collections (Carousel 1-30)
 * - 9 PDF documents (PDF 1-9)
 * - Total = 222 items mapped to 9 latitude rings on the 3D globe
 * - Neutral naming: CREATIVE 001, COLLECTION 01, DOCUMENT 01
 * - Embeds Base64 data URIs for all thumbnails so textures load with 100% reliability
 *   across both file:// and http:// protocols without CORS errors
 * - Generates works-manifest.json and projects-data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const WORKES_DIR = path.join(ROOT_DIR, 'assets', 'workes');
const THUMB_DIR = path.join(ROOT_DIR, 'assets', 'thumbnails');
const PDF_THUMB_DIR = path.join(ROOT_DIR, 'assets', 'pdf-thumbnails');

// Binary parser for fast image dimensions
function getImageDimensions(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xFF && buf[1] === 0xD8) {
      let offset = 2;
      while (offset < buf.length) {
        if (buf[offset] !== 0xFF) break;
        const marker = buf[offset + 1];
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
        }
        const len = buf.readUInt16BE(offset + 2);
        offset += 2 + len;
      }
    }
  } catch (e) {}
  return { width: 1080, height: 1440 }; // Portrait default
}

function getBase64DataUri(filePath, mimeType = 'image/jpeg') {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath).toString('base64');
      return `data:${mimeType};base64,${data}`;
    }
  } catch (e) {}
  return '';
}

function runScanner() {
  console.log('Scanning creative assets in:', WORKES_DIR);
  if (!fs.existsSync(WORKES_DIR)) {
    console.error('Error: Directory does not exist:', WORKES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(WORKES_DIR);

  // 1. Individual Images
  const individualImages = [];
  // 2. Collections Map (Carousel N.slide)
  const collectionsMap = {};
  // 3. Documents Map (PDF N-page-slide)
  const documentsMap = {};

  files.forEach(f => {
    const imgMatch = f.match(/^(\d+)\.(jpg|jpeg|png|webp)$/i);
    const colMatch = f.match(/^Carousel\s*(\d+)[\.\-](\d+)\.(jpg|jpeg|png|webp)$/i);
    const docMatch = f.match(/^PDF\s*(\d+)[\-_]page[\-_](\d+)\.(jpg|jpeg|png|webp)$/i);

    if (imgMatch) {
      const num = parseInt(imgMatch[1], 10);
      const fullPath = path.join(WORKES_DIR, f);
      const thumbFile = path.join(THUMB_DIR, f);
      const dim = getImageDimensions(fullPath);
      const thumbDataUri = getBase64DataUri(fs.existsSync(thumbFile) ? thumbFile : fullPath);

      individualImages.push({
        id: 'creative-' + num,
        type: 'image',
        number: num,
        label: 'CREATIVE ' + String(num).padStart(3, '0'),
        title: 'Creative ' + String(num).padStart(3, '0'),
        filename: f,
        thumbPath: fs.existsSync(thumbFile) ? 'assets/thumbnails/' + f : 'assets/workes/' + f,
        fullPath: 'assets/workes/' + f,
        thumbDataUri: thumbDataUri,
        width: dim.width,
        height: dim.height,
        aspectRatio: Number((dim.width / dim.height).toFixed(3))
      });
    } else if (colMatch) {
      const collId = parseInt(colMatch[1], 10);
      const slideNum = parseInt(colMatch[2], 10);
      if (!collectionsMap[collId]) collectionsMap[collId] = [];
      const dim = getImageDimensions(path.join(WORKES_DIR, f));
      collectionsMap[collId].push({
        filename: f,
        slide: slideNum,
        path: 'assets/workes/' + f,
        fullPath: path.join(WORKES_DIR, f),
        width: dim.width,
        height: dim.height,
        aspectRatio: Number((dim.width / dim.height).toFixed(3))
      });
    } else if (docMatch) {
      const docId = parseInt(docMatch[1], 10);
      const pageNum = parseInt(docMatch[2], 10);
      if (!documentsMap[docId]) documentsMap[docId] = [];
      const dim = getImageDimensions(path.join(WORKES_DIR, f));
      documentsMap[docId].push({
        filename: f,
        page: pageNum,
        path: 'assets/workes/' + f,
        fullPath: path.join(WORKES_DIR, f),
        width: dim.width,
        height: dim.height,
        aspectRatio: Number((dim.width / dim.height).toFixed(3))
      });
    }
  });

  // Sort Images numerically
  individualImages.sort((a, b) => a.number - b.number);

  // Process Collections (Carousels)
  const collections = [];
  Object.keys(collectionsMap).map(Number).sort((a, b) => a - b).forEach(collId => {
    const slides = collectionsMap[collId].sort((a, b) => a.slide - b.slide);
    const cover = slides[0];
    const thumbFile = path.join(THUMB_DIR, cover.filename);
    const thumbDataUri = getBase64DataUri(fs.existsSync(thumbFile) ? thumbFile : cover.fullPath);

    collections.push({
      id: 'collection-' + collId,
      type: 'collection',
      collectionId: collId,
      label: 'COLLECTION ' + String(collId).padStart(2, '0'),
      title: 'Collection ' + String(collId).padStart(2, '0'),
      filename: 'Carousel ' + collId,
      thumbPath: fs.existsSync(thumbFile) ? 'assets/thumbnails/' + cover.filename : cover.path,
      fullPath: cover.path,
      thumbDataUri: thumbDataUri,
      slides: slides.map(s => s.path),
      slideCount: slides.length,
      width: cover.width,
      height: cover.height,
      aspectRatio: cover.aspectRatio
    });
  });

  // Process Documents (PDF Pages converted to Images)
  const pdfDocuments = [];
  Object.keys(documentsMap).map(Number).sort((a, b) => a - b).forEach(docId => {
    const pages = documentsMap[docId].sort((a, b) => a.page - b.page);
    const cover = pages[0]; // first page (page-00001)
    const thumbFile = path.join(PDF_THUMB_DIR, 'PDF ' + docId + '_thumb.jpg');
    const thumbDataUri = getBase64DataUri(fs.existsSync(thumbFile) ? thumbFile : cover.fullPath);

    pdfDocuments.push({
      id: 'document-' + docId,
      type: 'document',
      documentNumber: docId,
      label: 'DOCUMENT ' + String(docId).padStart(2, '0'),
      title: 'Document ' + String(docId).padStart(2, '0'),
      filename: 'PDF ' + docId,
      thumbPath: fs.existsSync(thumbFile) ? 'assets/pdf-thumbnails/PDF ' + docId + '_thumb.jpg' : cover.path,
      fullPath: cover.path,
      thumbDataUri: thumbDataUri,
      slides: pages.map(p => p.path), // slides array for unified image-based page viewer
      pages: pages.map(p => ({ page: p.page, path: p.path, filename: p.filename })),
      pageCount: pages.length,
      slideCount: pages.length,
      width: cover.width,
      height: cover.height,
      aspectRatio: cover.aspectRatio
    });
  });

  console.log(`Audited: ${individualImages.length} images, ${collections.length} collections, ${pdfDocuments.length} documents. Total = ${individualImages.length + collections.length + pdfDocuments.length}`);

  // Define 9 Structured Latitude Rings for exactly 222 items
  // 12 + 20 + 28 + 34 + 38 + 34 + 28 + 20 + 8 = 222 items
  const RING_CONFIG = [
    { ring: 0, phiDeg: 68, count: 12 },   // North Cap
    { ring: 1, phiDeg: 51, count: 20 },   // North Upper
    { ring: 2, phiDeg: 34, count: 28 },   // North Mid
    { ring: 3, phiDeg: 17, count: 34 },   // North Low
    { ring: 4, phiDeg:  0, count: 38 },   // Equator
    { ring: 5, phiDeg:-17, count: 34 },   // South Low
    { ring: 6, phiDeg:-34, count: 28 },   // South Mid
    { ring: 7, phiDeg:-51, count: 20 },   // South Upper
    { ring: 8, phiDeg:-68, count:  8 }    // South Cap
  ];

  // Interleave items evenly across rings
  const p37 = individualImages.find(p => p.number === 37);
  const otherImages = individualImages.filter(p => p.number !== 37);

  const pool = [];
  let pIdx = 0;
  let cIdx = 0;
  let dIdx = 0;

  while (pIdx < otherImages.length || cIdx < collections.length || dIdx < pdfDocuments.length) {
    if (dIdx < pdfDocuments.length && (pool.length % 24 === 0)) {
      pool.push(pdfDocuments[dIdx++]);
    } else if (cIdx < collections.length && (pool.length % 7 === 0)) {
      pool.push(collections[cIdx++]);
    } else if (pIdx < otherImages.length) {
      pool.push(otherImages[pIdx++]);
    } else if (cIdx < collections.length) {
      pool.push(collections[cIdx++]);
    } else if (dIdx < pdfDocuments.length) {
      pool.push(pdfDocuments[dIdx++]);
    }
  }

  // Populate each ring
  const allProjects = [];
  let globalCellIndex = 0;

  RING_CONFIG.forEach(ringDef => {
    const phiRad = (ringDef.phiDeg * Math.PI) / 180;
    const cosPhi = Math.cos(phiRad);
    const sinPhi = Math.sin(phiRad);

    for (let col = 0; col < ringDef.count; col++) {
      const thetaRad = (col / ringDef.count) * (Math.PI * 2);

      let chosenItem = null;
      if (ringDef.ring === 4 && col === 0 && p37) {
        chosenItem = p37; // Center front
      } else {
        chosenItem = pool.shift();
      }

      if (!chosenItem) {
        chosenItem = individualImages[0];
      }

      const x = cosPhi * Math.sin(thetaRad);
      const y = sinPhi;
      const z = cosPhi * Math.cos(thetaRad);

      allProjects.push({
        ...chosenItem,
        cellIndex: globalCellIndex++,
        ringIndex: ringDef.ring,
        colIndex: col,
        ringCount: ringDef.count,
        phiDeg: ringDef.phiDeg,
        thetaDeg: Number(((thetaRad * 180) / Math.PI).toFixed(2)),
        isOccupied: true,
        position: {
          x: Number(x.toFixed(5)),
          y: Number(y.toFixed(5)),
          z: Number(z.toFixed(5))
        }
      });
    }
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    config: {
      totalOccupied: allProjects.length,
      imagesCount: individualImages.length,
      collectionsCount: collections.length,
      documentsCount: pdfDocuments.length,
      rings: RING_CONFIG
    },
    projects: allProjects
  };

  // Write works-manifest.json
  const manifestPath = path.join(ROOT_DIR, 'works-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Saved works-manifest.json (' + (fs.statSync(manifestPath).size / 1024).toFixed(1) + ' KB)');

  // Write projects-data.js (includes dataUri for immediate reliable loading)
  const jsPath = path.join(ROOT_DIR, 'js', 'projects-data.js');
  const jsContent = '/* ASHAD — 3D CREATIVE UNIVERSE DATA MANIFEST (Auto-generated with Data URIs) */\n' +
    'window.ASHAD_WORKS_DATA = ' + JSON.stringify(manifest) + ';\n';
  fs.writeFileSync(jsPath, jsContent);
  console.log('Saved projects-data.js (' + (fs.statSync(jsPath).size / (1024 * 1024)).toFixed(2) + ' MB)');

  console.log('\n--- SCAN & STRUCTURED GRID COMPLETE ---');
  console.log('Total items placed on globe:', allProjects.length);
}

runScanner();
