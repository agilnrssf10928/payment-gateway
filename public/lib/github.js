// lib/github.js
import { Octokit } from '@octokit/rest';

// Inisialisasi Octokit dengan token dari environment variable
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Konfigurasi GitHub
const GITHUB_CONFIG = {
  owner: process.env.GITHUB_OWNER || 'agilnrssf10928',
  repo: process.env.GITHUB_REPO || 'PAYMENT-',
  path: process.env.GITHUB_FILE_PATH || 'database.json',
  branch: process.env.GITHUB_BRANCH || 'main'
};

/**
 * Membaca database dari GitHub
 * @returns {Promise<Object>} Database object
 */
export async function readDatabase() {
  try {
    const response = await octokit.repos.getContent({
      owner: GITHUB_CONFIG.owner,
      repo: GITHUB_CONFIG.repo,
      path: GITHUB_CONFIG.path,
      ref: GITHUB_CONFIG.branch
    });

    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const data = JSON.parse(content);
    
    return {
      success: true,
      data: data,
      sha: response.data.sha
    };
  } catch (error) {
    console.error('Error membaca database:', error.message);
    return {
      success: false,
      error: error.message,
      data: { users: [] },
      sha: null
    };
  }
}

/**
 * Menulis database ke GitHub
 * @param {Object} data - Data yang akan disimpan
 * @param {string} sha - SHA file (opsional, untuk update)
 * @returns {Promise<Object>} Hasil operasi
 */
export async function writeDatabase(data, sha = null) {
  try {
    // Jika SHA tidak diberikan, ambil dari file existing
    if (!sha) {
      const currentFile = await readDatabase();
      if (currentFile.success && currentFile.sha) {
        sha = currentFile.sha;
      } else {
        throw new Error('Tidak bisa mendapatkan SHA file');
      }
    }

    // Convert data ke base64
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    // Update file di GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_CONFIG.owner,
      repo: GITHUB_CONFIG.repo,
      path: GITHUB_CONFIG.path,
      message: `Update database - ${new Date().toISOString()}`,
      content: content,
      sha: sha,
      branch: GITHUB_CONFIG.branch
    });

    return {
      success: true,
      data: response.data,
      message: 'Database berhasil diupdate'
    };
  } catch (error) {
    console.error('Error menulis database:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Gagal mengupdate database'
    };
  }
}

/**
 * Mencari user berdasarkan email/phone
 * @param {string} identifier - Email atau nomor telepon
 * @returns {Object|null} User object atau null
 */
export async function findUser(identifier) {
  const db = await readDatabase();
  if (!db.success) return null;
  
  const users = db.data.users || [];
  return users.find(u => 
    u.emailPhone === identifier || 
    u.email === identifier
  ) || null;
}

/**
 * Update saldo user
 * @param {string} identifier - Email/phone user
 * @param {number} amount - Jumlah perubahan
 * @param {string} type - 'credit' atau 'debit'
 * @param {string} desc - Deskripsi transaksi
 * @returns {Promise<Object>} Hasil operasi
 */
export async function updateUserSaldo(identifier, amount, type, desc) {
  const db = await readDatabase();
  if (!db.success) {
    return { success: false, message: 'Database tidak tersedia' };
  }

  const users = db.data.users || [];
  const userIndex = users.findIndex(u => 
    u.emailPhone === identifier || u.email === identifier
  );

  if (userIndex === -1) {
    return { success: false, message: 'User tidak ditemukan' };
  }

  const user = users[userIndex];
  
  // Update saldo
  if (type === 'credit') {
    user.saldo = (user.saldo || 0) + amount;
  } else if (type === 'debit') {
    if ((user.saldo || 0) < amount) {
      return { success: false, message: 'Saldo tidak mencukupi' };
    }
    user.saldo = (user.saldo || 0) - amount;
  }

  // Tambahkan history
  user.history = user.history || [];
  user.history.push({
    type: type,
    desc: desc,
    amount: amount,
    date: new Date().toISOString()
  });

  // Update user di array
  users[userIndex] = user;
  db.data.users = users;

  // Simpan ke GitHub
  const result = await writeDatabase(db.data, db.sha);
  
  if (result.success) {
    return {
      success: true,
      user: user,
      message: 'Saldo berhasil diupdate'
    };
  }

  return {
    success: false,
    message: result.message
  };
}