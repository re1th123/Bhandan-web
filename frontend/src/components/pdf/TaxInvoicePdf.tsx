import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font for bold text, if standard font is not enough (standard Helvetica has bold). We will use standard Helvetica for simplicity but ensure we use font-weight styles.

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A237E',
    paddingBottom: 10,
  },
  companyInfo: {
    width: '60%',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  invoiceTitleWrapper: {
    width: '40%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C6BC0',
  },
  invoiceSubTitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    paddingRight: 10,
  },
  columnRight: {
    flex: 1,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    padding: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: 80,
    color: '#666',
  },
  value: {
    flex: 1,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5C6BC0',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colNo: { width: '5%', padding: 5, borderRightWidth: 1, borderRightColor: '#eee' },
  colDesc: { width: '35%', padding: 5, borderRightWidth: 1, borderRightColor: '#eee' },
  colQty: { width: '8%', padding: 5, borderRightWidth: 1, borderRightColor: '#eee', textAlign: 'right' },
  colRate: { width: '12%', padding: 5, borderRightWidth: 1, borderRightColor: '#eee', textAlign: 'right' },
  colTaxVal: { width: '12%', padding: 5, borderRightWidth: 1, borderRightColor: '#eee', textAlign: 'right' },
  colTax: { width: '14%', padding: 5, borderRightWidth: 1, borderRightColor: '#eee', textAlign: 'right' },
  colTotal: { width: '14%', padding: 5, textAlign: 'right' },
  
  summary: {
    flexDirection: 'row',
    marginTop: 10,
  },
  summaryLeft: {
    width: '60%',
    paddingRight: 20,
  },
  summaryRight: {
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#5C6BC0',
    fontWeight: 'bold',
    fontSize: 11,
  },
  words: {
    marginTop: 15,
    fontStyle: 'italic',
    color: '#555',
  },
  bankDetails: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  signArea: {
    width: 150,
    alignItems: 'center',
  },
  signLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 5,
  }
});

// Utility to convert number to words
function numberToWords(num: number): string {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  if ((num = num || 0) === 0) return 'Zero';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  return str.trim() + ' Only';
}

const formatCurr = (num: number) => 'Rs. ' + num.toFixed(2);

export interface TaxInvoicePdfProps {
  invoice: any;
  business: any;
}

const TaxInvoicePdf: React.FC<TaxInvoicePdfProps> = ({ invoice, business }) => {
  const bizName = business?.name || 'Your Business Name';
  const bizGstin = business?.gstin || '27AADCB2230M1Z2';
  const bizAddress = business?.address || '123 Business Avenue, Tech Park';
  const bizState = business?.state || 'Maharashtra (27)';

  const custName = invoice?.customers?.name || 'Customer Name';
  const custGstin = invoice?.customers?.gstin || 'N/A';
  
  // Use existing items or fallback
  const items = (invoice?.items_json && invoice.items_json.length > 0) ? invoice.items_json : [
    { desc: 'Consulting Services', hsn: '9983', qty: 1, rate: invoice?.total_amount - invoice?.gst_amount || 100000, taxRate: 18 }
  ];

  const subtotal = invoice?.total_amount - invoice?.gst_amount || 100000;
  const cgst = invoice?.gst_amount / 2 || 9000;
  const sgst = invoice?.gst_amount / 2 || 9000;
  const total = invoice?.total_amount || 118000;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{bizName}</Text>
            <Text>{bizAddress}</Text>
            <Text>GSTIN: {bizGstin}</Text>
            <Text>State: {bizState}</Text>
          </View>
          <View style={styles.invoiceTitleWrapper}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceSubTitle}>(Original for Recipient)</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{custName}</Text>
            <Text>GSTIN: {custGstin}</Text>
            <Text>Place of Supply: Maharashtra (27)</Text>
          </View>
          <View style={styles.columnRight}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice No:</Text>
              <Text style={styles.value}>{invoice?.invoice_no || 'INV-001'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice Date:</Text>
              <Text style={styles.value}>{invoice?.date || '2026-07-25'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{invoice?.due_date || '2026-08-25'}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>#</Text>
            <Text style={styles.colDesc}>Product / HSN</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colTaxVal}>Taxable</Text>
            <Text style={styles.colTax}>GST %</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>
          
          {items.map((item: any, i: number) => {
            const qty = item.qty || 1;
            const rate = item.rate || subtotal;
            const taxVal = qty * rate;
            const taxPct = item.taxRate || 18;
            const taxAmt = (taxVal * taxPct) / 100;
            const rowTotal = taxVal + taxAmt;
            
            return (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.colNo}>{i + 1}</Text>
                <Text style={styles.colDesc}>{item.desc || 'Item'} {item.hsn ? `\nHSN: ${item.hsn}` : ''}</Text>
                <Text style={styles.colQty}>{qty}</Text>
                <Text style={styles.colRate}>{rate.toFixed(2)}</Text>
                <Text style={styles.colTaxVal}>{taxVal.toFixed(2)}</Text>
                <Text style={styles.colTax}>{taxPct}%</Text>
                <Text style={styles.colTotal}>{rowTotal.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryLeft}>
            <Text style={styles.words}>Amount in Words: {numberToWords(Math.round(total))}</Text>
            
            <View style={styles.bankDetails}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Bank Details</Text>
              <Text>Bank Name: HDFC Bank Ltd</Text>
              <Text>Account No: 50200012345678</Text>
              <Text>IFSC Code: HDFC0001234</Text>
              <Text>Branch: Mumbai Central</Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <View style={styles.summaryRow}>
              <Text>Taxable Value</Text>
              <Text>{formatCurr(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>CGST</Text>
              <Text>{formatCurr(cgst)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>SGST</Text>
              <Text>{formatCurr(sgst)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text>Grand Total</Text>
              <Text>{formatCurr(total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Terms &amp; Conditions:</Text>
            <Text>1. Goods once sold will not be taken back.</Text>
            <Text>2. Interest @ 18% p.a. will be charged if payment is delayed.</Text>
            <Text>3. Subject to local jurisdiction.</Text>
          </View>
          <View style={styles.signArea}>
            <View style={styles.signLine} />
            <Text>Authorized Signatory</Text>
            <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>For {bizName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TaxInvoicePdf;
