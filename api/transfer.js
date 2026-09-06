// pages/api/transfer.js
import { updateUserSaldo } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { emailPhone, bank, rekening, namaPenerima, amount } = req.body;

  // Validasi input
  if (!emailPhone || !bank || !rekening || !namaPenerima || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Data transfer tidak lengkap'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Nominal tidak valid'
    });
  }

  try {
    const desc = `Transfer ke ${bank} - ${namaPenerima} (${rekening})`;
    const result = await updateUserSaldo(emailPhone, amount, 'debit', desc);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Transfer berhasil',
        user: result.user
      });
    }
    
    return res.status(400).json({
      success: false,
      message: result.message
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}