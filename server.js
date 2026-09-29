require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { User, Trade, Deposit } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

app.post('/api/user/register', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });
    let user = await User.findOne({ address: address.toLowerCase() });
    if (!user) user = await User.create({ address: address.toLowerCase() });
    res.json({ ok: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/user/:address', async (req, res) => {
  try {
    const user = await User.findOne({ address: req.params.address.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deposit', async (req, res) => {
  try {
    const { address, mode, amount, type } = req.body;
    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (mode === 'DEMO') { user.demoUsdt += amount; user.demoDeposits += amount; }
    else { user.realUsdt += amount; user.realDeposits += amount; }
    await user.save();
    await Deposit.create({ address: address.toLowerCase(), mode, amount, type: type || 'manual' });
    res.json({ ok: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/trade', async (req, res) => {
  try {
    const { address, mode, side, pair, price, amount, total, fee } = req.body;
    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const base = pair.split('/')[0];
    if (!user.coins[base]) user.coins[base] = { demo: 0, real: 0 };
    const balKey = mode === 'DEMO' ? 'demoUsdt' : 'realUsdt';
    const coinKey = mode === 'DEMO' ? 'demo' : 'real';
    if (side === 'buy') {
      if (user[balKey] < total + fee) return res.status(400).json({ error: 'Insufficient' });
      user[balKey] -= (total + fee);
      user.coins[base][coinKey] += amount;
    } else {
      if (user.coins[base][coinKey] < amount) return res.status(400).json({ error: 'Insufficient coin' });
      user.coins[base][coinKey] -= amount;
      user[balKey] += (total - fee);
    }
    user.markModified('coins');
    await user.save();
    const trade = await Trade.create({ address: address.toLowerCase(), mode, side, pair, price, amount, total, fee });
    res.json({ ok: true, user, trade });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/trades/:address', async (req, res) => {
  try {
    const { mode, range } = req.query;
    const filter = { address: req.params.address.toLowerCase() };
    if (mode) filter.mode = mode;
    const now = new Date();
    if (range === 'today') filter.time = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    else if (range === 'week') filter.time = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    else if (range === 'month') filter.time = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    const trades = await Trade.find(filter).sort({ time: -1 }).limit(200);
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));
});

app.get('/', (req, res) => res.json({ status: 'CryptoHub API running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
