// pages/api/topup.js
import { updateUserSaldo } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { emailPhone, amount } = req.body;

  if (!emailPhone || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Data top up tidak valid'
    });
  }

  try {
    const result = await updateUserSaldo(emailPhone, amount, 'credit', 'Top Up Saldo');
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Top up berhasil',
        user: result.user
      });
    }
    
    return res.status(400).json({
      success: false,
      message: result.message
    });
    
  } catch (error) {
    console.error('Top up error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}