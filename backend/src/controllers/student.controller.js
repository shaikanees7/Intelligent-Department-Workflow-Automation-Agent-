const db = require('../../database/db');
const ApiResponse = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');
const { saveStudentPhoto } = require('../utils/photoStorage');

/**
 * Get current student's registered photograph
 */
const getStudentPhoto = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [rows] = await db.query(
      `SELECT s.student_id, s.registration_number, s.photo_url, s.photo_updated_at,
              u.first_name, u.last_name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.user_id = ?`,
      [userId]
    );

    const student = rows[0];
    if (!student) {
      return ApiResponse.error(res, 'Student profile not found.', null, 404);
    }

    return ApiResponse.success(res, 'Student photograph retrieved successfully.', {
      student_id: student.student_id,
      registration_number: student.registration_number,
      photo_url: student.photo_url || null,
      photo_updated_at: student.photo_updated_at || null,
      student_name: `${student.first_name} ${student.last_name}`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload or update student photograph
 */
const updateStudentPhoto = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [rows] = await db.query('SELECT * FROM students WHERE user_id = ?', [userId]);
    const student = rows[0];

    if (!student) {
      return ApiResponse.error(res, 'Student profile not found.', null, 404);
    }

    const photoInput = req.file || req.body.photo || req.body.student_photo;
    if (!photoInput) {
      return ApiResponse.error(
        res,
        'Photograph is required. Please capture via camera or select an image file (JPG, PNG, WEBP).',
        null,
        400
      );
    }

    const photoUrl = await saveStudentPhoto(photoInput, student.registration_number);

    await db.query(
      'UPDATE students SET photo_url = ?, photo_updated_at = NOW() WHERE user_id = ?',
      [photoUrl, userId]
    );

    await logAudit({
      userId,
      action: 'STUDENT_PHOTO_UPDATED',
      entityType: 'STUDENT',
      entityId: student.student_id,
      details: {
        registration_number: student.registration_number,
        photo_url: photoUrl
      },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Student photograph updated successfully.', {
      photo_url: photoUrl,
      photo_updated_at: new Date().toISOString()
    });
  } catch (err) {
    if (err.message.includes('mandatory') || err.message.includes('format') || err.message.includes('limit')) {
      return ApiResponse.error(res, err.message, null, 400);
    }
    next(err);
  }
};

module.exports = {
  getStudentPhoto,
  updateStudentPhoto
};
