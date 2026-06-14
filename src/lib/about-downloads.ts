import { aboutSections } from "@/lib/about-content";

const encoder = new TextEncoder();
const documentTitle = "Overview";
const pdfFilename = "about.pdf";
const epubFilename = "about.epub";

export const aboutDownloadHeaders = {
  epub: {
    "Content-Disposition": `attachment; filename="${epubFilename}"`,
    "Content-Type": "application/epub+zip",
  },
  pdf: {
    "Content-Disposition": `attachment; filename="${pdfFilename}"`,
    "Content-Type": "application/pdf",
  },
};

type PdfLine = {
  fontSize: number;
  gapAfter?: number;
  indent?: number;
  text: string;
};

type PositionedPdfLine = PdfLine & {
  y: number;
};

const pdfCharacterReplacements: Record<string, string> = {
  "—": "-",
  "–": "-",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "…": "...",
};

const byteLength = (value: string) => encoder.encode(value).length;

const normalizePdfText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, (character) => {
    return pdfCharacterReplacements[character] ?? "";
  });

const escapePdfText = (value: string) =>
  normalizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const wrapText = (value: string, fontSize: number) => {
  const words = normalizePdfText(value).split(/\s+/).filter(Boolean);
  const maxCharacters = Math.max(34, Math.floor(500 / (fontSize * 0.48)));
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxCharacters) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

const getPdfLines = (): PdfLine[] => {
  const lines: PdfLine[] = [
    { text: documentTitle, fontSize: 22, gapAfter: 18 },
  ];

  aboutSections.forEach((section) => {
    lines.push({ text: section.heading, fontSize: 15, gapAfter: 7 });

    section.text.forEach((paragraph, paragraphIndex) => {
      wrapText(paragraph, 11.5).forEach((line) => {
        lines.push({ text: line, fontSize: 11.5, indent: 6 });
      });

      lines[lines.length - 1].gapAfter =
        paragraphIndex === section.text.length - 1 ? 15 : 7;
    });
  });

  return lines;
};

const paginatePdfLines = (lines: PdfLine[]) => {
  const pages: PositionedPdfLine[][] = [[]];
  const top = 760;
  const bottom = 54;
  let y = top;

  lines.forEach((line) => {
    const lineHeight = line.fontSize + 4;

    if (y - lineHeight < bottom) {
      pages.push([]);
      y = top;
    }

    pages[pages.length - 1].push({ ...line, y });
    y -= lineHeight + (line.gapAfter ?? 0);
  });

  return pages;
};

const createPdfObject = (content: string) =>
  `<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`;

