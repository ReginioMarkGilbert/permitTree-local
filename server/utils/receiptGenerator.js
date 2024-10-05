const PDFDocument = require('pdfkit');

const generateReceipt = (orderOfPayment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add content to the PDF
    doc.fontSize(18).text('Official Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt Number: ${orderOfPayment.billNo}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Applicant: ${orderOfPayment.applicantName}`);
    doc.text(`Amount Paid: ₱${orderOfPayment.totalAmount.toFixed(2)}`);
    doc.text(`Application ID: ${orderOfPayment.applicationId}`);
    doc.moveDown();
    doc.text('Thank you for your payment.', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateReceipt };
