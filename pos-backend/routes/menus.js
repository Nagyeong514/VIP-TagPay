const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /menus
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM menus');
        res.json(rows);
    } catch (err) {
        console.error('메뉴 조회 실패:', err);
        res.status(500).json({ error: '메뉴 조회 실패' });
    }
});

module.exports = router;
