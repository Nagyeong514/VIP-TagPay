var express = require('express');
var router = express.Router();
const db = require('../database/db_connect');

// GET /api/tables
router.get('/api/tables', async (req, res) => {
    const sql = `
    SELECT
      t.id,
      t.name,
      COALESCE(SUM(CASE WHEN o.status = 'pending' THEN o.total_price ELSE 0 END), 0) AS total,
      CASE
        WHEN EXISTS (SELECT 1 FROM orders o2 WHERE o2.table_id = t.id AND o2.status = 'pending') THEN 'pending'
        WHEN EXISTS (SELECT 1 FROM orders o3 WHERE o3.table_id = t.id AND o3.status = 'paid') THEN 'paid'
        ELSE 'empty'
      END AS status
    FROM tables t
    LEFT JOIN orders o ON t.id = o.table_id
    GROUP BY t.id, t.name
  `;

    try {
        const [results] = await db.query(sql);
        res.json({ tables: results });
    } catch (err) {
        console.error('DB 조회 오류:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/tables/:id/select
router.post('/api/tables/:id/select', (req, res) => {
    const tableId = req.params.id;
    const sql = `
    INSERT INTO orders (table_id, menu_id, quantity, total_price, status)
    VALUES (?, 1, 1, 0, 'pending')
  `;
    db.query(sql, [tableId], (err, results) => {
        if (err) {
            console.error('DB 주문 생성 오류:', err);
            return res.status(500).send('DB 오류');
        }
        res.json({ success: true });
    });
});

module.exports = router;
