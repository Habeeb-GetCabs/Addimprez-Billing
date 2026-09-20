import { jsPDF } from 'jspdf';
import { BillDocument, BusinessSettings } from '../types';
import { formatLetterpadDate, formatIndianNumber } from '../components/LetterpadBillView';
import { getShareableBillUrl } from './shareableLink';

/**
 * Generates an A4 Letterpad PDF exactly matching the Pixel Graphic design template.
 */
export function generateBillPdf(doc: BillDocument, settings: BusinessSettings): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
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

  const brandName = settings.businessName || 'Pixel Graphic';
  const tagline = settings.tagline || 'create the dreams...';
  const phoneNumbers = settings.phone || '95 6666 4663, 95 6632 9666';
  const emailAddress = settings.email || 'pixelgraphic.cbe@gmail.com';
  const addressLine1 = '286, D.B Road, R.S Puram,';
  const addressLine2 = 'Coimbatore - 641 002.';
  const websiteUrl = 'www.pixelgraphic.in';

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
  pdf.setFont('helvetica', 'normal');
  pdf.text(addressLine1, margin + 5, y + 12.5);
  pdf.text(addressLine2, margin + 5, y + 16.5);
  // Decorative bracket
  pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.setFontSize(14);
  pdf.text('}', margin + 45, y + 15);

  // --- Right: Pixel Graphic Brand & 4-Square Logo Mark ---
  const rightEdge = pageWidth - margin;
  pdf.setTextColor(darkBrandColor[0], darkBrandColor[1], darkBrandColor[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(19);

  // Draw Brand Name
  const brandText = brandName;
  const brandWidth = pdf.getTextWidth(brandText);
  const logoBoxSize = 2.4;
  const logoGap = 0.8;
  const totalLogoWidth = logoBoxSize * 2 + logoGap;
  const brandStartX = rightEdge - (brandWidth + totalLogoWidth + 2.5);

  pdf.text(brandText, brandStartX, y + 6);

  // 4 Squares Pixel Logo
  const logoStartX = brandStartX + brandWidth + 2.5;
  const logoStartY = y + 0.8;

  // Top-left (dark)
  pdf.setFillColor(darkBrandColor[0], darkBrandColor[1], darkBrandColor[2]);
  pdf.roundedRect(logoStartX, logoStartY, logoBoxSize, logoBoxSize, 0.4, 0.4, 'F');

  // Top-right (dark)
  pdf.roundedRect(logoStartX + logoBoxSize + logoGap, logoStartY, logoBoxSize, logoBoxSize, 0.4, 0.4, 'F');

  // Bottom-left (cyan)
  pdf.setFillColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.roundedRect(logoStartX, logoStartY + logoBoxSize + logoGap, logoBoxSize, logoBoxSize, 0.4, 0.4, 'F');

  // Bottom-right (cyan)
  pdf.roundedRect(logoStartX + logoBoxSize + logoGap, logoStartY + logoBoxSize + logoGap, logoBoxSize, logoBoxSize, 0.4, 0.4, 'F');

  // Tagline below brand
  pdf.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.setFont('times', 'italic');
  pdf.setFontSize(10);
  pdf.text(tagline, rightEdge, y + 13, { align: 'right' });

  y += 20;

  // ===================== 2. TOP HORIZONTAL CYAN/BLUE LINE =====================
  pdf.setFillColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.roundedRect(margin, y, contentWidth, 1.0, 0.5, 0.5, 'F');

  y += 4.5;

  // ===================== 3. CUSTOMER & DATE BAR =====================
  const customerName = (doc.customerName || 'V SMILE DENTAL STUDIO').toUpperCase();
  const dateFormatted = formatLetterpadDate(doc.date) || '23.06.26';

  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12.5);
  pdf.text(customerName, margin, y + 4);

  pdf.setFontSize(11);
  pdf.text(dateFormatted, rightEdge, y + 4, { align: 'right' });

  y += 8;

  // ===================== 4. TABLE SECTION =====================
  // Column Dimensions (Total content width = 182mm)
  const colGap = 1.6;
  const colWidths = [12, 77, 24, 15, 20, 29]; // sum = 177 + 5*1.6 = 185
  // Adjust slightly to fit contentWidth: 182 - (5*1.6) = 174 -> [12, 74, 23, 14, 20, 31]
  const cW = [12, 74, 23, 14, 20, 31];
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

  pdf.text('S.No', colX[0] + cW[0] / 2, y + 4.7, { align: 'center' });
  pdf.text('DESCRIPTION', colX[1] + cW[1] / 2, y + 4.7, { align: 'center' });
  pdf.text('Total Sqft', colX[2] + cW[2] / 2, y + 4.7, { align: 'center' });
  pdf.text('Qty', colX[3] + cW[3] / 2, y + 4.7, { align: 'center' });
  pdf.text('Price', colX[4] + cW[4] / 2, y + 4.7, { align: 'center' });
  pdf.text('Amount', colX[5] + cW[5] / 2, y + 4.7, { align: 'center' });

  y += headerHeight + 1.8;

  // Draw Table Rows (Rounded Rectangles per Cell)
  const rowHeight = 7.0;
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.setFontSize(7.5);

  const drawTableRow = (
    sno: string,
    desc: string,
    sqft: string,
    qty: string,
    price: string,
    amount: string
  ) => {
    // Check page break
    if (y + rowHeight > pageHeight - 45) {
      pdf.addPage();
      y = margin;
    }

    // Draw cell boxes
    pdf.setFillColor(255, 255, 255);
    for (let i = 0; i < cW.length; i++) {
      pdf.roundedRect(colX[i], y, cW[i], rowHeight, 1.5, 1.5, 'FD');
    }

    // Col 1: S.No
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(sno, colX[0] + cW[0] / 2, y + 4.6, { align: 'center' });

    // Col 2: DESCRIPTION
    pdf.setFont('helvetica', 'bold');
    const truncatedDesc = desc.length > 40 ? desc.substring(0, 38) + '..' : desc;
    pdf.text(truncatedDesc, colX[1] + 3, y + 4.6);

    // Col 3: Sqft
    pdf.setFont('helvetica', 'normal');
    pdf.text(sqft, colX[2] + cW[2] / 2, y + 4.6, { align: 'center' });

    // Col 4: Qty
    pdf.text(qty, colX[3] + cW[3] / 2, y + 4.6, { align: 'center' });

    // Col 5: Price
    pdf.text(price, colX[4] + cW[4] / 2, y + 4.6, { align: 'center' });

    // Col 6: Amount
    pdf.setFont('helvetica', 'bold');
    pdf.text(amount, colX[5] + cW[5] / 2, y + 4.6, { align: 'center' });

    y += rowHeight + 1.6;
  };

  // Render Items
  doc.items.forEach((item, idx) => {
    let desc = item.productName;
    if (item.calculationType === 'AREA' && item.width && item.height) {
      desc = `${item.width} x ${item.height} - Feet - ${item.productName}`;
    }

    const sqft = item.calculationType === 'AREA' && item.area > 0 ? `${Math.round(item.area)}` : '-';
    const qty = `${item.quantity || 1}`;
    const price = formatIndianNumber(item.rate);
    const amount = formatIndianNumber(item.amount);

    drawTableRow(`${idx + 1}`, desc, sqft, qty, price, amount);
  });

  // Render Additional Charges (e.g. Transport & Installation)
  if (doc.additionalCharges) {
    doc.additionalCharges.forEach((chg, cIdx) => {
      const sno = `${doc.items.length + cIdx + 1}`;
      const desc = chg.label;
      const amount = formatIndianNumber(chg.amount);
      drawTableRow(sno, desc, '-', '-', '-', amount);
    });
  }

  y += 2;

  // ===================== 5. TOTAL ROW =====================
  const totalBoxWidth = 36;
  const totalBoxHeight = 8.5;
  const totalBoxX = rightEdge - totalBoxWidth;

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

  y += totalBoxHeight + 5;

  // ===================== 6. TERMS & CONDITION =====================
  pdf.setTextColor(220, 38, 38); // Bold red/coral
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text('Terms & Condition*', margin, y);

  y += 4.5;
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);

  const terms =
    doc.termsAndConditions && doc.termsAndConditions.length > 0
      ? doc.termsAndConditions
      : ['70% Advance Before Work Starts.', 'Designing Charge Separate.'];

  terms.slice(0, 3).forEach(term => {
    const cleanTerm = term.replace(/^\*\s*/, '');
    pdf.text(`* ${cleanTerm}`, margin + 1, y);
    y += 3.8;
  });

  // Pin footer to bottom of page (Letter Pad Style)
  const bottomFooterY = pageHeight - 22;
  if (y < bottomFooterY - 6) {
    y = bottomFooterY - 6;
  }

  // ===================== 7. BOTTOM BLUE LINE =====================
  pdf.setFillColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  pdf.roundedRect(margin, y, contentWidth, 1.0, 0.5, 0.5, 'F');

  y += 4;

  // ===================== 8. LETTER PAD FOOTER =====================
  pdf.setTextColor(25, 25, 25);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(brandName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 3.8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(70, 70, 70);
  pdf.text(addressLine1 + ' ' + addressLine2, pageWidth / 2, y, { align: 'center' });

  y += 3.6;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  const footerContact = `Mobile: ${phoneNumbers}   |   Email: ${emailAddress}   |   Website: ${websiteUrl}`;
  pdf.text(footerContact, pageWidth / 2, y, { align: 'center' });

  return pdf;
}

