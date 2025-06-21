const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// NFC 기록 완료 처리
router.post('/nfc-written', async (req, res) => {
    const { table_id } = req.body;
    if (!table_id) {
        return res.status(400).json({ error: '테이블 ID 누락' });
    }

    const conn = await db.getConnection();
    try {
        await conn.query('UPDATE tables SET nfc_written = 1 WHERE id = ?', [table_id]);
        res.json({ success: true, message: 'NFC 기록 상태 저장 완료' });
    } catch (err) {
        console.error('[NFC 기록 DB 오류]:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        conn.release();
    }
});

module.exports = router;
