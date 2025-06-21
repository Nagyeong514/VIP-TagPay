const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const accountController = require('../controllers/accountController');
const pool = require('../config/db');

// POST /api/user/accounts 계좌 등록
router.post('/accounts', verifyToken, accountController.addAccount);

// GET /api/user/accounts 계좌 목록 조회
router.get('/accounts', verifyToken, async (req, res) => {
  console.log('✅ [BACKEND] /accounts called');
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT bank, account_number FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ 계좌 목록 조회 실패:', err);
    res
      .status(500)
      .json({message: '서버 오류로 인해 계좌를 불러올 수 없습니다.'});
  }
});

// POST /api/user/payment – 결제 정보 저장
router.post('/payment', verifyToken, async (req, res) => {
  const {bank, account_number, amount} = req.body;
  const userId = req.user.id;

  if (!bank || !account_number || !amount) {
    return res.status(400).json({message: '모든 필드를 입력해주세요.'});
  }

  try {
    await pool.query(
      'INSERT INTO payments (user_id, bank, account_number, amount) VALUES (?, ?, ?, ?)',
      [userId, bank, account_number, amount],
    );
    res.json({message: '✅ 결제 정보 저장 완료'});
  } catch (err) {
    console.error('❌ 결제 정보 저장 실패:', err);
    res.status(500).json({message: '서버 오류'});
  }
});

// GET /api/user/payments – 로그인한 유저의 결제 내역 조회
router.get('/payments', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT bank, account_number, amount, paid_at FROM payments WHERE user_id = ? ORDER BY paid_at DESC',
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ 결제 내역 조회 실패:', err);
    res
      .status(500)
      .json({message: '서버 오류로 인해 결제 내역을 불러올 수 없습니다.'});
  }
});

// GET /api/user/profile – 로그인한 유저 정보 조회
router.get('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT name, email, age, created_at FROM users WHERE id = ?',
      [userId],
    );
    if (rows.length === 0)
      return res.status(404).json({message: 'User not found'});
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({message: 'Server error'});
  }
});

module.exports = router;
