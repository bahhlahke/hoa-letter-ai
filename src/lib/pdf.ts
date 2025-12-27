import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateHoaPdf(
  letter: string,
  letterhead?: string,
  logoBytes?: Uint8Array
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  let y = 760;

  if (logoBytes) {
    const logo = await pdf.embedPng(logoBytes);
    page.drawImage(logo, { x: 50, y: y - 40, width: 120, height: 40 });
  }

  if (letterhead) {
    page.drawText(letterhead, {
      x: 200,
      y: y - 20,
      size: 11,
      font,
      color: rgb(0, 0, 0)
    });
  }

  y -= 70;
  letter.split("\n").forEach((line) => {
    page.drawText(line, { x: 50, y, size: 11, font });
    y -= 14;
  });

  const bytes = await pdf.save();
  const buffer = bytes.buffer.slice(0) as ArrayBuffer;
  return new Blob([buffer], { type: "application/pdf" });
}
