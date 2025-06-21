// routes/tables.js
const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

router.get('/status', async (req, res) => {
    const conn = await db.getConnection();
    try {
        const [tables] = await conn.query('SELECT * FROM tables');
        const result = [];

        for (const table of tables) {
            const [orders] = await conn.query(
                `SELECT m.name, o.quantity, o.total_price, o.status 
         FROM orders o 
         JOIN menus m ON o.menu_id = m.id 
         WHERE o.table_id = ?`,
                [table.id]
            );

            const total = orders.reduce((sum, o) => sum + o.total_price, 0);
            const paid = orders.every((o) => o.status === 'paid');

            result.push({
                id: table.id,
                name: table.name,
                total,
                paid,
                items: orders.map((o) => ({
                    name: o.name,
                    price: o.total_price,
                    quantity: o.quantity,
                })),
            });
        }

        res.json({ tables: result }); // ✅ 응답 구조 명시적으로
    } catch (err) {
        console.error('테이블 상태 조회 오류:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        conn.release();
    }
});

// routes/tables.js에 추가

router.post('/reset', async (req, res) => {
    const { table_id } = req.body;
    if (!table_id) {
        return res.status(400).json({ error: 'table_id가 필요합니다.' });
    }

    const conn = await db.getConnection();
    try {
        // orders 테이블에서 해당 테이블의 주문 삭제 또는 상태 초기화
        // 여기서는 주문 상태를 'paid'로 바꾸거나 삭제하는 작업 중 선택 가능
        // 예시로 orders 삭제
        await conn.query('DELETE FROM orders WHERE table_id = ?', [table_id]);

        // 필요하다면 tables 테이블 상태도 초기화 (예: total 0, 상태 변경 등)
        await conn.query('UPDATE tables SET status = "empty" WHERE id = ?', [table_id]);

        res.json({ message: '테이블이 초기화되었습니다.' });
    } catch (err) {
        console.error('테이블 초기화 오류:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        conn.release();
    }
});

module.exports = router;
