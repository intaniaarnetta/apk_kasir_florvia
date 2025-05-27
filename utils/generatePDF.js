const PdfPrinter = require('pdfmake');
const moment = require('moment');

// ✅ Gunakan font built-in dari pdfkit (tanpa file eksternal)
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const printer = new PdfPrinter(fonts);

// 🔧 Fungsi untuk mengelompokkan transaksi per tanggal
function groupByDate(transactions) {
  return transactions.reduce((acc, transaksi) => {
    const tanggal = moment(transaksi.tanggal).format('YYYY-MM-DD');
    if (!acc[tanggal]) acc[tanggal] = [];
    acc[tanggal].push(transaksi);
    return acc;
  }, {});
}

// 🧾 Fungsi utama untuk generate PDF
function generatePDF(transactions, res, totalKeseluruhan = 0) {
  const grouped = groupByDate(transactions);

  const content = [
    { text: 'Riwayat Transaksi', style: 'header', margin: [0, 0, 0, 10] }
  ];

  for (const [tanggal, transaksiPerTanggal] of Object.entries(grouped)) {
    content.push({ text: `Tanggal: ${tanggal}`, style: 'subheader', margin: [0, 10, 0, 5] });

    const tableBody = [
      [
        { text: 'No', style: 'tableHeader' },
        { text: 'Produk', style: 'tableHeader' },
        { text: 'Jumlah', style: 'tableHeader' },
        { text: 'Harga Satuan', style: 'tableHeader' },
        { text: 'Total', style: 'tableHeader' }
      ]
    ];

    transaksiPerTanggal.forEach((item, index) => {
      tableBody.push([
        index + 1,
        item.namaProduk || '-',
        item.jumlah || 0,
        `Rp${(item.harga || 0).toLocaleString('id-ID')}`,
        `Rp${((item.harga || 0) * (item.jumlah || 0)).toLocaleString('id-ID')}`
      ]);
    });

    content.push({
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        body: tableBody
      }
    });
  }

  // 🧮 Tambahkan total keseluruhan di akhir
  content.push({
    text: `Total Keseluruhan: Rp${totalKeseluruhan.toLocaleString('id-ID')}`,
    style: 'total',
    alignment: 'right',
    margin: [0, 10, 0, 0]
  });

  const docDefinition = {
    content,
    defaultStyle: {
      font: 'Helvetica'
    },
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 14, bold: true },
      tableHeader: { bold: true, fillColor: '#eeeeee' },
      total: { fontSize: 12, bold: true }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=riwayat-transaksi.pdf');
  pdfDoc.pipe(res);
  pdfDoc.end();
}

module.exports = generatePDF;
