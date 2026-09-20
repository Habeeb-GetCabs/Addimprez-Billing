import { BillDocument } from '../types';

/**
 * Creates a portable, shareable URL for a bill.
 * Encodes key document data in the URL hash so anyone opening the link
 * (even on a different device without local storage) can view the complete bill.
 */
export function getShareableBillUrl(doc: BillDocument): string {
  try {
    // Keep payload compact
    const compact = {
      id: doc.id,
      t: doc.documentType,
      n: doc.documentNumber,
      d: doc.date,
      v: doc.validUntil,
      c: {
        id: doc.customerId,
        n: doc.customerName,
        m: doc.customerMobile,
        a: doc.customerAddress,
        e: doc.customerEmail,
        g: doc.customerGst,
      },
      it: doc.items.map(item => ({
        id: item.id,
        pn: item.productName,
        cn: item.categoryName,
        ct: item.calculationType,
        w: item.width,
        h: item.height,
        ar: item.area,
        q: item.quantity,
        u: item.unit,
        r: item.rate,
        a: item.amount,
        nt: item.notes,
      })),
      ac: doc.additionalCharges || [],
      st: doc.subtotal,
      dt: doc.discountType,
      dv: doc.discountValue,
      da: doc.discountAmount,
      ge: doc.gstEnabled,
      gp: doc.gstPercentage,
      ga: doc.gstAmount,
      gt: doc.grandTotal,
      ap: doc.advancePaid,
      bd: doc.balanceDue,
      tc: doc.termsAndConditions,
      s: doc.status,
    };

    const json = JSON.stringify(compact);
    // Safe base64 encoding for Unicode
    const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));

    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    return `${baseUrl}#view=${base64}`;
  } catch (e) {
    console.error('Failed to generate shareable bill URL:', e);
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    return `${baseUrl}#bill=${encodeURIComponent(doc.documentNumber || doc.id)}`;
  }
}

/**
 * Parses the current URL hash or query string to detect if a bill is being viewed.
 */
export function parseBillFromUrl(knownDocuments: BillDocument[]): BillDocument | null {
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const fullParams = new URLSearchParams(hash.replace(/^#/, '').replace(/^\?/, ''));
    const queryParams = new URLSearchParams(search);

    // 1. Check for encoded data hash (#view=...)
    const viewData = fullParams.get('view') || queryParams.get('view');
    if (viewData) {
      try {
        const decoded = decodeURIComponent(
          Array.prototype.map
            .call(atob(viewData), (c: string) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        const data = JSON.parse(decoded);
        if (data && data.n && Array.isArray(data.it)) {
          const doc: BillDocument = {
            id: data.id || `doc_${Date.now()}`,
            documentType: data.t || 'QUOTATION',
            documentNumber: data.n,
            date: data.d || new Date().toISOString(),
            validUntil: data.v,
            customerId: data.c?.id || 'cust_temp',
            customerName: data.c?.n || 'Customer',
            customerMobile: data.c?.m || '',
            customerAddress: data.c?.a || '',
            customerEmail: data.c?.e,
            customerGst: data.c?.g,
            items: data.it.map((it: any, index: number) => ({
              id: it.id || `item_${index}`,
              productId: it.pid || '',
              productName: it.pn || 'Item',
              categoryName: it.cn || '',
              calculationType: it.ct || 'QUANTITY',
              width: it.w || 0,
              height: it.h || 0,
              area: it.ar || 0,
              quantity: it.q || 1,
              unit: it.u || 'Pcs',
              rate: it.r || 0,
              amount: it.a || 0,
              notes: it.nt,
            })),
            additionalCharges: data.ac || [],
            subtotal: data.st || 0,
            discountType: data.dt || 'FIXED',
            discountValue: data.dv || 0,
            discountAmount: data.da || 0,
            additionalChargesTotal: (data.ac || []).reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0),
            gstEnabled: !!data.ge,
            gstPercentage: data.gp || 0,
            gstAmount: data.ga || 0,
            grandTotal: data.gt || 0,
            advancePaid: data.ap || 0,
            balanceDue: data.bd || 0,
            payments: [],
            termsAndConditions: data.tc || [],
            status: data.s || 'Sent',
            createdAt: data.d || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return doc;
        }
      } catch (err) {
        console.warn('Could not parse encoded view hash:', err);
      }
    }

    // 2. Check for bill ID or document number (#bill=... or ?bill=...)
    const billRef = fullParams.get('bill') || queryParams.get('bill') || fullParams.get('doc') || queryParams.get('doc');
    if (billRef) {
      const match = knownDocuments.find(
        d => d.id === billRef || d.documentNumber.toLowerCase() === billRef.toLowerCase()
      );
      if (match) return match;
    }

    return null;
  } catch (e) {
    console.warn('Error reading bill from URL:', e);
    return null;
  }
}
