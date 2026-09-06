// pages/index.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [user, setUser] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [history, setHistory] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Transfer State
  const [transferBank, setTransferBank] = useState('BCA');
  const [transferRek, setTransferRek] = useState('');
  const [transferNama, setTransferNama] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // QRIS State
  const [qrisAmount, setQrisAmount] = useState(50000);
  const [showQRIS, setShowQRIS] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth', {
        action: 'login',
        userData: {
          emailPhone: loginEmail,
          password: loginPassword
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setSaldo(response.data.user.saldo);
        setHistory(response.data.user.history || []);
      }
    } catch (error) {
      alert('Login gagal!');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth', {
        action: 'register',
        userData: {
          name: regName,
          emailPhone: regEmail,
          password: regPassword
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setSaldo(response.data.user.saldo);
        setHistory(response.data.user.history || []);
      }
    } catch (error) {
      alert('Registrasi gagal!');
    }
    setLoading(false);
  };

  const handleTransfer = async () => {
    try {
      const response = await axios.post('/api/transfer', {
        emailPhone: user.emailPhone,
        bank: transferBank,
        rekening: transferRek,
        namaPenerima: transferNama,
        amount: parseInt(transferAmount)
      });

      if (response.data.success) {
        setSaldo(response.data.user.saldo);
        setHistory(response.data.user.history);
        alert('Transfer berhasil!');
        setTransferAmount('');
        setTransferRek('');
        setTransferNama('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Transfer gagal!');
    }
  };

  const handleTopUp = async () => {
    const amount = prompt('Masukkan nominal top up:');
    if (amount && !isNaN(amount)) {
      try {
        const response = await axios.post('/api/update-saldo', {
          emailPhone: user.emailPhone,
          amount: parseInt(amount),
          type: 'credit',
          desc: 'Top Up Saldo'
        });

        if (response.data.success) {
          setSaldo(response.data.user.saldo);
          setHistory(response.data.user.history);
          alert('Top up berhasil!');
        }
      } catch (error) {
        alert('Top up gagal!');
      }
    }
  };

  const handleScanQRIS = async () => {
    const amount = Math.floor(Math.random() * 100000) + 10000;
    try {
      const response = await axios.post('/api/update-saldo', {
        emailPhone: user.emailPhone,
        amount: amount,
        type: 'credit',
        desc: 'Pembayaran QRIS Masuk'
      });

      if (response.data.success) {
        setSaldo(response.data.user.saldo);
        setHistory(response.data.user.history);
        alert(`Pembayaran diterima! Saldo bertambah Rp ${amount.toLocaleString('id-ID')}`);
      }
    } catch (error) {
      alert('Scan QRIS gagal!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {!user ? (
          <div>
            <h1 style={styles.title}>PayGate Pro</h1>
            
            {showLogin ? (
              <div>
                <h2>Login</h2>
                <input
                  style={styles.input}
                  placeholder="Email / No. Telepon"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button style={styles.button} onClick={handleLogin} disabled={loading}>
                  {loading ? 'Loading...' : 'Masuk'}
                </button>
                <button style={styles.buttonSecondary} onClick={() => setShowLogin(false)}>
                  Belum punya akun? Daftar
                </button>
              </div>
            ) : (
              <div>
                <h2>Daftar</h2>
                <input
                  style={styles.input}
                  placeholder="Nama Lengkap"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Email / No. Telepon"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <button style={styles.button} onClick={handleRegister} disabled={loading}>
                  {loading ? 'Loading...' : 'Daftar'}
                </button>
                <button style={styles.buttonSecondary} onClick={() => setShowLogin(true)}>
                  Sudah punya akun? Login
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>PayGate Pro</h1>
              <button style={styles.logoutButton} onClick={() => setUser(null)}>
                Logout
              </button>
            </div>

            <div style={styles.balanceCard}>
              <p style={styles.balanceLabel}>Saldo Anda</p>
              <h2 style={styles.balanceAmount}>
                Rp {saldo.toLocaleString('id-ID')}
              </h2>
              <button style={styles.buttonLight} onClick={handleTopUp}>
                Top Up
              </button>
            </div>

            <div style={styles.grid}>
              <button style={styles.featureButton} onClick={() => setShowQRIS(true)}>
                <span style={styles.featureIcon}>📱</span>
                <span>Buat QRIS</span>
              </button>
              <button style={styles.featureButton} onClick={handleScanQRIS}>
                <span style={styles.featureIcon}>📷</span>
                <span>Scan QRIS</span>
              </button>
            </div>

            <div style={styles.transferSection}>
              <h3>Transfer Bank</h3>
              <select
                style={styles.input}
                value={transferBank}
                onChange={(e) => setTransferBank(e.target.value)}
              >
                <option value="BCA">BCA</option>
                <option value="BRI">BRI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BNI">BNI</option>
                <option value="BSI">BSI</option>
                <option value="CIMB">CIMB Niaga</option>
              </select>
              <input
                style={styles.input}
                placeholder="Nomor Rekening"
                value={transferRek}
                onChange={(e) => setTransferRek(e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="Nama Penerima"
                value={transferNama}
                onChange={(e) => setTransferNama(e.target.value)}
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Nominal"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <button style={styles.button} onClick={handleTransfer}>
                Kirim Transfer
              </button>
            </div>

            {showQRIS && (
              <div style={styles.qrisModal}>
                <div style={styles.qrisContent}>
                  <h3>QRIS Dinamis</h3>
                  <div style={styles.qrisPlaceholder}>
                    <span style={styles.qrisIcon}>🔳</span>
                    <p>Rp {qrisAmount.toLocaleString('id-ID')}</p>
                  </div>
                  <input
                    style={styles.input}
                    type="number"
                    value={qrisAmount}
                    onChange={(e) => setQrisAmount(e.target.value)}
                  />
                  <button style={styles.button} onClick={() => setShowQRIS(false)}>
                    Tutup
                  </button>
                </div>
              </div>
            )}

            <div style={styles.historySection}>
              <h3>Riwayat Transaksi</h3>
              {history.slice().reverse().map((h, index) => (
                <div key={index} style={styles.historyItem}>
                  <div>
                    <strong>{h.desc}</strong>
                    <p style={styles.historyDate}>
                      {new Date(h.date).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span style={h.type === 'credit' ? styles.credit : styles.debit}>
                    {h.type === 'credit' ? '+' : '-'} Rp {h.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: 'white',
    borderRadius: '25px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  },
  title: {
    color: '#667eea',
    marginBottom: '20px',
    fontSize: '28px'
  },
  input: {
    width: '100%',
    padding: '15px',
    marginBottom: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px'
  },
  button: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '12px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  balanceCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '25px',
    color: 'white',
    marginBottom: '25px'
  },
  balanceLabel: {
    fontSize: '14px',
    opacity: '0.9'
  },
  balanceAmount: {
    fontSize: '35px',
    margin: '10px 0'
  },
  buttonLight: {
    padding: '10px 20px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '25px'
  },
  featureButton: {
    padding: '20px',
    background: '#f8f9fa',
    border: '2px solid #e0e0e0',
    borderRadius: '15px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s'
  },
  featureIcon: {
    fontSize: '35px',
    display: 'block',
    marginBottom: '10px'
  },
  transferSection: {
    marginBottom: '25px'
  },
  qrisModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  qrisContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '20px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%'
  },
  qrisPlaceholder: {
    padding: '30px',
    background: '#f8f9fa',
    borderRadius: '15px',
    margin: '20px 0'
  },
  qrisIcon: {
    fontSize: '80px',
    display: 'block'
  },
  historySection: {
    maxHeight: '300px',
    overflowY: 'auto'
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    borderBottom: '1px solid #e0e0e0'
  },
  historyDate: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  credit: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  debit: {
    color: '#dc3545',
    fontWeight: 'bold'
  }
};