const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates a PDF receipt and returns the file path.
 * @param {Object} order 
 * @returns {Promise<string>} 
 */
const generateReceiptPDF = async (order) => {
  const receiptsDir = path.join(__dirname, '..', 'receipts');

  //Ensure receipts directory exists
  await fs.promises.mkdir(receiptsDir, { recursive: true });

  const fileName = `receipt-${order._id}.pdf`;
  const filePath = path.join(receiptsDir, fileName);

  // Create the PDF document
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc
    .fontSize(22)
    .text('QuickCart Receipt', { align: 'center' })
    .moveDown(1);

  doc
    .fontSize(12)
    .text(`Order ID: ${order._id}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
    .text(`Payment Status: ${order.paymentStatus}`)
    .text(`Payment Method: ${order.paymentMethod}`)
    .moveDown();

  const addr = order.shippingAddress;
  doc
    .text(`Customer: ${addr.fullName}`)
    .text(`Email: ${addr.email}`)
    .text(`Phone: ${addr.phone}`)
    .text(`Address: ${addr.address}, ${addr.city}, ${addr.state} - ${addr.zipCode}`)
    .moveDown();

  doc
    .fontSize(14)
    .text('Items Ordered', { underline: true })
    .moveDown(0.5);

  order.items.forEach((item, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. ${item.product.name} x ${item.quantity} @ ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}`);
  });

  doc
    .moveDown()
    .fontSize(12)
    .text(`Total Amount Paid: ₹${order.totalAmount.toFixed(2)}`)
    .moveDown(1);

  doc
    .fontSize(10)
    .text('Thank you for shopping with QuickCart!', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

module.exports = generateReceiptPDF;
