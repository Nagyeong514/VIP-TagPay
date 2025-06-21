// server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

console.log('✅ user.js 라우터 로드됨');

app.use(cors());
app.use(express.json());

// ✅ 라우터 등록
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ✅ IP 바인딩: '0.0.0.0' 추가!!!
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on localhost:${PORT}`);
  console.log(
    `🌐 외부에서 접속하려면: ngrok 주소를 확인해서 프론트에 입력해라 다시 했으면 그거 뭐야 다시 고쳐놔`,
  );
});
