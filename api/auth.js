// pages/api/auth.js
import { readDatabase, writeDatabase, findUser } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { action, userData } = req.body;

  try {
    if (action === 'login') {
      const { emailPhone, password } = userData;
      
      const user = await findUser(emailPhone);
      
      if (user && user.password === password) {
        return res.status(200).json({
          success: true,
          message: 'Login berhasil',
          user: user
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Email/Password salah'
      });
    }
    
    if (action === 'register') {
      const { name, emailPhone, password } = userData;
      
      // Validasi
      if (!name || !emailPhone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap'
        });
      }
      
      // Cek user existing
      const existingUser = await findUser(emailPhone);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email/No. Telepon sudah terdaftar'
        });
      }
      
      // Buat user baru
      const newUser = {
        name: name,
        emailPhone: emailPhone,
        email: emailPhone,
        password: password,
        saldo: 50000,
        history: [{
          type: 'credit',
          desc: 'Bonus Registrasi',
          amount: 50000,
          date: new Date().toISOString()
        }]
      };
      
      // Baca database
      const db = await readDatabase();
      if (!db.success) {
        return res.status(500).json({
          success: false,
          message: 'Database tidak tersedia'
        });
      }
      
      // Tambah user baru
      db.data.users = db.data.users || [];
      db.data.users.push(newUser);
      
      // Simpan ke GitHub
      const result = await writeDatabase(db.data, db.sha);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Registrasi berhasil',
          user: newUser
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Action tidak valid'
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}