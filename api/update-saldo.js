// pages/api/update-saldo.js
import { readDatabase, writeDatabase } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emailPhone, amount, type, desc } = req.body;
    const db = await readDatabase();
    
    const userIndex = db.users.findIndex(u => u.emailPhone === emailPhone);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = db.users[userIndex];
    
    if (type === 'credit') {
      user.saldo += amount;
    } else if (type === 'debit') {
      if (user.saldo < amount) {
        return res.status(400).json({ success: false, message: 'Saldo tidak cukup' });
      }
      user.saldo -= amount;
    }

    user.history = user.history || [];
    user.history.push({
      type,
      desc,
      amount,
      date: new Date().toISOString()
    });

    db.users[userIndex] = user;
    const result = await writeDatabase(db);
    
    if (result.success) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(500).json({ success: false, message: 'Gagal update database' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}