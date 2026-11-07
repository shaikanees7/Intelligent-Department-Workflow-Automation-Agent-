const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../../database/db');

const generatePermissionPdf = async (requestId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await db.query(
        `SELECT r.*, u.first_name, u.last_name, u.email, s.registration_number, s.section, s.photo_url, d.name AS department_name,
                p.pass_reference, p.qr_code_data, p.valid_from, p.valid_until
         FROM permission_requests r
         JOIN users u ON r.student_user_id = u.user_id
         JOIN students s ON s.user_id = u.user_id
         LEFT JOIN departments d ON u.department_id = d.department_id
         LEFT JOIN permission_passes p ON r.request_id = p.request_id
         WHERE r.request_id = ?`,
        [requestId]
      );
      const data = rows[0];
      if (!data) return reject(new Error('Request not found'));

      const outputDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const fileName = `permission_letter_${data.request_code}.pdf`;
      const filePath = path.join(outputDir, fileName);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(16).text('DEPARTMENT OF ' + (data.department_name ? data.department_name.toUpperCase() : 'ENGINEERING'), { align: 'center' });
      doc.fontSize(11).text('OFFICIAL DIGITAL PERMISSION PASS & GATE CLEARANCE', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#261B50').lineWidth(1.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1.5);

      // Embed Student Photo if available (JPG/PNG)
      if (data.photo_url && (data.photo_url.endsWith('.png') || data.photo_url.endsWith('.jpg') || data.photo_url.endsWith('.jpeg'))) {
        const photoDiskPath = path.join(__dirname, '../../', data.photo_url);
        if (fs.existsSync(photoDiskPath)) {
          try {
            doc.rect(440, 95, 80, 100).strokeColor('#B95BD5').lineWidth(1).stroke();
            doc.image(photoDiskPath, 442, 97, { width: 76, height: 96 });
          } catch (e) {
            // Ignore image format error in pdfkit
          }
        }
      }

      // Details block
      doc.fontSize(10).fillColor('#261B50').text(`Application Reference: ${data.request_code}`);
      if (data.pass_reference) {
        doc.text(`Digital Pass ID: ${data.pass_reference}`);
      }
      doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`);
      doc.moveDown(0.5);

      doc.text(`Student Name: ${data.first_name} ${data.last_name}`);
      doc.text(`Registration Number: ${data.registration_number}`);
      doc.text(`Department & Section: ${data.department_name || 'N/A'} - Section ${data.section}`);
      doc.text(`Permission Type: ${data.request_type}`);
      doc.text(`Valid Window: ${new Date(data.valid_from || data.start_date).toLocaleDateString()} To ${new Date(data.valid_until || data.end_date).toLocaleDateString()}`);
      doc.moveDown(0.5);

      doc.text('Stated Reason / Purpose:');
      doc.font('Helvetica-Oblique').text(`"${data.reason}"`, { indent: 15 });
      doc.font('Helvetica').moveDown(1);

      // Embed QR code if available
      if (data.qr_code_data && data.qr_code_data.startsWith('data:image/')) {
        try {
          const base64Data = data.qr_code_data.replace(/^data:image\/[a-z]+;base64,/, '');
          const qrBuffer = Buffer.from(base64Data, 'base64');
          doc.rect(440, 215, 80, 80).strokeColor('#cccccc').lineWidth(0.5).stroke();
          doc.image(qrBuffer, 442, 217, { width: 76, height: 76 });
        } catch (e) {}
      }

      doc.fontSize(10).text('Sanction Status: APPROVED & VALIDATED DIGITALLY', { underline: true });
      doc.moveDown(1.5);

      doc.text('Institutional Verification Workflow:');
      doc.fontSize(9).text('1. Assigned Academic Mentor (Identity & Academic Clearance)');
      doc.text('2. Department Coordinator (Schedule & Lab Verification)');
      doc.text('3. Head of the Department (Final Institutional Sanction)');
      doc.moveDown(1.5);

      doc.fontSize(8).fillColor('#777777').text('Note: This is an official digitally generated permission credential with verified student photograph and security QR code. Authenticity is validated against real-time university database records.', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(`/uploads/${fileName}`));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePermissionPdf };
