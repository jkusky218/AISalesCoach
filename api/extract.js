import JSZip from 'jszip';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export const config = { api: { bodyParser: false } };

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function extractPptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  const texts = [];
  for (const file of slideFiles) {
    const xml = await zip.files[file].async('text');
    // Extract text nodes from XML
    const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
    const slideText = matches
      .map(m => m.replace(/<[^>]+>/g, '').trim())
      .filter(t => t.length > 0)
      .join(' ');
    if (slideText) texts.push(slideText);
  }
  return texts.join('\n\n');
}

async function extractPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = await readBody(req);

    // Parse multipart form manually using boundary
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return res.status(400).json({ error: 'Expected multipart form data' });

    const boundary = boundaryMatch[1];
    const boundaryBuffer = Buffer.from(`--${boundary}`);

    // Split by boundary
    let fileBuffer = null;
    let fileName = '';
    let fileType = '';

    const parts = splitBuffer(body, boundaryBuffer);
    for (const part of parts) {
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      const headers = part.slice(0, headerEnd).toString();
      const content = part.slice(headerEnd + 4);

      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const ctMatch = headers.match(/Content-Type:\s*(.+)/i);

      if (nameMatch?.[1] === 'file' && filenameMatch) {
        fileName = filenameMatch[1];
        fileType = ctMatch?.[1]?.trim() || '';
        // Remove trailing \r\n--
        fileBuffer = content.slice(0, content.lastIndexOf('\r\n'));
      }
    }

    if (!fileBuffer) return res.status(400).json({ error: 'No file found in request' });

    const ext = fileName.toLowerCase().split('.').pop();
    let text = '';

    if (ext === 'pdf' || fileType.includes('pdf')) {
      text = await extractPdf(fileBuffer);
    } else if (ext === 'pptx' || fileType.includes('presentationml')) {
      text = await extractPptx(fileBuffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF or PPTX.' });
    }

    // Trim to ~8000 chars to stay token-efficient
    const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
    return res.status(200).json({ text: trimmed, fileName, chars: trimmed.length });

  } catch (error) {
    console.error('Extract error:', error);
    return res.status(500).json({ error: 'Failed to extract file content' });
  }
}

function splitBuffer(buffer, delimiter) {
  const parts = [];
  let start = 0;
  let idx;
  while ((idx = buffer.indexOf(delimiter, start)) !== -1) {
    parts.push(buffer.slice(start, idx));
    start = idx + delimiter.length;
  }
  parts.push(buffer.slice(start));
  return parts.filter(p => p.length > 4);
}
