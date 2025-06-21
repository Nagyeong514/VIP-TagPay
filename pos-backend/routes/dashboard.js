// routes/dashboard.js (또는 routes/index.js 등)
const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

router.get('/dashboard-summary', async (req, res) => {
    const conn = await db.getConnection();
    try {
        const [rows] = await conn.query(`
      SELECT 
        COALESCE(SUM(amount), 0) AS totalSales,
        COUNT(*) AS todayCount
      FROM payment_sessions
      WHERE status = 'paid' AND DATE(created_at) = CURDATE()
    `);

        res.json(rows[0]);
    } catch (err) {
        console.error('대시보드 조회 오류:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        conn.release();
    }
});

module.exports = router;
