const db = require('../config/db');

// POST /api/user/accounts
const addAccount = async (req, res) => {
  const {bank, account_number, pin} = req.body;
  const user_id = req.user.id;

  try {
    const sql =
      'INSERT INTO accounts (user_id, bank, account_number, pin) VALUES (?, ?, ?, ?)';
    await db.query(sql, [user_id, bank, account_number, pin]);
    res.status(201).json({message: '계좌 등록 완료'});
  } catch (err) {
    console.error('❌ 계좌 등록 오류:', err);
    res.status(500).json({error: '계좌 등록 실패'});
  }
};

// GET /api/user/accounts
const getAccounts = async (req, res) => {
  const user_id = req.user.id;

  try {
    const sql =
      'SELECT bank, account_number, created_at FROM accounts WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [user_id]);
    res.json(rows);
  } catch (err) {
    console.error('❌ 계좌 불러오기 오류:', err);
    res.status(500).json({error: '계좌 불러오기 실패'});
  }
};

module.exports = {
  addAccount,
  getAccounts,
};
