const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, lowercase: true },
  demoUsdt: { type: Number, default: 0 },
  realUsdt: { type: Number, default: 0 },
  demoDeposits: { type: Number, default: 0 },
  realDeposits: { type: Number, default: 0 },
  coins: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const TradeSchema = new mongoose.Schema({
  address: { type: String, required: true, lowercase: true, index: true },
  mode: { type: String, enum: ['DEMO', 'REAL'], required: true },
  side: { type: String, enum: ['buy', 'sell'], required: true },
  pair: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  total: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  time: { type: Date, default: Date.now }
});

const DepositSchema = new mongoose.Schema({
  address: { type: String, required: true, lowercase: true, index: true },
  mode: { type: String, enum: ['DEMO', 'REAL'], required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: 'manual' },
  time: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Trade: mongoose.model('Trade', TradeSchema),
  Deposit: mongoose.model('Deposit', DepositSchema)
};
