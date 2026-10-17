import React, { useState, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import healLogo from './heal-logo.png';
import { compressImageFile } from './utils/imageCompressor';
import { loginWithGoogle, startInstagramLogin } from './utils/socialAuthHeal';
import {
  Eye,
  EyeOff,
  Camera,
  ArrowLeft,
  User,
  School,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  // Mode tampilan: 'login', 'register', 'forgot'
  const [mode, setMode] = useState('login');

  // Input Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Input Register
  const [regNamaLengkap, setRegNamaLengkap] = useState('');
  const [regNamaPanggilan, setRegNamaPanggilan] = useState('');
  const [regSekolahAsal, setRegSekolahAsal] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Input Lupa Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSekolahAsal, setForgotSekolahAsal] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // State umum
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Hitung kekuatan password (0–3)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Kosong', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 3) return { score: 3, text: 'Sangat Kuat', color: 'bg-emerald-500' };
    if (score === 2) return { score: 2, text: 'Cukup Kuat', color: 'bg-yellow-400' };
    return { score: 1, text: 'Lemah (min 6 karakter)', color: 'bg-red-400' };
  };

  const regPwStrength = useMemo(() => calculatePasswordStrength(regPassword), [regPassword]);
  const forgotPwStrength = useMemo(() => calculatePasswordStrength(forgotNewPass), [forgotNewPass]);

  // Validasi kecocokan password register
  const isRegPasswordMatch = useMemo(() => {
    if (!regConfirmPass) return false;
    return regPassword === regConfirmPass;
  }, [regPassword, regConfirmPass]);

  // Validasi form register aktif
  const isRegFormValid = useMemo(() => {
    return (
      regNamaLengkap.trim().length > 0 &&
      regNamaPanggilan.trim().length > 0 &&
      regSekolahAsal.trim().length > 0 &&
      regPassword.length >= 6 &&
      isRegPasswordMatch
    );
  }, [regNamaLengkap, regNamaPanggilan, regSekolahAsal, regPassword, isRegPasswordMatch]);

  // Handle pilih & kompres foto profil
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file, 300, 300, 0.75);
      setAvatarPreview(compressedDataUrl);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Gagal memproses foto. Pastikan format file gambar valid.');
    }
  };

  // Simpan data & selesaikan login
  const completeLoginSession = (usernameClean, profileData) => {
    localStorage.setItem('heal_active_user', usernameClean);
    localStorage.setItem('heal_user_data', JSON.stringify(profileData));
    onLogin(usernameClean);
  };

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    const idInput = loginIdentifier.trim().toLowerCase();
    const passInput = loginPassword;

    if (!idInput || !passInput) {
      setErrorMsg('Nama panggilan/username dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      // 1. Cari dokumen data_login
      const docRef = doc(db, 'data_login', idInput);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.password && data.password !== passInput) {
          setErrorMsg('Password salah! Periksa kembali password kamu.');
          setLoading(false);
          return;
        }
        completeLoginSession(data.username || idInput, data);
      } else {
        // Fallback: periksa apakah login menggunakan Nama Lengkap
        setErrorMsg('Akun tidak ditemukan. Silakan periksa kembali atau Buat Akun Baru.');
      }
    } catch (err) {
      console.error('Error saat login:', err);
      setErrorMsg('Gagal terhubung ke database. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Register
  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!isRegFormValid) {
      if (!isRegPasswordMatch && regConfirmPass) {
        setErrorMsg('Konfirmasi password tidak cocok');
      } else if (regPassword.length < 6) {
        setErrorMsg('Password minimal 6 karakter');
      } else {
        setErrorMsg('Harap lengkapi semua kolom pendaftaran');
      }
      return;
    }

    const cleanUsername = regNamaPanggilan.trim().toLowerCase().replace(/\s+/g, '');
    setLoading(true);

    try {
      const userRef = doc(db, 'data_login', cleanUsername);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setErrorMsg(`Nama panggilan "${regNamaPanggilan}" sudah terdaftar. Silakan pilih variasi lain.`);
        setLoading(false);
        return;
      }

      const newUserData = {
        username: cleanUsername,
        nama_lengkap: regNamaLengkap.trim(),
        nama_panggilan: regNamaPanggilan.trim(),
        sekolah_asal: regSekolahAsal.trim(),
        password: regPassword,
        avatar: avatarPreview || '🌸',
        bio: 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
        metode_login: 'Registrasi Form',
        waktu_akses: new Date().toLocaleString('id-ID'),
        perangkat: navigator.userAgent,
      };

      await setDoc(userRef, newUserData);
      completeLoginSession(cleanUsername, newUserData);
    } catch (err) {
      console.error('Error saat register:', err);
      setErrorMsg('Gagal membuat akun baru. Pastikan koneksi internet aktif.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Lupa Password
  const handleForgotSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const cleanId = forgotIdentifier.trim().toLowerCase().replace(/\s+/g, '');
    const schoolInput = forgotSekolahAsal.trim().toLowerCase();

    if (!cleanId || !schoolInput || !forgotNewPass || !forgotConfirmPass) {
      setErrorMsg('Lengkapi seluruh kolom verifikasi dan password baru');
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      setErrorMsg('Konfirmasi password baru tidak cocok');
      return;
    }

    if (forgotNewPass.length < 6) {
      setErrorMsg('Password baru minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'data_login', cleanId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setErrorMsg(`Akun dengan nama panggilan "${forgotIdentifier}" tidak ditemukan.`);
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const storedSchool = (userData.sekolah_asal || '').trim().toLowerCase();

      // Verifikasi kesesuaian sekolah
      if (storedSchool && storedSchool !== schoolInput) {
        setErrorMsg('Data Sekolah Asal tidak cocok dengan profil akun yang terdaftar.');
        setLoading(false);
        return;
      }

      // Update password baru di Firestore
      await updateDoc(userRef, {
        password: forgotNewPass,
        terakhir_reset_pass: new Date().toLocaleString('id-ID'),
      });

      setForgotSuccess(true);
    } catch (err) {
      console.error('Error saat reset password:', err);
      setErrorMsg('Gagal memproses reset password. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Social Logins
  const handleSocialGoogle = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const profile = await loginWithGoogle();
      if (!profile || !profile.displayName) return;

      const cleanUname = (profile.displayName.split(' ')[0] || 'user').toLowerCase().replace(/\s+/g, '');
      const userRef = doc(db, 'data_login', cleanUname);
      const userSnap = await getDoc(userRef);

      let savedData;
      if (userSnap.exists()) {
        savedData = userSnap.data();
      } else {
        savedData = {
          username: cleanUname,
          nama_lengkap: profile.displayName,
          nama_panggilan: cleanUname,
          sekolah_asal: 'Umum / Lainnya',
          password: 'auth_google_secure',
          avatar: profile.photoURL || '🌸',
          bio: 'Menjaga kesehatan fisik dan mental setiap hari. 🌸',
          metode_login: 'Google Sign-In',
          waktu_akses: new Date().toLocaleString('id-ID'),
          perangkat: navigator.userAgent,
        };
        await setDoc(userRef, savedData);
      }

      completeLoginSession(cleanUname, savedData);
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setErrorMsg('Gagal masuk dengan Google. Pastikan izin popup atau koneksi internet stabil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialInstagram = async () => {
    setErrorMsg('');
    try {
      await startInstagramLogin();
    } catch (err) {
      setErrorMsg(err.message || 'Instagram Login belum dikonfigurasi sepenuhnya');
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-200 via-rose-100 to-yellow-100 transition-all duration-300">
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* 1. VIEW LOGIN                                            */}
      {/* ───────────────────────────────────────────────────────── */}
      {mode === 'login' && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-fadeIn">
          {/* Header Brand */}
          <div className="text-center mb-5">
            <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-xl mx-auto mb-3 flex items-center justify-center bg-white border-4 border-white/80 hover:scale-105 transition-transform">
              <img src={healLogo} alt="Logo HEAL" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black text-pink-500 drop-shadow-sm tracking-wide">HEAL</h1>
            <p className="text-[11px] text-gray-500 font-bold tracking-wider uppercase mt-0.5">
              Healthy • Empowered • Aware • Limitless
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 w-full space-y-4 border border-white/60">
            <h2 className="text-lg font-bold text-gray-800 text-center">Masuk ke Akun</h2>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" /> Nama Panggilan / Username
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Contoh: Riyu"
                  className="w-full border-2 border-gray-100 bg-gray-50/80 p-3 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-pink-500" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-bold text-pink-500 hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full border-2 border-gray-100 bg-gray-50/80 p-3 pr-11 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-md hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">atau</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Tombol Social OAuth */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSocialGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-98 transition-all text-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Lanjutkan dengan Google
              </button>

              <button
                type="button"
                onClick={handleSocialInstagram}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold text-white bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-sm hover:opacity-95 active:scale-98 transition-all text-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                Lanjutkan dengan Instagram
              </button>
            </div>

            {/* Link ke Registrasi */}
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-extrabold text-pink-500 hover:underline"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 2. VIEW REGISTER (BUAT AKUN)                             */}
      {/* ───────────────────────────────────────────────────────── */}
      {mode === 'register' && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-fadeIn py-4">
          <div className="w-full mb-3 flex items-center">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 text-pink-500" /> Kembali ke Masuk
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 w-full space-y-4 border border-white/60">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">Buat Akun HEAL</h2>
              <p className="text-xs text-gray-500 mt-0.5">Lengkapi profil Anda untuk mulai hidup sehat</p>
            </div>

            {/* Profile Avatar Upload */}
            <div className="flex flex-col items-center justify-center pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group focus:outline-none"
                title="Pilih Foto Profil"
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-pink-300 bg-pink-50 shadow-md transition-all group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-pink-400">
                      <Camera className="w-7 h-7 mb-0.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Foto Profil</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1.5 rounded-full shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </button>
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium">
                {avatarPreview ? 'Foto berhasil dipilih (klik untuk ganti)' : 'Klik untuk mengunggah foto profil (opsional)'}
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={regNamaLengkap}
                  onChange={(e) => setRegNamaLengkap(e.target.value)}
                  placeholder="Contoh : Riyu Buyung"
                  className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                  autoCapitalize="words"
                />
              </div>

              {/* Nama Panggilan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" /> Nama Panggilan (Username)
                </label>
                <input
                  type="text"
                  value={regNamaPanggilan}
                  onChange={(e) => setRegNamaPanggilan(e.target.value)}
                  placeholder="Contoh : Riyu"
                  className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                  autoCapitalize="none"
                />
              </div>

              {/* Sekolah Asal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-pink-500" /> Sekolah Asal
                </label>
                <input
                  type="text"
                  value={regSekolahAsal}
                  onChange={(e) => setRegSekolahAsal(e.target.value)}
                  placeholder="Contoh : SMAN 4 Bojonegoro"
                  className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-500" /> Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 pr-11 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength Bar */}
                {regPassword && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 flex gap-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full flex-1 ${regPwStrength.score >= 1 ? regPwStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${regPwStrength.score >= 2 ? regPwStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${regPwStrength.score >= 3 ? regPwStrength.color : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{regPwStrength.text}</span>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-pink-500" /> Konfirmasi Password
                  </label>
                  {regConfirmPass && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${
                      isRegPasswordMatch ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {isRegPasswordMatch ? <><CheckCircle2 className="w-3 h-3" /> Cocok</> : 'Belum cocok'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showRegConfirmPass ? 'text' : 'password'}
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                    placeholder="Ulangi password..."
                    className={`w-full border-2 bg-gray-50/80 p-2.5 pr-11 rounded-2xl outline-none text-sm transition-all ${
                      regConfirmPass && !isRegPasswordMatch
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-100 focus:border-pink-400 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showRegConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isRegFormValid}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all mt-2 ${
                  isRegFormValid && !loading
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-95 active:scale-98 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 3. VIEW LUPA PASSWORD                                     */}
      {/* ───────────────────────────────────────────────────────── */}
      {mode === 'forgot' && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center animate-fadeIn py-4">
          <div className="w-full mb-3 flex items-center">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setForgotSuccess(false);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 text-pink-500" /> Kembali ke Masuk
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 w-full space-y-4 border border-white/60">
            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Password Berhasil Direset!</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Password akun kamu telah berhasil diperbarui. Silakan masuk kembali dengan password baru.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotSuccess(false);
                    setErrorMsg('');
                  }}
                  className="w-full bg-pink-500 text-white font-bold py-3 rounded-2xl shadow-md hover:bg-pink-600 transition-all text-xs"
                >
                  Masuk Sekarang
                </button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">Lupa Password?</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verifikasi nama panggilan dan sekolah asal kamu untuk mengatur ulang password.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-500" /> Nama Panggilan / Username
                    </label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="Contoh : Riyu"
                      className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-pink-500" /> Sekolah Asal
                    </label>
                    <input
                      type="text"
                      value={forgotSekolahAsal}
                      onChange={(e) => setForgotSekolahAsal(e.target.value)}
                      placeholder="Contoh : SMAN 4 Bojonegoro"
                      className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-pink-500" /> Password Baru
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showForgotPass ? 'text' : 'password'}
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 pr-11 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass(!showForgotPass)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showForgotPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-pink-500" /> Konfirmasi Password Baru
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showForgotConfirmPass ? 'text' : 'password'}
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        placeholder="Ulangi password baru..."
                        className="w-full border-2 border-gray-100 bg-gray-50/80 p-2.5 pr-11 rounded-2xl outline-none focus:border-pink-400 focus:bg-white text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {showForgotConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-md hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 text-sm mt-2"
                  >
                    {loading ? 'Memverifikasi...' : 'Atur Ulang Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}