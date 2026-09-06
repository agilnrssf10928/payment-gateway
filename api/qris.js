// pages/api/qris.js
import { updateUserSaldo } from '../../lib/github';
import crypto from 'crypto';

// Generate QRIS payload
function generateQRISPayload(amount, userEmail) {
  const timestamp = new Date().toISOString();
  const randomId = crypto.randomBytes(8).toString('hex');
  
  const payload = {
    version: '01',
    type: 'dynamic',
    merchantName: 'PAYGATE PRO',
    merchantId: 'PG-' + randomId,
    userEmail: userEmail,
    amount: amount,
    timestamp: timestamp,
    qrisId: 'QRIS-' + randomId.toUpperCase()
  };
  
  return payload;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, emailPhone, amount, qrisCode } = req.body;
    
    try {
      if (action === 'generate') {
        // Generate QRIS untuk pembayaran
        const payload = generateQRISPayload(amount, emailPhone);
        
        return res.status(200).json({
          success: true,
          qrisData: payload,
          message: 'QRIS berhasil dibuat'
        });
      }
      
      if (action === 'scan') {
        // Proses scan QRIS (pembayaran masuk)
        const receivedAmount = amount || Math.floor(Math.random() * 100000) + 10000;
        const desc = 'Pembayaran QRIS Masuk';
        
        const result = await updateUserSaldo(emailPhone, receivedAmount, 'credit', desc);
        
        if (result.success) {
          return res.status(200).json({
            success: true,
            message: 'Pembayaran diterima',
            amount: receivedAmount,
            user: result.user
          });
        }
        
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Action tidak valid'
      });
      
    } catch (error) {
      console.error('QRIS error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}