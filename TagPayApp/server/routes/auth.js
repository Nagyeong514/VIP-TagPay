// server/routes/auth.js

const express = require('express');
const router = express.Router();

const {register, login} = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');
const pool = require('../config/db');

// ✅ 회원가입 - POST /api/auth/register
router.post('/register', register);

// ✅ 로그인 - POST /api/auth/login
router.post('/login', login);

// ✅ 로그인된 사용자 정보 조회 - GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    res.status(200).json(userRows[0]);
  } catch (err) {
    console.error('❌ 사용자 정보 조회 실패:', err);
    res.status(500).json({message: '서버 오류'});
  }
});

module.exports = router;
