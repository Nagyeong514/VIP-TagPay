// routes/paymentSessions.js

const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// 결제 기록
router.post('/pay', async (req, res) => {
    const { table_id, amount, owner_bank, owner_account, customer_bank, customer_account } = req.body;

    if (!table_id || !amount || !owner_bank || !owner_account || !customer_bank || !customer_account) {
        return res.status(400).json({ error: '필수 항목 누락' });
    }

    const conn = await db.getConnection();
    try {
        await conn.query(
            `INSERT INTO payment_sessions 
        (table_id, amount, owner_bank, owner_account, customer_bank, customer_account, status)
       VALUES (?, ?, ?, ?, ?, ?, 'paid')`,
            [table_id, amount, owner_bank, owner_account, customer_bank, customer_account]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('결제 기록 실패:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        conn.release();
    }
});

// 오늘 날짜 결제 요약 (매출합 + 건수)
router.get('/summary', async (req, res) => {
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
        console.error('결제 요약 오류:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        conn.release();
    }
});

module.exports = router;
