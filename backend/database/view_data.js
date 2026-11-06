const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function viewData() {
  console.log('\n======================================================');
  console.log('   INTELLIGENT WORKFLOW AUTOMATION - DATABASE VIEWER');
  console.log('======================================================\n');
  console.log(`Connecting to MySQL at ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3307} (${process.env.DB_NAME || 'workflow_automation_db'})...\n`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3307,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'workflow_automation_db'
    });

    console.log('✅ Connected successfully!\n');

    // 1. Permission Requests Summary
    console.log('--- [1] RECENT STUDENT PERMISSION REQUESTS ---');
    const [requests] = await connection.query(`
      SELECT 
        pr.request_id,
        pr.request_code,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        pr.request_type,
        pr.overall_status,
        DATE_FORMAT(pr.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(pr.end_date, '%Y-%m-%d') AS end_date,
        uo.name AS assigned_office
      FROM permission_requests pr
      JOIN users u ON pr.student_user_id = u.user_id
      LEFT JOIN application_office_assignments aoa ON pr.request_id = aoa.request_id
      LEFT JOIN university_offices uo ON aoa.office_id = uo.office_id
      ORDER BY pr.request_id DESC
      LIMIT 10;
    `);
    console.table(requests);

    // 2. Users and Roles
    console.log('\n--- [2] REGISTERED USERS & ROLES ---');
    const [users] = await connection.query(`
      SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        u.role,
        s.registration_number,
        d.name AS department
      FROM users u
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      ORDER BY u.user_id ASC
      LIMIT 10;
    `);
    console.table(users);

    // 3. University Offices and Applications Count
    console.log('\n--- [3] UNIVERSITY ADMINISTRATIVE OFFICES ---');
    const [offices] = await connection.query(`
      SELECT 
        office_id,
        code,
        name,
        category,
        responsible_officer,
        contact_phone
      FROM university_offices
      ORDER BY office_id ASC;
    `);
    console.table(offices);

    // 4. Counts by Status
    console.log('\n--- [4] REQUEST STATUS TOTALS ---');
    const [statusCounts] = await connection.query(`
      SELECT 
        overall_status AS status,
        COUNT(*) AS count
      FROM permission_requests
      GROUP BY overall_status;
    `);
    console.table(statusCounts);

    console.log('\n======================================================');
    console.log('Database inspection finished.');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    console.log('\nPlease check your backend/.env settings:');
    console.log('- DB_HOST=' + (process.env.DB_HOST || '127.0.0.1'));
    console.log('- DB_PORT=' + (process.env.DB_PORT || '3307'));
    console.log('- DB_USER=' + (process.env.DB_USER || 'root'));
    console.log('- DB_PASSWORD=' + (process.env.DB_PASSWORD ? '********' : '(empty)'));
    console.log('- DB_NAME=' + (process.env.DB_NAME || 'workflow_automation_db'));
  } finally {
    if (connection) await connection.end();
  }
}

viewData();