export const buildAboutPdf = () => {
  const pages = paginatePdfLines(getPdfLines());
  const objects: string[] = [];
  const pageIds: number[] = [];

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = "";
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((page) => {
    const commands = page
      .map((line) => {
        const x = 54 + (line.indent ?? 0);

        return `BT\n/F1 ${line.fontSize} Tf\n1 0 0 1 ${x} ${line.y.toFixed(
          2,
        )} Tm\n(${escapePdfText(line.text)}) Tj\nET`;
      })
      .join("\n");

    const contentId = objects.length + 1;
    objects.push(createPdfObject(commands));

    const pageId = objects.length + 1;
    pageIds.push(pageId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
  });

  objects[1] = `<< /Type /Pages /Kids [${pageIds
    .map((pageId) => `${pageId} 0 R`)
    .join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = byteLength(pdf);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return encoder.encode(pdf);
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getChapterXhtml = () => `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
  <head>
    <title>${escapeXml(documentTitle)}</title>
    <style>
      body { font-family: serif; line-height: 1.45; margin: 8%; color: #171717; }
      h1, h2 { font-family: sans-serif; line-height: 1.1; }
      h1 { font-size: 1.8em; }
      h2 { font-size: 1.25em; margin-top: 1.6em; }
      p { margin: 0.55em 0; }
    </style>
  </head>
  <body>
    <h1>${escapeXml(documentTitle)}</h1>
    ${aboutSections
      .map(
        (section) => `<section id="${section.id}">
      <h2>${escapeXml(section.heading)}</h2>
      ${section.text.map((paragraph) => `<p>${escapeXml(paragraph)}</p>`).join("\n      ")}
    </section>`,
      )
      .join("\n    ")}
  </body>
</html>
`;

const getNavXhtml = () => `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
  <head>
    <title>${escapeXml(documentTitle)}</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>${escapeXml(documentTitle)}</h1>
      <ol>
        ${aboutSections
          .map(
            (section) =>
              `<li><a href="chapter.xhtml#${section.id}">${escapeXml(section.menuTitle)}</a></li>`,
          )
          .join("\n        ")}
      </ol>
    </nav>
  </body>
</html>
`;

const getContainerXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

const getContentOpf = () => `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:4a0c6513-3298-4b15-8742-9bd74a5f39a7</dc:identifier>
    <dc:title>${escapeXml(documentTitle)}</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">2026-06-14T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="chapter"/>
  </spine>
</package>
`;

type ZipSource = {
  data: Uint8Array;
  name: string;
};

type CentralDirectoryRecord = {
  crc: number;
  dataLength: number;
  localHeaderOffset: number;
  nameBytes: Uint8Array;
};

let crcTable: number[] | null = null;

const getCrcTable = () => {
  if (crcTable) return crcTable;

  crcTable = Array.from({ length: 256 }, (_, index) => {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    return value >>> 0;
  });

  return crcTable;
};

const getCrc32 = (data: Uint8Array) => {
  const table = getCrcTable();
  let crc = 0xffffffff;

  data.forEach((byte) => {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
};

const createLocalHeader = (
  nameBytes: Uint8Array,
  dataLength: number,
  crc: number,
) => {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0x21, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, dataLength, true);
  view.setUint32(22, dataLength, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);

  return header;
};

const createCentralDirectoryHeader = (record: CentralDirectoryRecord) => {
  const header = new Uint8Array(46 + record.nameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0x21, true);
  view.setUint32(16, record.crc, true);
  view.setUint32(20, record.dataLength, true);
  view.setUint32(24, record.dataLength, true);
  view.setUint16(28, record.nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, record.localHeaderOffset, true);
  header.set(record.nameBytes, 46);

  return header;
};

const createEndOfCentralDirectory = (
  entryCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number,
) => {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return header;
};

const concatBytes = (chunks: Uint8Array[]) => {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
};

const createZip = (sources: ZipSource[]) => {
  const chunks: Uint8Array[] = [];
  const centralDirectoryRecords: CentralDirectoryRecord[] = [];
  let offset = 0;

  sources.forEach((source) => {
    const nameBytes = encoder.encode(source.name);
    const crc = getCrc32(source.data);
    const localHeader = createLocalHeader(nameBytes, source.data.length, crc);

    chunks.push(localHeader, source.data);
    centralDirectoryRecords.push({
      crc,
      dataLength: source.data.length,
      localHeaderOffset: offset,
      nameBytes,
    });
    offset += localHeader.length + source.data.length;
  });

  const centralDirectoryOffset = offset;
  const centralDirectoryChunks = centralDirectoryRecords.map((record) =>
    createCentralDirectoryHeader(record),
  );
  const centralDirectorySize = centralDirectoryChunks.reduce(
    (total, chunk) => total + chunk.length,
    0,
  );

  chunks.push(
    ...centralDirectoryChunks,
    createEndOfCentralDirectory(
      centralDirectoryRecords.length,
      centralDirectorySize,
      centralDirectoryOffset,
    ),
  );

  return concatBytes(chunks);
};

export const buildAboutEpub = () =>
  createZip([
    { name: "mimetype", data: encoder.encode("application/epub+zip") },
    { name: "META-INF/container.xml", data: encoder.encode(getContainerXml()) },
    { name: "OEBPS/content.opf", data: encoder.encode(getContentOpf()) },
    { name: "OEBPS/nav.xhtml", data: encoder.encode(getNavXhtml()) },
    { name: "OEBPS/chapter.xhtml", data: encoder.encode(getChapterXhtml()) },
  ]);
