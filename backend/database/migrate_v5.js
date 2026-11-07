/**
 * Migration v5: Student Photograph Integration
 * Adds photo_url and photo_updated_at to students profile table
 * and sets up secure photo storage directory.
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigration() {
  console.log('--- RUNNING MIGRATION V5: STUDENT PHOTOGRAPH INTEGRATION ---');
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Ensure uploads/photos directory exists
    const photosDir = path.join(__dirname, '../uploads/photos');
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
      console.log('✅ Created backend/uploads/photos directory');
    }

    // 2. Add photo_url to students if not present
    const [colsPhoto] = await connection.query("SHOW COLUMNS FROM students LIKE 'photo_url'");
    if (colsPhoto.length === 0) {
      await connection.query("ALTER TABLE students ADD COLUMN photo_url VARCHAR(255) NULL AFTER batch_year");
      console.log('✅ Added photo_url column to students table');
    }

    // 3. Add photo_updated_at to students if not present
    const [colsDate] = await connection.query("SHOW COLUMNS FROM students LIKE 'photo_updated_at'");
    if (colsDate.length === 0) {
      await connection.query("ALTER TABLE students ADD COLUMN photo_updated_at DATETIME NULL AFTER photo_url");
      console.log('✅ Added photo_updated_at column to students table');
    }

    // 4. Create high-quality institutional sample photo for seed students
    // A clean SVG portrait saved as an accessible image
    const samplePhotoPath = path.join(photosDir, 'student_sample_portrait.png');
    
    // 1x1 transparent/colored PNG or SVG data URL
    // Standard 300x360 passport SVG converted to file
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="360" viewBox="0 0 300 360">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8E0EE"/>
      <stop offset="100%" stop-color="#C5B4D3"/>
    </linearGradient>
    <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2C4A2"/>
      <stop offset="100%" stop-color="#DE9E74"/>
    </linearGradient>
    <linearGradient id="coat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#261B50"/>
      <stop offset="100%" stop-color="#160E2E"/>
    </linearGradient>
  </defs>
  <rect width="300" height="360" fill="url(#bg)"/>
  <!-- Hair back -->
  <circle cx="150" cy="130" r="66" fill="#1A1822"/>
  <!-- Neck -->
  <rect x="135" y="180" width="30" height="40" fill="#DE9E74"/>
  <!-- Head -->
  <ellipse cx="150" cy="140" rx="50" ry="58" fill="url(#skin)"/>
  <!-- Hair top -->
  <path d="M98 126 C100 80 200 80 202 126 C180 100 120 100 98 126 Z" fill="#1A1822"/>
  <!-- Eyes -->
  <circle cx="132" cy="138" r="5" fill="#1A1822"/>
  <circle cx="168" cy="138" r="5" fill="#1A1822"/>
  <!-- Eyebrows -->
  <path d="M125 128 Q132 124 140 128" stroke="#1A1822" stroke-width="3" fill="none"/>
  <path d="M160 128 Q168 124 175 128" stroke="#1A1822" stroke-width="3" fill="none"/>
  <!-- Nose -->
  <path d="M150 142 L146 156 L154 156" stroke="#C57E52" stroke-width="2" fill="none"/>
  <!-- Smile -->
  <path d="M138 168 Q150 178 162 168" stroke="#9E4D30" stroke-width="3" fill="none"/>
  <!-- Shoulders & Suit -->
  <path d="M50 360 C50 250 120 220 150 220 C180 220 250 250 250 360 Z" fill="url(#coat)"/>
  <polygon points="150,220 135,260 165,260" fill="#FFFFFF"/>
  <polygon points="150,230 145,280 150,300 155,280" fill="#B95BD5"/>
  <rect x="15" y="325" width="270" height="24" rx="12" fill="#261B50" opacity="0.85"/>
  <text x="150" y="341" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="1">INSTITUTIONAL ID PHOTO</text>
</svg>`;

    const samplePhotoSvgPath = path.join(photosDir, 'student_sample_portrait.svg');
    fs.writeFileSync(samplePhotoSvgPath, sampleSvg, 'utf8');

    // Also write as fallback default photo url
    const defaultPhotoUrl = '/uploads/photos/student_sample_portrait.svg';

    // 5. Update existing seed students who have NULL photo_url
    await connection.query(`
      UPDATE students 
      SET photo_url = ?, photo_updated_at = NOW()
      WHERE photo_url IS NULL
    `, [defaultPhotoUrl]);
    console.log('✅ Seeded default institutional student photograph for existing student accounts');

    await connection.commit();
    console.log('🎉 MIGRATION V5 COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('❌ Migration v5 failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
}

runMigration();
