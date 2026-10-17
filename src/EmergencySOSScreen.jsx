import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { triggerFeedback } from './utils/feedback';
import { openExternalUrl } from './utils/openExternalUrl';
import { 
  Phone, AlertTriangle, MapPin, Send, Copy, Check, 
  RefreshCw, Navigation, ShieldAlert, ArrowLeft, HeartPulse, ExternalLink
} from 'lucide-react';

export default function EmergencySOSScreen({ currentUser, onBack, isDarkMode }) {
  // Profil Pelapor / Pasien (diambil otomatis dari data_login)
  const [profile, setProfile] = useState({
    nama: '',
    noHp: '',
    sekolah: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit / Override Data Pelapor jika darurat untuk orang lain
  const [customNama, setCustomNama] = useState('');
  const [customNoHp, setCustomNoHp] = useState('');
  const [customSekolah, setCustomSekolah] = useState('');
  const [showEditData, setShowEditData] = useState(false);

  // Pilihan Cepat Kondisi Darurat
  const kondisiOptions = [
    'Gawat Darurat Medis / Butuh Evakuasi Ambulans',
    'Kecelakaan Lalu Lintas / Trauma Fisik Berat',
    'Serangan Jantung / Nyeri Dada / Sesak Napas Berat',
    'Penurunan Kesadaran / Koma / Pingsan',
    'Pendarahan Hebat / Cedera Tulang Serius',
    'Krisis Psikiatri / Darurat Mental Ekstrem',
    'Lainnya (Ketik Kondisi Sendiri)'
  ];
  const [selectedKondisi, setSelectedKondisi] = useState(kondisiOptions[0]);
  const [customKondisiText, setCustomKondisiText] = useState('');

  // GPS Lokasi & Loading State Cepat
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'denied' | 'error'
  const [gpsCoords, setGpsCoords] = useState({ lat: null, lng: null, accuracy: null });
  const [gpsAddressHint, setGpsAddressHint] = useState('');
  const [isLocating, setIsLocating] = useState(false); // Loading state singkat saat tombol diklik

  // Nomor Hotline PSC 119 (WhatsApp Nasional PSC 119 Kemenkes RI)
  const [hotlineWhatsApp, setHotlineWhatsApp] = useState('6281132277119');
  const [copied, setCopied] = useState(false);

  // 1. Ambil data profil user saat login
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingProfile(true);
      try {
        const activeUser = currentUser || localStorage.getItem('heal_active_user');
        if (activeUser) {
          const docRef = doc(db, 'data_login', activeUser);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            const nama = data.nama_lengkap || data.namaLengkap || activeUser;
            const noHp = data.no_hp || data.noHp || data.noWhatsapp || '';
            const sekolah = data.sekolah_asal || data.sekolahAsal || '';
            
            setProfile({ nama, noHp, sekolah });
            setCustomNama(nama);
            setCustomNoHp(noHp);
            setCustomSekolah(sekolah);
          } else {
            setProfile({ nama: activeUser, noHp: '', sekolah: '' });
            setCustomNama(activeUser);
          }
        } else {
          setProfile({ nama: 'Pengguna HEAL', noHp: '', sekolah: '' });
          setCustomNama('Pengguna HEAL');
        }
      } catch (err) {
        console.error("Gagal mengambil data profil darurat:", err);
        setProfile({ nama: 'Pengguna HEAL', noHp: '', sekolah: '' });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // 2. Ambil Geolocation GPS awal saat layar dibuka (timeout 4000ms)
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setGpsStatus('success');
      },
      (err) => {
        console.warn("Akses GPS ditolak / error / timeout:", err);
        setGpsStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    requestGpsLocation();
  }, []);

  // Format Nilai Akhir
  const getFinalNama = () => (customNama.trim() || profile.nama || 'Pengguna HEAL');
  const getFinalNoHp = () => (customNoHp.trim() || profile.noHp || '-');
  const getFinalSekolah = () => (customSekolah.trim() || profile.sekolah || '-');
  const getFinalKondisi = () => {
    if (selectedKondisi === 'Lainnya (Ketik Kondisi Sendiri)') {
      return customKondisiText.trim() || 'Gawat Darurat Medis / Butuh Evakuasi Ambulans';
    }
    return selectedKondisi;
  };

  // Helper Lokasi Fallback Resmi
  const getFallbackLocationText = () => {
    const baseFallback = 'Mohon pandu konfirmasi lokasi saya (GPS tidak aktif/terhalang)';
    return gpsAddressHint.trim() ? `${baseFallback} (Patokan: ${gpsAddressHint.trim()})` : baseFallback;
  };

  const getPreviewLocation = () => {
    if (gpsStatus === 'success' && gpsCoords.lat !== null && gpsCoords.lng !== null) {
      const link = `https://www.google.com/maps?q=${gpsCoords.lat.toFixed(6)},${gpsCoords.lng.toFixed(6)}`;
      return gpsAddressHint.trim() ? `${link} (Patokan: ${gpsAddressHint.trim()})` : link;
    }
    return getFallbackLocationText();
  };

  // 3. Format Template Pesan Resmi PSC 119
  const buildReport = (locationString) => {
    return `🚨 *LAPORAN DARURAT MEDIS - PSC 119 (via Aplikasi HEAL)* 🚨

Halo Petugas PSC 119, saya membutuhkan bantuan pengiriman *AMBULANS SEGERA*.

*Data Pelapor / Pasien:*
• Nama: ${getFinalNama()}
• No. HP: ${getFinalNoHp()}
• Asal/Instansi: ${getFinalSekolah()}

*Detail Kondisi Darurat:*
• Jenis Kondisi: ${getFinalKondisi()}
• Titik Lokasi Penjemputan (GPS): ${locationString}

Mohon tindak lanjut dan pengiriman unit ambulans ke lokasi. Terima kasih.`;
  };

  const generateEmergencyReport = () => {
    return buildReport(getPreviewLocation());
  };

  // 4. Fungsi Pengambilan Lokasi Cepat & Kirim WhatsApp PSC 119
  const handleEmergencyWhatsApp = () => {
    triggerFeedback();
    if (isLocating) return;

    setIsLocating(true);

    const proceedWithLocation = (lokasiText, coordsObj = null) => {
      if (coordsObj) {
        setGpsCoords(coordsObj);
        setGpsStatus('success');
      }
      const reportText = buildReport(lokasiText);
      const cleanNumber = hotlineWhatsApp.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(reportText)}`;
      
      setIsLocating(false);
      openExternalUrl(waUrl);
    };

    if (!navigator.geolocation) {
      setGpsStatus('denied');
      proceedWithLocation(getFallbackLocationText());
      return;
    }

    // Safety timeout jika browser tidak trigger callback tepat waktu (> 4000ms)
    let hasHandled = false;
    const safetyTimer = setTimeout(() => {
      if (!hasHandled) {
        hasHandled = true;
        console.warn("GPS safety timeout fired (>4000ms)");
        setGpsStatus('denied');
        proceedWithLocation(getFallbackLocationText());
      }
    }, 4100);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (hasHandled) return;
        hasHandled = true;
        clearTimeout(safetyTimer);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const finalLocation = gpsAddressHint.trim() 
          ? `${mapUrl} (Patokan: ${gpsAddressHint.trim()})` 
          : mapUrl;

        proceedWithLocation(finalLocation, {
          lat,
          lng,
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        if (hasHandled) return;
        hasHandled = true;
        clearTimeout(safetyTimer);
        console.warn("GPS gagal atau timeout 4 detik:", err);
        setGpsStatus('denied');
        // Jangan blokir alur darurat! Tetap buka WA dengan fallback pesan
        proceedWithLocation(getFallbackLocationText());
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 0
      }
    );
  };

  // 5. Aksi Telepon Langsung 119
  const handleCallHotline = () => {
    triggerFeedback();
    window.location.href = 'tel:119';
  };

  // 6. Aksi Salin Teks
  const handleCopyReport = async () => {
    triggerFeedback();
    const reportText = generateEmergencyReport();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reportText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = reportText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Fallback copy:", e);
      try {
        const ta = document.createElement('textarea');
        ta.value = reportText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen pb-20 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-gray-100' : 'bg-gradient-to-b from-red-50 via-pink-100 to-rose-200 text-gray-800'
    }`}>
      
      {/* ───────────── HEADER ───────────── */}
      <div className="p-4 flex items-center justify-between border-b border-red-500/20 sticky top-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-wide flex items-center gap-2 text-red-600 dark:text-red-500">
              <span className="text-xl">🚑</span> Panggil Ambulans / PSC 119
            </h1>
            <p className="text-[11px] opacity-75 font-medium">
              Public Safety Center 119 • Kemenkes RI
            </p>
          </div>
        </div>

        <button 
          onClick={handleCallHotline}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold px-3 py-1.5 rounded-full text-xs shadow-md flex items-center gap-1.5 transition-all animate-pulse"
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>Call 119</span>
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        
        {/* ───────────── EMERGENCY BANNER ───────────── */}
        <div className="rounded-3xl p-5 shadow-lg bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-red-800/40 text-9xl pointer-events-none select-none">
            🚑
          </div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
              <span>Layanan Evakuasi Medis Pra-Rumah Sakit 24 Jam</span>
            </div>
            
            <h2 className="text-xl font-black leading-tight">
              Butuh Unit Ambulans & Bantuan Medis Segera?
            </h2>
            
            <p className="text-xs text-red-100 leading-relaxed">
              PSC 119 adalah pusat komando darurat medis terintegrasi yang siap mengirim armada ambulans dan tenaga medis terdekat ke titik lokasi kamu.
            </p>
          </div>
        </div>

        {/* ───────────── TOMBOL UTAMA TINDAKAN CEPAT ───────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Tombol Call Langsung */}
          <button 
            onClick={handleCallHotline}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 border-2 border-red-400 active:scale-[0.98]"
          >
            <Phone className="w-5 h-5 animate-bounce" />
            <div className="text-left">
              <div className="text-xs font-bold opacity-90">Telepon Darurat</div>
              <div className="text-sm font-black">Hubungi Hotline 119</div>
            </div>
          </button>

          {/* Tombol Kirim WhatsApp Cepat dengan Auto Geolocation */}
          <button 
            onClick={handleEmergencyWhatsApp}
            disabled={isLocating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 border-2 border-emerald-400 active:scale-[0.98]"
          >
            {isLocating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <div className="text-left">
              <div className="text-xs font-bold opacity-90">WhatsApp PSC 119</div>
              <div className="text-sm font-black">
                {isLocating ? "Mendeteksi lokasi GPS..." : "Kirim Laporan Ambulans"}
              </div>
            </div>
          </button>
        </div>

        {/* ───────────── STATUS TITIK LOKASI PENJEMPUTAN (GPS) ───────────── */}
        <div className={`rounded-3xl p-4 shadow-sm border space-y-3 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black">Titik Lokasi Penjemputan (GPS)</h3>
                <p className="text-[10px] opacity-70">Otomatis dimasukkan ke link Google Maps laporan</p>
              </div>
            </div>

            <button
              onClick={requestGpsLocation}
              disabled={gpsStatus === 'loading' || isLocating}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${gpsStatus === 'loading' || isLocating ? 'animate-spin' : ''}`} />
              <span>{gpsStatus === 'loading' || isLocating ? 'Mencari...' : 'Refresh GPS'}</span>
            </button>
          </div>

          {/* Status Badge GPS */}
          {(gpsStatus === 'loading' || isLocating) && (
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>Mendeteksi koordinat GPS perangkat kamu (maks 4 detik)...</span>
            </div>
          )}

          {gpsStatus === 'success' && gpsCoords.lat !== null && !isLocating && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Koordinat GPS Terkunci Akurat
                </span>
                {gpsCoords.accuracy && (
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Akurasi ±{Math.round(gpsCoords.accuracy)}m
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono break-all opacity-85">
                https://www.google.com/maps?q={gpsCoords.lat.toFixed(6)},{gpsCoords.lng.toFixed(6)}
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => openExternalUrl(`https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300 underline cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" /> Buka & Periksa di Google Maps
                </button>
              </div>
            </div>
          )}

          {(gpsStatus === 'denied' || gpsStatus === 'error') && !isLocating && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Izin GPS Belum Aktif / Ditolak / Timeout
              </div>
              <p className="text-[11px] opacity-85 leading-relaxed">
                Pesan akan otomatis menyertakan: <em>"Mohon pandu konfirmasi lokasi saya (GPS tidak aktif/terhalang)"</em> agar evakuasi ambulans tetap segera berjalan.
              </p>
            </div>
          )}

          {/* Input Tambahan Patokan Alamat / Rumah */}
          <div className="pt-1">
            <label className="text-[11px] font-bold opacity-80 block mb-1">
              Patokan Alamat / Ruangan / Gedung (Opsional):
            </label>
            <input 
              type="text"
              value={gpsAddressHint}
              onChange={(e) => setGpsAddressHint(e.target.value)}
              placeholder="Contoh: Depan Gerbang SMA 1 / Rumah Cat Putih No. 12"
              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-400'
              }`}
            />
          </div>
        </div>

        {/* ───────────── PILIHAN JENIS KONDISI DARURAT ───────────── */}
        <div className={`rounded-3xl p-4 shadow-sm border space-y-3 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-red-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black">Jenis Kondisi Darurat</h3>
              <p className="text-[10px] opacity-70">Pilih cepat kondisi pasien untuk persiapan tim medis</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {kondisiOptions.map((opt) => {
              const isSelected = selectedKondisi === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    triggerFeedback();
                    setSelectedKondisi(opt);
                  }}
                  className={`text-[11px] px-3 py-1.5 rounded-xl font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected && '✓ '}
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedKondisi === 'Lainnya (Ketik Kondisi Sendiri)' && (
            <div className="pt-1">
              <input 
                type="text"
                value={customKondisiText}
                onChange={(e) => setCustomKondisiText(e.target.value)}
                placeholder="Tulis kondisi darurat singkat pasien..."
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-400'
                }`}
              />
            </div>
          )}
        </div>

        {/* ───────────── DATA PELAPOR / PASIEN ───────────── */}
        <div className={`rounded-3xl p-4 shadow-sm border space-y-3 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black">Data Pelapor / Pasien</h3>
                <p className="text-[10px] opacity-70">Otomatis dari Akun HEAL yang sedang aktif</p>
              </div>
            </div>

            <button
              onClick={() => setShowEditData(!showEditData)}
              className="text-[11px] font-bold text-red-500 hover:underline"
            >
              {showEditData ? 'Sembunyikan' : 'Ubah Data'}
            </button>
          </div>

          {/* Tampilan Ringkas Data */}
          {!showEditData ? (
            <div className={`p-3 rounded-2xl text-xs space-y-1 ${
              isDarkMode ? 'bg-gray-800/60 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
              <div className="flex justify-between">
                <span className="opacity-70">Nama Lengkap:</span>
                <span className="font-bold">{getFinalNama()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">No. HP:</span>
                <span className="font-bold">{getFinalNoHp()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Asal / Instansi:</span>
                <span className="font-bold">{getFinalSekolah()}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] font-bold opacity-75 block mb-1">Nama Pasien / Pelapor:</label>
                <input 
                  type="text"
                  value={customNama}
                  onChange={(e) => setCustomNama(e.target.value)}
                  placeholder="Nama Lengkap"
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold opacity-75 block mb-1">Nomor WhatsApp / HP Aktif:</label>
                <input 
                  type="tel"
                  value={customNoHp}
                  onChange={(e) => setCustomNoHp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold opacity-75 block mb-1">Asal Sekolah / Instansi:</label>
                <input 
                  type="text"
                  value={customSekolah}
                  onChange={(e) => setCustomSekolah(e.target.value)}
                  placeholder="Contoh: SMA Negeri 1 / Umum"
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* ───────────── PRATINJAU FORMAT LAPORAN MEDIS PSC 119 ───────────── */}
        <div className={`rounded-3xl p-4 shadow-sm border space-y-2.5 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <span>📄</span> Pratinjau Pesan Laporan WhatsApp
            </h3>
            
            <button
              onClick={handleCopyReport}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div className={`p-3.5 rounded-2xl text-[11px] font-mono leading-relaxed whitespace-pre-wrap select-all border ${
            isDarkMode 
              ? 'bg-black/50 border-gray-800 text-gray-300' 
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            {generateEmergencyReport()}
          </div>
        </div>

        {/* ───────────── TOMBOL EKSEKUSI BESAR ───────────── */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={handleEmergencyWhatsApp}
            disabled={isLocating}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-75 text-white font-black py-4 rounded-2xl text-sm shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 border border-red-400 active:scale-[0.98]"
          >
            {isLocating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-xl">🚑</span>
            )}
            <span>
              {isLocating 
                ? "Mendeteksi lokasi GPS... Menyiapkan Ambulans" 
                : "Kirim Pesan Darurat Ambulans (WhatsApp PSC 119)"}
            </span>
          </button>

          <button 
            onClick={handleCallHotline}
            className={`w-full font-bold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 border active:scale-[0.98] ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Phone className="w-4 h-4 text-red-500" />
            <span>Atau Panggil Suara Langsung ke Nomor Telepon 119 (Bebas Pulsa)</span>
          </button>
        </div>

        {/* ───────────── INFORMASI PSC 119 ───────────── */}
        <div className={`text-[11px] p-4 rounded-3xl border space-y-1.5 ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800 text-gray-400' : 'bg-white border-red-100 text-gray-600'
        }`}>
          <p className="font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <span>ℹ️</span> Tentang Layanan PSC 119 (Public Safety Center):
          </p>
          <p>• PSC 119 adalah layanan tanggap darurat medis pra-rumah sakit resmi dari Kementerian Kesehatan RI dan Pemerintah Daerah.</p>
          <p>• Nomor telepon <strong>119 bebas pulsa</strong> dan dapat dihubungi melalui semua penyedia seluler di seluruh wilayah Indonesia 24 Jam.</p>
          <p>• Jika respon WhatsApp lambat karena antrean, <strong>SEGERA lakukan panggilan telepon langsung ke nomor 119</strong>.</p>
        </div>

      </div>
    </div>
  );
}