export function downloadBillPdf(doc: BillDocument, settings: BusinessSettings): void {
  const pdf = generateBillPdf(doc, settings);
  const cleanNum = doc.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  pdf.save(`${cleanNum}_${doc.documentType.toLowerCase()}.pdf`);
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

export function printBillPdf(doc: BillDocument, settings: BusinessSettings): void {
  const pdf = generateBillPdf(doc, settings);
  pdf.autoPrint();
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 300);
  };
}

export function shareViaWhatsApp(doc: BillDocument, settings: BusinessSettings): void {
  const isInvoice = doc.documentType === 'INVOICE';
  const typeLabel = isInvoice ? 'Tax Invoice' : 'Quotation';

  let msg = `*${settings.businessName}*\n`;
  msg += `*${typeLabel}: ${doc.documentNumber}*\n`;
  msg += `Date: ${formatLetterpadDate(doc.date)}\n\n`;
  msg += `Dear *${doc.customerName || 'Customer'}*,\n`;
  msg += `Thank you for your business inquiry with us. Below is your ${typeLabel.toLowerCase()} summary:\n\n`;

  doc.items.forEach((item, i) => {
    if (item.calculationType === 'AREA') {
      msg += `${i + 1}. *${item.width} x ${item.height} - Feet - ${item.productName}*\n   ${Math.round(item.area)} Sq.ft × Rs. ${item.rate} (Qty: ${item.quantity}) = *Rs. ${formatIndianNumber(item.amount)}*\n`;
    } else {
      msg += `${i + 1}. *${item.productName}*\n   Qty: ${item.quantity} @ Rs. ${item.rate} = *Rs. ${formatIndianNumber(item.amount)}*\n`;
    }
  });

  if (doc.additionalCharges && doc.additionalCharges.length > 0) {
    msg += `\n*Additional Charges:*\n`;
    doc.additionalCharges.forEach(chg => {
      msg += `• ${chg.label}: Rs. ${formatIndianNumber(chg.amount)}\n`;
    });
  }

  msg += `\n*Total:* *Rs. ${formatIndianNumber(doc.grandTotal)}/-*\n`;
  if (doc.advancePaid > 0) {
    msg += `*Advance Paid:* Rs. ${formatIndianNumber(doc.advancePaid)}\n`;
    msg += `*Balance Due:* *Rs. ${formatIndianNumber(doc.balanceDue)}*\n`;
  }

  // Online bill link
  try {
    const viewUrl = getShareableBillUrl(doc);
    if (viewUrl) {
      msg += `\n📄 *View / Download Letterpad Online:*\n${viewUrl}\n\n`;
    }
  } catch (e) {
    // Ignore
  }

  msg += `*Pixel Graphic* - 286, D.B Road, R.S Puram, Coimbatore - 641 002.\nPh: ${settings.phone}\n`;

  const encodedMsg = encodeURIComponent(msg);
  const cleanMobile = (doc.customerMobile || '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanMobile ? (cleanMobile.length === 10 ? '91' + cleanMobile : cleanMobile) : ''}?text=${encodedMsg}`;
  window.open(waUrl, '_blank');
}
