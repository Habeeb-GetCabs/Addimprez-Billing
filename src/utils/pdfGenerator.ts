import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import html2canvas from 'html2canvas';
import { BillDocument, BusinessSettings } from '../types';
import { formatLetterpadDate, formatIndianNumber } from '../components/LetterpadBillView';
import { getShareableBillUrl } from './shareableLink';
import { ADDIMPREZ_LOGO_BASE64 } from '../assets/brandingData';

/**
 * Generates an A4 Letterpad PDF matching Pixel Graphic branding and design reference.
 * - Locked Pixel Graphic branding
 * - Diagonal cross-over "PIXEL GRAPHIC" watermark embedded across document
 * - Product showcase image support
 * - Package pricing support
 * - Conditional GST fields
 * - 3-line service catalog footer
 * - Flattened & protected document structure
 */
export function generateBillPdf(doc: BillDocument, settings: BusinessSettings): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Protected PDF metadata
  pdf.setProperties({
    title: `${doc.documentType === 'INVOICE' ? 'Tax Invoice' : 'Quotation'} - ${doc.documentNumber}`,
    subject: 'Pixel Graphic Document',
    author: 'Pixel Graphic',
    keywords: 'Pixel Graphic, Quotation, Bill, Protected Document',
    creator: 'Pixel Graphic Secure System',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 2;

  // Colors
  const cyanColor: [number, number, number] = [0, 162, 232];
  const darkBrandColor: [number, number, number] = [45, 40, 37];
  const headerPillColor: [number, number, number] = [52, 46, 43];
  const borderColor: [number, number, number] = [203, 213, 225];

  // Locked addimprez Brand Details
  const brandName = 'addimprez';
  const tagline = 'create the dreams...';
  const phoneNumbers = '95 6666 4663, 95 6632 9666';
  const emailAddress = 'addimprez.cbe@gmail.com';
  const addressLine1 = '286, D.B Road, R.S Puram,';
  const addressLine2 = 'Coimbatore - 641 002.';

  // ===================== 0. DIAGONAL WATERMARK =====================
  // Official addimprez watermark embedded across the PDF
  pdf.saveGraphicsState();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(46);
  pdf.setTextColor(236, 240, 246); // subtle, light watermark behind main content
  pdf.text('ADDIMPREZ', pageWidth / 2, pageHeight / 2 + 5, {
    align: 'center',
    angle: 32,
  });
  pdf.restoreGraphicsState();

  // ===================== 1. TOP HEADER =====================
  // --- Left: Contact Details with Cyan Highlights ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);

  // Phone row
  pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.text('M:', margin, y + 2.5);
  pdf.setTextColor(40, 40, 40);
  pdf.text(phoneNumbers, margin + 5, y + 2.5);

  // Email row
  pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.text('E:', margin, y + 7.5);
  pdf.setTextColor(40, 40, 40);
  pdf.text(emailAddress, margin + 5, y + 7.5);

  // Address row
  pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.text('A:', margin, y + 12.5);
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.text(addressLine1, margin + 5, y + 12.5);
  pdf.text(addressLine2, margin + 5, y + 16.5);
  // Decorative bracket
  pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.setFontSize(14);
  pdf.text('}', margin + 45, y + 15);

  // --- Right: Official addimprez Logo & Mosaic Pebble Emblem ---
  const rightEdge = pageWidth - margin;
  const logoWidth = 58;
  const logoHeight = 15.4;
  const logoX = rightEdge - logoWidth;
  const logoY = y;

  try {
    pdf.addImage(ADDIMPREZ_LOGO_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.warn('Fallback drawing addimprez in PDF', err);
    pdf.setTextColor(darkBrandColor[0], darkBrandColor[1], darkBrandColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(brandName, rightEdge, y + 6.5, { align: 'right' });
    pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(tagline, rightEdge, y + 12.5, { align: 'right' });
  }

  y += 19;

  // ===================== 2. TOP HORIZONTAL CYAN/BLUE LINE =====================
  pdf.setFillColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.roundedRect(margin, y, contentWidth, 1.0, 0.5, 0.5, 'F');

  y += 4.5;

  // ===================== 3. CUSTOMER & DATE BAR =====================
  const customerName = (doc.customerName || 'THE MAPLE WAFFLE - BANGALORE').toUpperCase();
  const dateFormatted = formatLetterpadDate(doc.date) || '23.06.2026';

  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(customerName, margin, y + 4);

  pdf.setFontSize(10.5);
  pdf.text(dateFormatted, rightEdge, y + 4, { align: 'right' });

  y += 8;

  // ===================== 4. TABLE SECTION =====================
  const hasGst = doc.gstEnabled;
  const colGap = 1.6;

  // Table column widths
  // If GST is enabled: [S.No (10), Description (66), HSN (16), Sqft (20), Qty (14), Price (18), Amount (30)]
  // If Non-GST (matching reference): [S.No (12), Description (74), Sqft (23), Qty (14), Price (20), Amount (31)]
  const cW = hasGst ? [10, 68, 16, 20, 14, 18, 28] : [12, 74, 23, 14, 20, 31];
  const colX: number[] = [];
  let currentX = margin;
  for (let i = 0; i < cW.length; i++) {
    colX.push(currentX);
    currentX += cW[i] + colGap;
  }

  // Draw Header Pills
  const headerHeight = 7.2;
  pdf.setFillColor(headerPillColor[0], headerPillColor[1], headerPillColor[2]);
  for (let i = 0; i < cW.length; i++) {
    pdf.roundedRect(colX[i], y, cW[i], headerHeight, 1.8, 1.8, 'F');
  }

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);

  if (hasGst) {
    pdf.text('S.No', colX[0] + cW[0] / 2, y + 4.7, { align: 'center' });
    pdf.text('DESCRIPTION', colX[1] + cW[1] / 2, y + 4.7, { align: 'center' });
    pdf.text('HSN', colX[2] + cW[2] / 2, y + 4.7, { align: 'center' });
    pdf.text('Total Sqft', colX[3] + cW[3] / 2, y + 4.7, { align: 'center' });
    pdf.text('Qty', colX[4] + cW[4] / 2, y + 4.7, { align: 'center' });
    pdf.text('Price', colX[5] + cW[5] / 2, y + 4.7, { align: 'center' });
    pdf.text('Amount', colX[6] + cW[6] / 2, y + 4.7, { align: 'center' });
  } else {
    pdf.text('S.No', colX[0] + cW[0] / 2, y + 4.7, { align: 'center' });
    pdf.text('DESCRIPTION', colX[1] + cW[1] / 2, y + 4.7, { align: 'center' });
    pdf.text('Total Sqft', colX[2] + cW[2] / 2, y + 4.7, { align: 'center' });
    pdf.text('Qty', colX[3] + cW[3] / 2, y + 4.7, { align: 'center' });
    pdf.text('Price', colX[4] + cW[4] / 2, y + 4.7, { align: 'center' });
    pdf.text('Amount', colX[5] + cW[5] / 2, y + 4.7, { align: 'center' });
  }

  y += headerHeight + 1.8;

  // Draw Table Rows (Rounded Rectangles per Cell)
  const rowHeight = 7.0;
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.setFontSize(7.5);

  const drawTableRow = (
    sno: string,
    desc: string,
    hsn: string,
    sqft: string,
    qty: string,
    price: string,
    amount: string
  ) => {
    // Check page break
    if (y + rowHeight > pageHeight - 50) {
      pdf.addPage();
      y = margin;
    }

    // Draw cell boxes
    pdf.setFillColor(255, 255, 255);
    for (let i = 0; i < cW.length; i++) {
      pdf.roundedRect(colX[i], y, cW[i], rowHeight, 1.5, 1.5, 'FD');
    }

    if (hasGst) {
      // S.No
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(sno, colX[0] + cW[0] / 2, y + 4.6, { align: 'center' });

      // DESCRIPTION
      pdf.setFont('helvetica', 'bold');
      const truncatedDesc = desc.length > 34 ? desc.substring(0, 32) + '..' : desc;
      pdf.text(truncatedDesc, colX[1] + 2.5, y + 4.6);

      // HSN
      pdf.setFont('helvetica', 'normal');
      pdf.text(hsn, colX[2] + cW[2] / 2, y + 4.6, { align: 'center' });

      // Sqft
      pdf.text(sqft, colX[3] + cW[3] / 2, y + 4.6, { align: 'center' });

      // Qty
      pdf.text(qty, colX[4] + cW[4] / 2, y + 4.6, { align: 'center' });

      // Price
      pdf.text(price, colX[5] + cW[5] / 2, y + 4.6, { align: 'center' });

      // Amount
      pdf.setFont('helvetica', 'bold');
      pdf.text(amount, colX[6] + cW[6] / 2, y + 4.6, { align: 'center' });
    } else {
      // S.No
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(sno, colX[0] + cW[0] / 2, y + 4.6, { align: 'center' });

      // DESCRIPTION
      pdf.setFont('helvetica', 'bold');
      const truncatedDesc = desc.length > 40 ? desc.substring(0, 38) + '..' : desc;
      pdf.text(truncatedDesc, colX[1] + 3, y + 4.6);

      // Sqft
      pdf.setFont('helvetica', 'normal');
      pdf.text(sqft, colX[2] + cW[2] / 2, y + 4.6, { align: 'center' });

      // Qty
      pdf.text(qty, colX[3] + cW[3] / 2, y + 4.6, { align: 'center' });

      // Price
      pdf.text(price, colX[4] + cW[4] / 2, y + 4.6, { align: 'center' });

      // Amount
      pdf.setFont('helvetica', 'bold');
      pdf.text(amount, colX[5] + cW[5] / 2, y + 4.6, { align: 'center' });
    }

    y += rowHeight + 1.6;
  };

  // Render Items
  doc.items.forEach((item, idx) => {
    let desc = item.productName;
    if (item.calculationType === 'AREA' && item.width && item.height) {
      desc = `${item.width} x ${item.height} - Feet - ${item.productName}`;
    } else if (item.calculationType === 'PACKAGE') {
      const packageUnits = item.packageSize ? ` (1 pkg = ${formatIndianNumber(item.packageSize)} ${item.packageUnit || 'flyers'})` : '';
      desc = `${item.productName}${packageUnits}`;
    }

    const sqft = item.calculationType === 'AREA' && item.area > 0 ? `${Math.round(item.area)}` : '-';
    let qty = `${item.quantity || 1}`;
    if (item.calculationType === 'PACKAGE') {
      qty = item.quantity === 1 ? '1 Pkg' : `${item.quantity} Pkgs`;
    } else if (item.calculationType === 'AREA') {
      qty = '-';
    }

    const price = formatIndianNumber(item.rate);
    const amount = formatIndianNumber(item.amount);
    const hsn = item.hsnCode || '998314';

    drawTableRow(`${idx + 1}`, desc, hsn, sqft, qty, price, amount);
  });

  // Render Additional Charges (e.g. Transport & Installation)
  if (doc.additionalCharges) {
    doc.additionalCharges.forEach((chg, cIdx) => {
      const sno = `${doc.items.length + cIdx + 1}`;
      const desc = chg.label;
      const amount = formatIndianNumber(chg.amount);
      drawTableRow(sno, desc, '-', '-', '-', '-', amount);
    });
  }

  y += 2;

  // ===================== 5. TOTAL ROW & GST =====================
  const totalBoxWidth = 36;
  const totalBoxHeight = 8.5;
  const totalBoxX = rightEdge - totalBoxWidth;

  if (hasGst) {
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const taxSubtotal = doc.subtotal + (doc.additionalChargesTotal || 0) - (doc.discountAmount || 0);
    pdf.text(`Taxable: Rs. ${formatIndianNumber(taxSubtotal)} | GST (${doc.gstPercentage || 18}%): Rs. ${formatIndianNumber(doc.gstAmount || 0)}`, rightEdge, y + 2, { align: 'right' });
    y += 5;
  }

  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Total', totalBoxX - 4, y + 5.8, { align: 'right' });

  // Rounded Box for Total
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.roundedRect(totalBoxX, y, totalBoxWidth, totalBoxHeight, 2, 2, 'FD');

  pdf.setFontSize(11);
  pdf.setTextColor(20, 20, 20);
  pdf.text(`${formatIndianNumber(doc.grandTotal)}/-`, totalBoxX + totalBoxWidth / 2, y + 5.8, {
    align: 'center',
  });

  y += totalBoxHeight + 4;

  // ===================== 5.5 PRODUCT SHOWCASE IMAGE (IF PRESENT) =====================
  if (doc.showcaseImage && doc.showcaseImage.startsWith('data:image')) {
    try {
      const imgWidth = 70;
      const imgHeight = 35;
      const imgX = margin;
      if (y + imgHeight > pageHeight - 40) {
        pdf.addPage();
        y = margin;
      }
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('DESIGN / PRODUCT SHOWCASE:', imgX, y + 3);
      pdf.addImage(doc.showcaseImage, 'JPEG', imgX, y + 4, imgWidth, imgHeight);
      y += imgHeight + 7;
    } catch (e) {
      console.warn('Could not add showcase image to PDF', e);
    }
  }

  // ===================== 6. TERMS & CONDITION =====================
  pdf.setTextColor(220, 38, 38); // Bold red
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text('Terms & Condition*', margin, y);

  y += 4.5;
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);

  const defaultTerms = [
    '* Scaffolding Customer Risk',
    '* Vehicle Rent Customer Risk',
    '* Designing Charge Separate.',
    '* Installation Charge Separate.',
    '* 80% Advance Before Work Starts.',
    '* Amount May Be Varied For Some Critical Works.',
    '* MS Work Price Per Kg Cannot Be Mention Until We Finish The Work'
  ];

  const terms =
    doc.termsAndConditions && doc.termsAndConditions.length > 0
      ? doc.termsAndConditions
      : defaultTerms;

  terms.slice(0, 7).forEach(term => {
    const cleanTerm = term.replace(/^\*\s*/, '');
    pdf.text(`* ${cleanTerm}`, margin + 1, y);
    y += 3.6;
  });

  // Pin footer to bottom of page (Letter Pad Style)
  const bottomFooterY = pageHeight - 20;
  if (y < bottomFooterY - 7) {
    y = bottomFooterY - 7;
  }

  // ===================== 7. BOTTOM BLUE LINE =====================
  pdf.setFillColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.roundedRect(margin, y, contentWidth, 1.0, 0.5, 0.5, 'F');

  y += 4.2;

  // ===================== 8. 3-LINE SERVICE CATALOG FOOTER =====================
  // Exact 3-line service catalog from uploaded reference IMG-20260920-WA0191.jpg
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.2);
  pdf.setTextColor(40, 40, 40);
  pdf.text(
    'Graphic Design   |   Logo   |   LED Signs   |   ACP Elevation   |   Flex Board',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 3.4;
  pdf.text(
    'Advertisement   |   Vinyl Sticker   |   Standee   |   Brochures   |   Visiting Card',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 3.4;
  pdf.text(
    'Printing   |   Painting   |   Pre-Ink Stamps   |   Bill Book   |   Letter Head   |   ID card',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  return pdf;
}

/**
 * Downloads or saves the generated PDF to user device.
 */
export async function downloadBillPdf(
  doc: BillDocument, 
  settings: BusinessSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const pdf = generateBillPdf(doc, settings);
    const cleanNum = doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${cleanNum}_${doc.documentType.toLowerCase()}.pdf`;

    if (Capacitor.isNativePlatform()) {
      const base64Data = pdf.output('datauristring').split(',')[1];
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: fileName,
        text: `${doc.documentNumber} - ${doc.customerName || 'Pixel Graphic Bill'}`,
        url: result.uri,
        dialogTitle: 'Save PDF to Device or Drive',
      });
      return { success: true, message: 'PDF generated successfully' };
    }

    // Web browser standard download
    pdf.save(fileName);
    return { success: true, message: 'PDF downloaded' };
  } catch (err: any) {
    console.error('Error in downloadBillPdf:', err);
    try {
      const pdf = generateBillPdf(doc, settings);
      const cleanNum = doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `${cleanNum}_${doc.documentType.toLowerCase()}.pdf`;
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
      return { success: true, message: 'PDF downloaded' };
    } catch (fallbackErr) {
      console.error('Fallback download failed:', fallbackErr);
      return { success: false, message: 'Could not save PDF' };
    }
  }
}

/**
 * Exports the letterpad quotation or bill as a high-resolution PNG / JPG image
 * using html2canvas, maintaining exact layout, watermark, and branding.
 */
export async function downloadBillAsImage(
  doc: BillDocument,
  elementId: string = 'letterpad-bill-container'
): Promise<{ success: boolean; message: string }> {
  try {
    const el = document.getElementById(elementId);
    if (!el) {
      return { success: false, message: 'Document preview element not found' };
    }

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const cleanNum = doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${cleanNum}_${doc.documentType.toLowerCase()}.png`;

    if (Capacitor.isNativePlatform()) {
      const base64Data = canvas.toDataURL('image/png').split(',')[1];
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: fileName,
        text: `${doc.documentNumber} - ${doc.customerName || 'Pixel Graphic'}`,
        url: result.uri,
        dialogTitle: 'Save / Share Quotation Image',
      });
      return { success: true, message: 'Image exported successfully' };
    }

    // Web download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
    return { success: true, message: 'Image downloaded' };
  } catch (err: any) {
    console.error('Failed to export bill as image', err);
    return { success: false, message: 'Failed to generate image' };
  }
}

export function getPdfBlobUrl(doc: BillDocument, settings: BusinessSettings): string {
  const pdf = generateBillPdf(doc, settings);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

export function openPdfInNewTab(doc: BillDocument, settings: BusinessSettings): void {
  const pdf = generateBillPdf(doc, settings);
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function getPdfDataUrl(doc: BillDocument, settings: BusinessSettings): string {
  const pdf = generateBillPdf(doc, settings);
  return pdf.output('datauristring');
}

export async function printBillPdf(
  doc: BillDocument, 
  settings: BusinessSettings
): Promise<{ success: boolean; message: string }> {
  try {
    if (Capacitor.isNativePlatform()) {
      const pdf = generateBillPdf(doc, settings);
      const cleanNum = doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `${cleanNum}_${doc.documentType.toLowerCase()}.pdf`;
      const base64Data = pdf.output('datauristring').split(',')[1];

      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: `Print ${doc.documentNumber}`,
        text: `Print document ${doc.documentNumber}`,
        url: result.uri,
        dialogTitle: 'Select System Printer or PDF Viewer to Print',
      });
      return { success: true, message: 'Print sheet opened' };
    }

    // Web browser: window.print() prints the clean HTML letterpad!
    if (typeof window !== 'undefined') {
      window.print();
      return { success: true, message: 'Print dialog opened' };
    }

    return { success: false, message: 'Print not supported' };
  } catch (err: any) {
    console.error('Error in printBillPdf:', err);
    if (typeof window !== 'undefined') {
      window.print();
    }
    return { success: false, message: 'Could not trigger print' };
  }
}

