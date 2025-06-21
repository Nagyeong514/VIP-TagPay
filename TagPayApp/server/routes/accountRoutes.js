const express = require('express');
const router = express.Router();
const {addAccount, getAccounts} = require('../controllers/accountController');
const authenticate = require('../middlewares/verifyToken');

router.post('/accounts', authenticate, addAccount);
router.get('/accounts', authenticate, getAccounts);

module.exports = router;
