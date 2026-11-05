const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../../database/db');

const generatePermissionPdf = async (requestId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await db.query(
        `SELECT r.*, u.first_name, u.last_name, u.email, s.registration_number, s.section, d.name AS department_name
         FROM permission_requests r
         JOIN users u ON r.student_user_id = u.user_id
         JOIN students s ON s.user_id = u.user_id
         LEFT JOIN departments d ON u.department_id = d.department_id
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
      doc.fontSize(18).text('DEPARTMENT OF ' + (data.department_name ? data.department_name.toUpperCase() : 'ENGINEERING'), { align: 'center' });
      doc.fontSize(12).text('OFFICIAL PERMISSION LETTER / GATE PASS', { align: 'center' });
      doc.moveDown();
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(2);

      // Details
      doc.fontSize(11).text(`Reference Code: ${data.request_code}`);
      doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.text(`Student Name: ${data.first_name} ${data.last_name}`);
      doc.text(`Registration Number: ${data.registration_number}`);
      doc.text(`Department & Section: ${data.department_name || 'N/A'} - ${data.section}`);
      doc.text(`Request Type: ${data.request_type}`);
      doc.text(`Valid From: ${new Date(data.start_date).toLocaleDateString()} To: ${new Date(data.end_date).toLocaleDateString()}`);
      doc.moveDown();

      doc.text('Reason / Objective:');
      doc.font('Helvetica-Oblique').text(`"${data.reason}"`, { indent: 20 });
      doc.font('Helvetica').moveDown(2);

      doc.text('Status: SANCTIONED & APPROVED DIGITALLY', { underline: true });
      doc.moveDown(3);

      doc.text('Authorized Signatories:', { bold: true });
      doc.text('1. Assigned Academic Mentor (Verified)');
      doc.text('2. Faculty Coordinator (Approved)');
      doc.text('3. Head of the Department (Sanctioned)');
      doc.moveDown(2);

      doc.fontSize(9).text('Note: This is a system-generated credential verified by the Department Workflow Automation Agent.', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(`/uploads/${fileName}`));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePermissionPdf };
