// routes/orders.js
const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

//
// POST /orders
//  - 장바구니에 담긴 주문만 추가 (기존 pending 주문은 삭제하지 않음)
//
router.post('/', async (req, res) => {
    const { table_id, items } = req.body; // items: [{ menu_id, quantity }, ...]

    if (!table_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: '잘못된 요청입니다.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 메뉴 가격 조회
        const menuIds = items.map((i) => i.menu_id);
        const placeholders = menuIds.map(() => '?').join(',');
        const [menuRows] = await conn.query(`SELECT id, price FROM menus WHERE id IN (${placeholders})`, menuIds);

        // 가격 매핑
        const priceMap = {};
        menuRows.forEach((row) => {
            priceMap[row.id] = row.price;
        });

        // 주문 삽입
        for (const item of items) {
            const price = priceMap[item.menu_id];
            if (price == null) {
                throw new Error('존재하지 않는 메뉴 아이디: ' + item.menu_id);
            }
            const total_price = price * item.quantity;
            await conn.query(
                'INSERT INTO orders (table_id, menu_id, quantity, total_price, status) VALUES (?, ?, ?, ?, "pending")',
                [table_id, item.menu_id, item.quantity, total_price]
            );
        }

        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        console.error('주문 저장 실패:', err);
        res.status(500).json({ error: '주문 저장 실패' });
    } finally {
        conn.release();
    }
});

//
// POST /payments
//  - 해당 테이블의 pending 주문을 paid로 상태 변경
//
router.post('/payments', async (req, res) => {
    const { table_id, amount } = req.body;
    if (!table_id || amount == null) {
        return res.status(400).json({ error: '잘못된 요청입니다.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // pending 주문을 paid로 변경
        await conn.query('UPDATE orders SET status = "paid" WHERE table_id = ? AND status = "pending"', [table_id]);

        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        console.error('결제 처리 실패:', err);
        res.status(500).json({ error: '결제 처리 실패' });
    } finally {
        conn.release();
    }
});

module.exports = router;