export async function shareBillPdfFile(
  doc: BillDocument, 
  settings: BusinessSettings
): Promise<boolean> {
  try {
    const pdf = generateBillPdf(doc, settings);
    const cleanNum = doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${cleanNum}_${doc.documentType.toLowerCase()}.pdf`;
    const isInvoice = doc.documentType === 'INVOICE';
    const msgSummary = `${isInvoice ? 'Invoice' : 'Quotation'} ${doc.documentNumber} from Pixel Graphic for Rs. ${formatIndianNumber(doc.grandTotal)}/-`;

    if (Capacitor.isNativePlatform()) {
      const base64Data = pdf.output('datauristring').split(',')[1];
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: fileName,
        text: msgSummary,
        url: writeResult.uri,
        dialogTitle: 'Share PDF Document',
      });
      return true;
    }

    // Web navigator share if supported
    if (navigator.share) {
      const blob = pdf.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: fileName,
          text: msgSummary,
          files: [file],
        });
        return true;
      }
    }

    // Fallback: download PDF
    await downloadBillPdf(doc, settings);
    return true;
  } catch (err) {
    console.error('Error sharing PDF file:', err);
    return false;
  }
}

export function buildWhatsAppMessage(doc: BillDocument, settings: BusinessSettings): string {
  const isInvoice = doc.documentType === 'INVOICE';
  const shareableLink = getShareableBillUrl(doc);

  const lines = [
    `*${isInvoice ? 'TAX INVOICE' : 'QUOTATION'} - ADDIMPREZ*`,
    `No: ${doc.documentNumber}`,
    `Date: ${formatLetterpadDate(doc.date)}`,
    `Customer: ${doc.customerName || 'Valued Client'}`,
    `--------------------------------`,
    `*Total Amount: Rs. ${formatIndianNumber(doc.grandTotal)}/-*`,
    isInvoice 
      ? (doc.balanceDue <= 0 ? `Payment Status: PAID` : `Balance Due: Rs. ${formatIndianNumber(doc.balanceDue)}/-`)
      : `Advance Required: 80% Before Work Starts`,
    `--------------------------------`,
    `View & Download Document:`,
    shareableLink,
    `--------------------------------`,
    `*addimprez* - create the dreams...`,
    `286, D.B Road, R.S Puram, Coimbatore - 641 002`,
    `Phone: 95 6666 4663, 95 6632 9666`,
    `Email: addimprez.cbe@gmail.com`
  ];

  return lines.join('\n');
}

export function shareViaWhatsAppDirect(
  doc: BillDocument, 
  settings: BusinessSettings,
  recipientMobile: string
): void {
  const cleanMobile = recipientMobile.replace(/\D/g, '');
  const msg = buildWhatsAppMessage(doc, settings);
  const waUrl = `https://wa.me/91${cleanMobile.slice(-10)}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

export function shareViaWhatsAppContactPicker(
  doc: BillDocument, 
  settings: BusinessSettings
): void {
  const msg = buildWhatsAppMessage(doc, settings);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

export function shareViaWhatsApp(
  doc: BillDocument, 
  settings: BusinessSettings,
  recipientMobile?: string
): void {
  if (recipientMobile) {
    shareViaWhatsAppDirect(doc, settings, recipientMobile);
  } else {
    shareViaWhatsAppContactPicker(doc, settings);
  }
}

