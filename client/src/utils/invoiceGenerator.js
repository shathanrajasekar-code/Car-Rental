import { jsPDF } from 'jspdf';

export const generateInvoicePDF = (booking, payment) => {
  const doc = new jsPDF();

  // Header / Logo Brand
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(14, 165, 233); // Sky blue color accent
  doc.text('Bharath Car Rentals', 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.text('123 University Avenue, Academic Campus', 14, 26);
  doc.text('Email: support@bharathrentals.com | Phone: +91 98765 43210', 14, 31);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 36, 196, 36);

  // Title
  doc.setFontSize(13);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('INVOICE / RECEIPT', 14, 46);

  // Metadata details
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Invoice Ref: INV-${payment?.transactionId || 'SEED-' + Math.floor(Math.random() * 90000)}`, 14, 54);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 59);
  doc.text(`Booking Reference: ${booking._id}`, 14, 64);
  doc.text(`Transaction Status: SUCCESS / PAID`, 14, 69);

  // Client info
  doc.setFont('Helvetica', 'bold');
  doc.text('Billed To:', 120, 46);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Client Name: ${booking.customer?.name || 'Jane Smith'}`, 120, 54);
  doc.text(`Email Address: ${booking.customer?.email || 'customer@carrental.com'}`, 120, 59);
  doc.text(`License ID: ${booking.customer?.drivingLicense || 'DL-987654321'}`, 120, 64);

  // Table header background
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 78, 182, 8, 'F');
  
  // Table header text
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Rented Vehicle Description', 16, 83);
  doc.text('Daily Rate', 110, 83);
  doc.text('Days', 145, 83);
  doc.text('Line Total', 170, 83);

  // Table row text
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Rental Vehicle';
  doc.text(vehicleName, 16, 93);
  
  const dailyPrice = booking.vehicle?.dailyPrice || Math.round(booking.totalAmount / booking.totalDays);
  doc.text(`Rs. ${dailyPrice}.00`, 110, 93);
  doc.text(`${booking.totalDays}`, 145, 93);
  doc.text(`Rs. ${booking.totalAmount}.00`, 170, 93);

  // Underline row
  doc.setDrawColor(241, 245, 249);
  doc.line(14, 98, 196, 98);

  // Booking schedule details
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Trip Schedule Details:', 14, 108);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Pickup Date: ${new Date(booking.pickupDate).toDateString()}`, 14, 115);
  doc.text(`Return Date: ${new Date(booking.returnDate).toDateString()}`, 14, 120);
  doc.text(`License Plate: ${booking.vehicle?.plateNumber || 'N/A'}`, 14, 125);

  // Calculations totals box
  doc.setFillColor(248, 250, 252);
  doc.rect(120, 104, 76, 26, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', 124, 110);
  doc.text(`Rs. ${booking.totalAmount}.00`, 170, 110);
  
  doc.setFont('Helvetica', 'normal');
  doc.text('Taxes & Insurance:', 124, 116);
  doc.text('Rs. 0.00', 170, 116);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(14, 165, 233);
  doc.text('Total Paid:', 124, 124);
  doc.text(`Rs. ${booking.totalAmount}.00`, 170, 124);

  // Bottom Notice
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for choosing Bharath Rentals. Drive safely!', 14, 145);

  // Trigger file download
  doc.save(`invoice-${booking._id}.pdf`);
};
