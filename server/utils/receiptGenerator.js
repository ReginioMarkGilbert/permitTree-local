const PDFDocument = require('pdfkit');
const path = require('path');
const crypto = require('crypto');

// Function to generate a random receipt number
const generateReceiptNumber = () => {
	const timestamp = Date.now().toString();
	const randomString = crypto.randomBytes(4).toString('hex');
	return `OR-${timestamp}-${randomString}`;
};

const generateReceipt = (oop) => {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument();
		const chunks = [];

		doc.on('data', (chunk) => chunks.push(chunk));
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);

		// Load the custom font (Roboto-Regular in this case)
		doc.font(path.join(__dirname, '../fonts', 'Roboto-Regular.ttf'));

		// Function to format currency
		const formatCurrency = (amount) => {
			const numericAmount = parseFloat(amount.toString().replace(/[^\d.]/g, ''));
			return isNaN(numericAmount) ? '0.00' : numericAmount.toFixed(2);
		};

		// Generate a unique receipt number
		const receiptNumber = generateReceiptNumber();

		// Add content to the PDF
		doc.fontSize(18).text('Official Receipt', { align: 'center' });
		doc.moveDown();
		doc.fontSize(12).text(`Receipt Number: ${receiptNumber}`);
		doc.text(`Bill Number: ${oop.billNo}`);
		doc.text(`Date: ${new Date().toLocaleDateString()}`);
		doc.text(`Applicant: ${oop.applicantName}`);
		doc.text(`Amount Paid: ₱${formatCurrency(oop.totalAmount)}`);
		doc.text(`Application ID: ${oop.applicationId}`);
		doc.moveDown();

		// Payment details table
		doc.text('Payment Details', { underline: true });
		oop.items.forEach(item => {
			doc.text(`${item.description}: ₱${formatCurrency(item.amount)}`);
		});
		doc.moveDown();
		doc.text(`Total Amount: ₱${formatCurrency(oop.totalAmount)}`, { align: 'right' });

		doc.moveDown();
		doc.text('Thank you for your payment.', { align: 'center' });

		// Finalize the PDF and end the stream
		doc.end();
	});
};

module.exports = { generateReceipt };
