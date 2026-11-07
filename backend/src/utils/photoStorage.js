const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PHOTOS_DIR = path.join(__dirname, '../../uploads/photos');
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Saves and validates a student photograph from file or base64 data string.
 * @param {object|string} photoInput - multer file object OR base64 data URL string
 * @param {string|number} identifier - student registration number or user id
 * @returns {Promise<string>} web accessible path e.g. /uploads/photos/photo_...
 */
async function saveStudentPhoto(photoInput, identifier = 'student') {
  if (!photoInput) {
    throw new Error('Student photograph is mandatory. Please capture or upload a clear, front-facing photograph.');
  }

  const cleanId = String(identifier).replace(/[^a-zA-Z0-9_-]/g, '_');
  const randomSuffix = crypto.randomBytes(4).toString('hex');

  // Case 1: multer uploaded file
  if (typeof photoInput === 'object' && photoInput.path) {
    const ext = path.extname(photoInput.originalname || photoInput.filename).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      try { fs.unlinkSync(photoInput.path); } catch (e) {}
      throw new Error('Invalid photograph format. Only JPG, JPEG, PNG, and WEBP formats are accepted.');
    }

    if (photoInput.size > MAX_SIZE_BYTES) {
      try { fs.unlinkSync(photoInput.path); } catch (e) {}
      throw new Error('Photograph file size exceeds the 5MB limit.');
    }

    const newFilename = `photo_${cleanId}_${Date.now()}_${randomSuffix}${ext}`;
    const targetPath = path.join(PHOTOS_DIR, newFilename);
    fs.copyFileSync(photoInput.path, targetPath);
    try { fs.unlinkSync(photoInput.path); } catch (e) {}

    return `/uploads/photos/${newFilename}`;
  }

  // Case 2: base64 Data URL string
  if (typeof photoInput === 'string' && photoInput.startsWith('data:image/')) {
    const matches = photoInput.match(/^data:(image\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid photograph image encoding.');
    }

    const mimeType = matches[1].toLowerCase();
    if (!ALLOWED_MIMES.includes(mimeType)) {
      throw new Error('Invalid photograph format. Only JPG, JPEG, PNG, and WEBP formats are accepted.');
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_SIZE_BYTES) {
      throw new Error('Photograph file size exceeds the 5MB limit.');
    }

    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';

    const newFilename = `photo_${cleanId}_${Date.now()}_${randomSuffix}${ext}`;
    const targetPath = path.join(PHOTOS_DIR, newFilename);
    fs.writeFileSync(targetPath, buffer);

    return `/uploads/photos/${newFilename}`;
  }

  // Case 3: already an existing valid uploads/photos URL (e.g. during certain updates or migrations)
  if (typeof photoInput === 'string' && (photoInput.startsWith('/uploads/photos/') || photoInput.startsWith('/uploads/'))) {
    return photoInput;
  }

  throw new Error('Invalid photograph input. Please capture via camera or upload a valid image file.');
}

module.exports = {
  saveStudentPhoto,
  PHOTOS_DIR
};
