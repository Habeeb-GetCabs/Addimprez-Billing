import { jsPDF } from 'jspdf';
import { BillDocument, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from './calculations';
import { getShareableBillUrl } from './shareableLink';

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
  let y = margin;

  // --- Header Band ---
  const isInvoice = doc.documentType === 'INVOICE';
  const primaryColor = isInvoice ? [24, 76, 120] : [79, 70, 229]; // Navy blue for invoice, Indigo for quotation
  const accentColor = [240, 243, 248];

  // Top color banner
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(margin, y, contentWidth, 22, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(isInvoice ? 'TAX INVOICE / BILL' : 'QUOTATION / ESTIMATE', margin + 6, y + 10);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(`${isInvoice ? 'Invoice' : 'Quotation'} No: ${doc.documentNumber}`, margin + 6, y + 16.5);

  pdf.text(`Date: ${formatDate(doc.date)}`, pageWidth - margin - 6, y + 10, { align: 'right' });
  if (!isInvoice && doc.validUntil) {
    pdf.text(`Valid Until: ${formatDate(doc.validUntil)}`, pageWidth - margin - 6, y + 16.5, { align: 'right' });
  }

  y += 26;

  // --- Business & Client Details Row ---
  const colWidth = contentWidth / 2 - 3;
  const infoBoxHeight = 32;

  // Company Box (Left)
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, colWidth, infoBoxHeight, 1.5, 1.5, 'FD');

  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(settings.businessName, margin + 4, y + 6);

  pdf.setTextColor(71, 85, 105);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  if (settings.tagline) {
    pdf.text(settings.tagline, margin + 4, y + 10.5);
  }

  const businessLines = pdf.splitTextToSize(
    `${settings.address}\nPhone: ${settings.phone}${settings.email ? ' | ' + settings.email : ''}${settings.gstNumber ? '\nGSTIN: ' + settings.gstNumber : ''}`,
    colWidth - 8
  );
  pdf.text(businessLines, margin + 4, y + 15);

  // Client Box (Right)
  const clientX = margin + colWidth + 6;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(clientX, y, colWidth, infoBoxHeight, 1.5, 1.5, 'FD');

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('BILLED TO / CUSTOMER:', clientX + 4, y + 6);

  pdf.setFontSize(10.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(doc.customerName || 'Walk-in Customer', clientX + 4, y + 11.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.setFontSize(8);
  const clientLines = pdf.splitTextToSize(
    `Mobile: ${doc.customerMobile || 'N/A'}\nAddress: ${doc.customerAddress || 'N/A'}${doc.customerGst ? '\nGSTIN: ' + doc.customerGst : ''}`,
    colWidth - 8
  );
  pdf.text(clientLines, clientX + 4, y + 16.5);

  y += infoBoxHeight + 6;

  // --- Line Items Table ---
  // Table Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(margin, y, contentWidth, 7.5, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);

  const colSno = margin + 3;
  const colDesc = margin + 12;
  const colDim = margin + 92;
  const colQty = margin + 126;
  const colRate = margin + 148;
  const colAmt = pageWidth - margin - 3;

  pdf.text('#', colSno, y + 5);
  pdf.text('Product / Service Description', colDesc, y + 5);
  pdf.text('Dimensions / Area', colDim, y + 5);
  pdf.text('Qty', colQty, y + 5);
  pdf.text('Rate', colRate, y + 5);
  pdf.text('Amount (INR)', colAmt, y + 5, { align: 'right' });

  y += 7.5;

  // Table Body
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  doc.items.forEach((item, index) => {
    // Check if new page needed
    if (y > pageHeight - 55) {
      pdf.addPage();
      y = margin;
    }

    const isEven = index % 2 === 0;
    const rowHeight = 7.5;

    if (isEven) {
      pdf.setFillColor(252, 253, 254);
      pdf.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    pdf.setDrawColor(241, 245, 249);
    pdf.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    pdf.setTextColor(51, 65, 85);
    pdf.text(`${index + 1}`, colSno, y + 5);

    // Name & category
    const title = item.productName || 'Item';
    pdf.setFont('helvetica', 'bold');
    pdf.text(title.length > 42 ? title.substring(0, 39) + '...' : title, colDesc, y + 5);

    pdf.setFont('helvetica', 'normal');
    // Dimensions or calculation
    if (item.calculationType === 'AREA') {
      const dimText = `${item.width}ft × ${item.height}ft = ${item.area} Sq.ft`;
      pdf.text(dimText, colDim, y + 5);
    } else {
      pdf.text(item.unit || 'Units', colDim, y + 5);
    }

    // Qty
    pdf.text(`${item.quantity} ${item.calculationType === 'AREA' ? 'Pcs' : ''}`.trim(), colQty, y + 5);

    // Rate
    const rateText = `Rs. ${item.rate}${item.calculationType === 'AREA' ? '/sqft' : ''}`;
    pdf.text(rateText, colRate, y + 5);

    // Amount
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency(item.amount, 'Rs. '), colAmt, y + 5, { align: 'right' });

    y += rowHeight;
  });

  // Additional Charges Section
  if (doc.additionalCharges && doc.additionalCharges.length > 0) {
    doc.additionalCharges.forEach((chg, idx) => {
      if (y > pageHeight - 55) {
        pdf.addPage();
        y = margin;
      }
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y, contentWidth, 6.5, 'F');
      pdf.setDrawColor(241, 245, 249);
      pdf.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`+ Additional Charge: ${chg.label || chg.type}`, colDesc, y + 4.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(chg.amount, 'Rs. '), colAmt, y + 4.5, { align: 'right' });
      y += 6.5;
    });
  }

  y += 4;

  // --- Summary & Totals Box ---
  if (y > pageHeight - 75) {
    pdf.addPage();
    y = margin;
  }

  const summaryWidth = 78;
  const summaryX = pageWidth - margin - summaryWidth;
  const notesWidth = contentWidth - summaryWidth - 6;

  // Left Box: Payment Details & Bank Details
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, notesWidth, 38, 1.5, 1.5, 'FD');

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('PAYMENT DETAILS / BANK ACCOUNT', margin + 4, y + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);
  let bankY = y + 11;
  pdf.text(`Bank Name: ${settings.bankName || 'State Bank of India'}`, margin + 4, bankY);
  pdf.text(`Account No: ${settings.bankAccountNumber || 'N/A'}`, margin + 4, bankY + 4.5);
  pdf.text(`IFSC Code: ${settings.bankIfsc || 'N/A'}`, margin + 4, bankY + 9);
  pdf.text(`UPI ID / VPA: ${settings.upiId || 'N/A'}`, margin + 4, bankY + 13.5);

  if (doc.payments && doc.payments.length > 0) {
    const latest = doc.payments[doc.payments.length - 1];
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(16, 185, 129);
    pdf.text(`Latest Payment: Rs. ${latest.amount} via ${latest.method} on ${formatDate(latest.date)}`, margin + 4, bankY + 19);
  }

  // Right Box: Totals
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(summaryX, y, summaryWidth, 38, 1.5, 1.5, 'FD');

  const addSummaryRow = (label: string, val: string, rowY: number, bold = false, color?: number[]) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(bold ? 9 : 8);
    if (color) {
      pdf.setTextColor(color[0], color[1], color[2]);
    } else {
      pdf.setTextColor(51, 65, 85);
    }
    pdf.text(label, summaryX + 4, rowY);
    pdf.text(val, summaryX + summaryWidth - 4, rowY, { align: 'right' });
  };

  let rowY = y + 5.5;
  addSummaryRow('Subtotal:', formatCurrency(doc.subtotal, 'Rs. '), rowY);

  if (doc.discountAmount > 0) {
    rowY += 4.5;
    addSummaryRow(`Discount (${doc.discountType === 'PERCENT' ? doc.discountValue + '%' : 'Fixed'}):`, `- ${formatCurrency(doc.discountAmount, 'Rs. ')}`, rowY, false, [220, 38, 38]);
  }

  if (doc.additionalChargesTotal > 0) {
    rowY += 4.5;
    addSummaryRow('Additional Charges:', formatCurrency(doc.additionalChargesTotal, 'Rs. '), rowY);
  }

  if (doc.gstEnabled) {
    rowY += 4.5;
    addSummaryRow(`GST (${doc.gstPercentage}%):`, formatCurrency(doc.gstAmount, 'Rs. '), rowY);
  }

  // Grand Total Highlight
  rowY += 5.5;
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.roundedRect(summaryX + 2, rowY - 3.5, summaryWidth - 4, 7, 1, 1, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Grand Total:', summaryX + 4, rowY + 1.2);
  pdf.text(formatCurrency(doc.grandTotal, 'Rs. '), summaryX + summaryWidth - 4, rowY + 1.2, { align: 'right' });

  // Advance & Balance
  rowY += 7;
  addSummaryRow('Advance Paid:', formatCurrency(doc.advancePaid, 'Rs. '), rowY, false, [16, 185, 129]);
  rowY += 4.5;
  addSummaryRow('Balance Due:', formatCurrency(doc.balanceDue, 'Rs. '), rowY, true, [220, 38, 38]);

  y += 42;

  // --- Terms & Conditions Section (Page 4 PDF Terms) ---
  if (y > pageHeight - 45) {
    pdf.addPage();
    y = margin;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('TERMS & CONDITIONS:', margin, y + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);

  const terms = (doc.termsAndConditions && doc.termsAndConditions.length > 0) 
    ? doc.termsAndConditions 
    : settings.termsAndConditions;

  let termY = y + 8;
  terms.slice(0, 6).forEach((term, tIdx) => {
    const termLines = pdf.splitTextToSize(`${tIdx + 1}. ${term}`, contentWidth - 45);
    pdf.text(termLines, margin, termY);
    termY += termLines.length * 3.4;
  });

  // Authorized Signatory
  const sigX = pageWidth - margin - 40;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`For ${settings.businessName}`, sigX, y + 16, { align: 'center' });
  pdf.line(sigX - 18, y + 26, sigX + 18, y + 26);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Authorized Signatory', sigX, y + 30, { align: 'center' });

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
  msg += `Date: ${formatDate(doc.date)}\n\n`;
  msg += `Dear *${doc.customerName || 'Customer'}*,\n`;
  msg += `Thank you for your business inquiry with us. Below is the summary of your ${typeLabel.toLowerCase()}:\n\n`;

  doc.items.forEach((item, i) => {
    if (item.calculationType === 'AREA') {
      msg += `${i + 1}. *${item.productName}*\n   ${item.width}ft × ${item.height}ft = ${item.area} Sq.ft × Rs. ${item.rate}/sq.ft (Qty: ${item.quantity}) = *Rs. ${item.amount}*\n`;
    } else {
      msg += `${i + 1}. *${item.productName}*\n   ${item.quantity} ${item.unit || 'pcs'} @ Rs. ${item.rate} = *Rs. ${item.amount}*\n`;
    }
  });

  if (doc.additionalCharges && doc.additionalCharges.length > 0) {
    msg += `\n*Additional Charges:*\n`;
    doc.additionalCharges.forEach(chg => {
      msg += `• ${chg.label}: Rs. ${chg.amount}\n`;
    });
  }

  msg += `\n*Subtotal:* Rs. ${doc.subtotal}\n`;
  if (doc.discountAmount > 0) {
    msg += `*Discount:* - Rs. ${doc.discountAmount}\n`;
  }
  if (doc.gstEnabled) {
    msg += `*GST (${doc.gstPercentage}%):* Rs. ${doc.gstAmount}\n`;
  }
  msg += `*Grand Total:* *Rs. ${doc.grandTotal}*\n`;
  msg += `*Advance Paid:* Rs. ${doc.advancePaid}\n`;
  msg += `*Balance Due:* *Rs. ${doc.balanceDue}*\n\n`;

  // Online bill viewing link
  try {
    const viewUrl = getShareableBillUrl(doc);
    if (viewUrl) {
      msg += `📄 *View / Download Bill Online:*\n${viewUrl}\n\n`;
    }
  } catch (e) {
    // Ignore URL errors
  }

  if (settings.upiId) {
    msg += `*UPI Payment ID:* ${settings.upiId}\n`;
  }
  if (settings.phone) {
    msg += `For any inquiries, reach us at ${settings.phone}\n`;
  }

  const encodedMsg = encodeURIComponent(msg);
  const cleanMobile = (doc.customerMobile || '').replace(/[^0-9]/g, '');
  let waUrl = `https://wa.me/${cleanMobile ? (cleanMobile.length === 10 ? '91' + cleanMobile : cleanMobile) : ''}?text=${encodedMsg}`;
  window.open(waUrl, '_blank');
}
