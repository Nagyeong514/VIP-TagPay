// server/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

exports.register = async (req, res) => {
  const {name, age, email, password} = req.body;
  if (!name || !age || !email || !password) {
    return res.status(400).json({message: '모든 필드를 입력해주세요.'});
  }

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(409).json({message: '이미 가입된 이메일입니다.'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, age, email, password) VALUES (?, ?, ?, ?)',
      [name, age, email, hashedPassword],
    );

    res.status(201).json({message: '회원가입 성공'});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: '서버 오류'});
  }
};

exports.login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return res
        .status(401)
        .json({message: '이메일 또는 비밀번호가 잘못되었습니다.'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({message: '이메일 또는 비밀번호가 잘못되었습니다.'});
    }

    const token = jwt.sign(
      {id: user.id, email: user.email},
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    res.status(200).json({token});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: '서버 오류'});
  }
};
