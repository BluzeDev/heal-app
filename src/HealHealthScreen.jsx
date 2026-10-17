import React, { useState, useEffect } from 'react';
import { analyzeDeviceSleep } from './utils/sleepTracker';
import { calculateCycleScenarios } from './utils/cyclePredictor';
import { triggerFeedback } from './utils/feedback';

// Kumpulan 50+ Tips Kesehatan Fisik & Mental
const ALL_HEALTH_TIPS = [
  "Minum minimal 8 gelas air putih hari ini untuk menjaga hidrasi tubuh.",
  "Luangkan waktu 15 menit untuk meregangkan otot setelah duduk lama.",
  "Usahakan tidur 7-8 jam malam ini agar imun tubuh tetap prima.",
  "Kurangi konsumsi gula berlebih, pilih buah segar sebagai camilan.",
  "Jalan kaki 1000-3000 langkah ringan di sekitar rumah atau sekolah.",
  "Lakukan teknik pernapasan 4-7-8 saat merasa cemas atau tertekan.",
  "Hindari menatap layar ponsel/laptop minimal 30 menit sebelum tidur.",
  "Jangan lewatkan sarapan bernutrisi untuk energi di pagi hari.",
  "Jaga postur tubuh tetap tegak saat duduk belajar di meja.",
  "Konsumsi makanan kaya serat seperti sayuran hijau dan buah-buahan.",
  "Luangkan waktu untuk melakukan hobi favoritmu sejenak.",
  "Istirahatkan mata tiap 20 menit menatap layar dengan melihat objek jauh.",
  "Cuci tangan dengan sabun sebelum dan sesudah makan.",
  "Nikmati sinar matahari pagi selama 10-15 menit untuk Vitamin D.",
  "Dengarkan musik favoritmu untuk meredakan ketegangan pikiran.",
  "Ganti minuman bersoda atau manis dengan air mineral atau teh herbal.",
  "Jangan menahan buang air kecil untuk menjaga kesehatan ginjal.",
  "Bicarakan perasaanmu pada teman atau orang terdekat jika merasa terbeban.",
  "Sediakan waktu untuk bermeditasi atau tenang sejenak tanpa gadget.",
  "Batasi konsumsi kafein berlebih, terutama di sore dan malam hari.",
  "Lakukan pemanasan singkat sebelum memulai olahraga berat.",
  "Gunakan masker jika berada di area berdebu atau berpolusi tinggi.",
  "Jaga kebersihan gigi dengan menyikat gigi minimal 2 kali sehari.",
  "Tetapkan prioritas harian agar tidak kelabakan mengerjakan tugas.",
  "Minum air hangat saat bangun tidur untuk menyegarkan pencernaan.",
  "Cobalah rutin mengonsumsi buah jeruk atau apel tiap hari.",
  "Jaga kebersihan tempat tidur agar kualitas tidur lebih maksimal.",
  "Lakukan relaksasi leher dan bahu jika sering merasa pegal.",
  "Gunakan pakaian yang nyaman dan tidak terlalu ketat.",
  "Kurangi makanan cepat saji atau yang tinggi kandungan garamnya.",
  "Jadikan olahraga ringan sebagai rutinitas yang menyenangkan.",
  "Sediakan selalu air minum di dalam botol saat beraktivitas.",
  "Jangan ragu mengucapkan 'tidak' jika sudah melebihi kapasitasmu.",
  "Ajak teman atau keluarga untuk jalan sore bersama.",
  "Hirup udara segar di area terbuka atau taman terdekat.",
  "Jaga kebersihan kuku tangan dan kaki secara berkala.",
  "Lakukan olahraga cardio ringan seperti lompat tali atau jogging.",
  "Catat hal-hal kecil yang kamu syukuri hari ini.",
  "Hindari mengonsumsi makanan berat menjelang waktu tidur.",
  "Gunakan pelembab kulit jika sering berada di ruangan ber-AC.",
  "Perbanyak konsumsi makanan penambah imun seperti jahe dan kunyit.",
  "Sisihkan waktu untuk tertawa dan beristirahat sejenak dari rutinitas.",
  "Jaga kebersihan spons dapur dan peralatan makanmu.",
  "Lakukan stretching ringan di tempat tidur saat baru bangun.",
  "Gunakan tangga biasa dibanding eskalator untuk menambah aktivitas fisik.",
  "Ketahui batas kemampuan tubuhmu, jangan paksakan jika sangat lelah.",
  "Pastikan ventilasi kamar cukup untuk sirkulasi udara yang baik.",
  "Senyum pada diri sendiri di depan cermin sebagai bentuk apresiasi.",
  "Kurangi kebiasaan begadang tanpa alasan yang mendesak.",
  "Hindari kebiasaan menggigit kuku atau menyentuh wajah dengan tangan kotor.",
  "Beri diri pujian atas usaha yang sudah kamu lakukan hari ini!"
];

const COMMON_SYMPTOMS = [
  'Kram Perut Ringan',
  'Kelelahan / Mengantuk',
  'Jerawat Hormonal',
  'Perut Kembung',
  'Emosi Lebih Sensitif',
  'Sakit Kepala Ringan',
  'Nafsu Makan Bertambah'
];

export default function HealHealthScreen({ user, isDarkMode }) {
  const userKey = user ? user : 'guest';

  // BMI Input State
  const [berat, setBerat] = useState(55);
  const [tinggi, setTinggi] = useState(165);
  const [bmiResult, setBmiResult] = useState(null);

  // Health Metrics State
  const [gulaDarah, setGulaDarah] = useState(90);
  const [stressLevel, setStressLevel] = useState('Normal');
  const [detakJantung, setDetakJantung] = useState(72);
  const [spO2, setSpO2] = useState(98);
  const [steps, setSteps] = useState(6450);

  // Wearable Connection State
  const [wearableDevice, setWearableDevice] = useState(() => {
    const saved = localStorage.getItem(`heal_wearable_${userKey}`);
    return saved ? JSON.parse(saved) : {
      name: 'Smartband Remaja Fit-Pro (BLE)',
      isConnected: true,
      battery: 86,
      lastSync: 'Baru Saja'
    };
  });
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Edit Metrics State
  const [editingMetric, setEditingMetric] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // 1. Water Intake State
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const saved = localStorage.getItem(`heal_water_${userKey}`);
    return saved ? parseInt(saved, 10) : 4;
  });

  // 2. Sleep Tracker State (Daily Device Activity Detection)
  const [sleepAnalysis, setSleepAnalysis] = useState(() => analyzeDeviceSleep());
  const [sleepHours, setSleepHours] = useState(sleepAnalysis.durationHours || 7.5);

  // 3. Menstrual Period Tracker State
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    return localStorage.getItem(`heal_period_${userKey}`) || '';
  });
  const [periodDuration, setPeriodDuration] = useState(7);
  const [cycleScenarios, setCycleScenarios] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState(() => {
    const saved = localStorage.getItem(`heal_symptoms_${userKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Random 3 Tips & Count Schedule
  const [randomTips, setRandomTips] = useState([]);
  const [todayScheduleCount, setTodayScheduleCount] = useState(0);

  useEffect(() => {
    const shuffled = [...ALL_HEALTH_TIPS].sort(() => 0.5 - Math.random());
    setRandomTips(shuffled.slice(0, 3));

    calculateBmi(55, 165);

    // Refresh sleep analysis
    const analyzed = analyzeDeviceSleep();
    setSleepAnalysis(analyzed);
    if (analyzed.durationHours) {
      setSleepHours(analyzed.durationHours);
    }

    // Hitung siklus menstruasi jika ada tanggal
    if (lastPeriodDate) {
      setCycleScenarios(calculateCycleScenarios(lastPeriodDate, periodDuration));
    }

    const updateScheduleCount = () => {
      const userScheduleKey = user ? `heal_schedules_${user}` : 'heal_schedules';
      const savedSchedulesData = localStorage.getItem(userScheduleKey);
      if (savedSchedulesData) {
        try {
          const parsed = JSON.parse(savedSchedulesData);
          setTodayScheduleCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch (e) {
          setTodayScheduleCount(0);
        }
      } else {
        setTodayScheduleCount(0);
      }
    };

    updateScheduleCount();
    window.addEventListener('scheduleUpdated', updateScheduleCount);
    window.addEventListener('focus', updateScheduleCount);

    return () => {
      window.removeEventListener('scheduleUpdated', updateScheduleCount);
      window.removeEventListener('focus', updateScheduleCount);
    };
  }, [user, lastPeriodDate, periodDuration]);

  // Save Water
  const handleAddWater = () => {
    triggerFeedback();
    if (waterGlasses < 12) {
      const updated = waterGlasses + 1;
      setWaterGlasses(updated);
      localStorage.setItem(`heal_water_${userKey}`, updated);
    }
  };

  const handleMinusWater = () => {
    triggerFeedback();
    if (waterGlasses > 0) {
      const updated = waterGlasses - 1;
      setWaterGlasses(updated);
      localStorage.setItem(`heal_water_${userKey}`, updated);
    }
  };

  // Save Period
  const handleSavePeriod = (e) => {
    e.preventDefault();
    triggerFeedback();
    if (!lastPeriodDate) {
      alert('Pilih tanggal mulai haid terlebih dahulu!');
      return;
    }
    localStorage.setItem(`heal_period_${userKey}`, lastPeriodDate);
    localStorage.setItem(`heal_symptoms_${userKey}`, JSON.stringify(selectedSymptoms));
    setCycleScenarios(calculateCycleScenarios(lastPeriodDate, periodDuration));
    alert('🌸 Kalender siklus menstruasi dan gejala berhasil diperbarui!');
  };

  const toggleSymptom = (symptom) => {
    triggerFeedback();
    setSelectedSymptoms((prev) => 
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  // Hitung BMI
  const calculateBmi = (bb, tb) => {
    if (!bb || !tb) return;
    const tinggiMeter = tb / 100;
    const bmi = (bb / (tinggiMeter * tinggiMeter)).toFixed(1);
    
    let category = '';
    let colorClass = '';
    let bgClass = '';

    if (bmi < 18.5) {
      category = 'Kurang BB';
      colorClass = isDarkMode ? 'text-blue-400' : 'text-blue-600';
      bgClass = isDarkMode ? 'bg-blue-950/40 border-blue-900' : 'bg-blue-50 border-blue-200';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = 'Normal';
      colorClass = isDarkMode ? 'text-green-400' : 'text-green-600';
      bgClass = isDarkMode ? 'bg-green-950/40 border-green-900' : 'bg-green-50 border-green-200';
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = 'Overweight';
      colorClass = isDarkMode ? 'text-amber-400' : 'text-amber-600';
      bgClass = isDarkMode ? 'bg-amber-950/40 border-amber-900' : 'bg-amber-50 border-amber-200';
    } else {
      category = 'Obesitas';
      colorClass = isDarkMode ? 'text-red-400' : 'text-red-600';
      bgClass = isDarkMode ? 'bg-red-950/40 border-red-900' : 'bg-red-50 border-red-200';
    }

    setBmiResult({ val: bmi, category, colorClass, bgClass });
  };

  const handleCalculateBtn = (e) => {
    e.preventDefault();
    triggerFeedback();
    calculateBmi(berat, tinggi);
  };

  const handleSaveMetric = () => {
    triggerFeedback();
    if (editingMetric === 'gula') setGulaDarah(tempValue);
    if (editingMetric === 'stress') setStressLevel(tempValue);
    if (editingMetric === 'jantung') setDetakJantung(tempValue);
    if (editingMetric === 'spo2') setSpO2(tempValue);
    if (editingMetric === 'steps') setSteps(parseInt(tempValue, 10) || steps);
    setEditingMetric(null);
  };

  // Sync Wearable
  const handleSyncWearable = () => {
    triggerFeedback();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setDetakJantung(Math.floor(Math.random() * (82 - 68 + 1)) + 68);
      setSpO2(Math.floor(Math.random() * (100 - 97 + 1)) + 97);
      setSteps((prev) => prev + Math.floor(Math.random() * 250) + 50);
      const updated = {
        ...wearableDevice,
        lastSync: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        battery: Math.max(20, wearableDevice.battery - 1)
      };
      setWearableDevice(updated);
      localStorage.setItem(`heal_wearable_${userKey}`, JSON.stringify(updated));
    }, 1200);
  };

  const handleConnectNewDevice = (device) => {
    triggerFeedback();
    const newDevice = {
      name: device.name,
      isConnected: true,
      battery: device.battery || 90,
      lastSync: 'Baru Saja'
    };
    setWearableDevice(newDevice);
    localStorage.setItem(`heal_wearable_${userKey}`, JSON.stringify(newDevice));
    setShowScanModal(false);
  };

  return (
    <div className={`p-4 space-y-5 max-w-4xl mx-auto pb-24 transition-colors duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-transparent text-gray-800'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">❤️</span>
          <h1 className="text-xl font-bold tracking-tight">My Health Monitor</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-emerald-500">Sensor Aktif</span>
        </div>
      </div>

      {/* SECTION 1: SMARTWATCH & WEARABLE BIOMETRIC SYNC ⌚ */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-4 relative overflow-hidden ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gradient-to-br from-white to-pink-50/50 border-pink-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg">
              ⌚
            </div>
            <div>
              <h2 className="font-bold text-sm">Sinkronisasi Smartwatch & Smartband</h2>
              <p className="text-[11px] opacity-60">
                {wearableDevice?.isConnected 
                  ? `${wearableDevice.name} • Baterai ${wearableDevice.battery}% • Sinkron: ${wearableDevice.lastSync}`
                  : 'Belum terhubung ke Smartband'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScanModal(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' : 'bg-white border-pink-200 hover:bg-pink-50 text-pink-600'
              }`}
            >
              🔄 Ganti Perangkat
            </button>
            <button
              onClick={handleSyncWearable}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Sinkron...</span>
                </>
              ) : (
                <>
                  <span>⚡ Sinkron</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Biometric Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {/* 1. Detak Jantung */}
          <div className={`p-3.5 rounded-2xl border relative ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-rose-100 shadow-sm'}`}>
            <button 
              onClick={() => { setEditingMetric('jantung'); setTempValue(detakJantung); }}
              className="absolute top-2.5 right-2 text-[10px] opacity-50 hover:opacity-100"
            >
              ✏️
            </button>
            <div className="flex items-center gap-1.5 mb-1 text-rose-500">
              <span className="text-base animate-pulse">💓</span>
              <span className="text-[11px] font-bold">Detak Jantung</span>
            </div>
            <p className="text-xl font-black">{detakJantung} <span className="text-[10px] font-normal opacity-60">bpm</span></p>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">Normal</span>
          </div>

          {/* 2. SpO2 */}
          <div className={`p-3.5 rounded-2xl border relative ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-sky-100 shadow-sm'}`}>
            <button 
              onClick={() => { setEditingMetric('spo2'); setTempValue(spO2); }}
              className="absolute top-2.5 right-2 text-[10px] opacity-50 hover:opacity-100"
            >
              ✏️
            </button>
            <div className="flex items-center gap-1.5 mb-1 text-sky-500">
              <span className="text-base">🫁</span>
              <span className="text-[11px] font-bold">SpO2 Oksigen</span>
            </div>
            <p className="text-xl font-black">{spO2} <span className="text-[10px] font-normal opacity-60">%</span></p>
            <span className="text-[9px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full inline-block mt-1">Optimal</span>
          </div>

          {/* 3. Gula Darah */}
          <div className={`p-3.5 rounded-2xl border relative ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-purple-100 shadow-sm'}`}>
            <button 
              onClick={() => { setEditingMetric('gula'); setTempValue(gulaDarah); }}
              className="absolute top-2.5 right-2 text-[10px] opacity-50 hover:opacity-100"
            >
              ✏️
            </button>
            <div className="flex items-center gap-1.5 mb-1 text-purple-500">
              <span className="text-base">🩸</span>
              <span className="text-[11px] font-bold">Gula Darah</span>
            </div>
            <p className="text-xl font-black">{gulaDarah} <span className="text-[10px] font-normal opacity-60">mg/dL</span></p>
            <span className="text-[9px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mt-1">Stabil</span>
          </div>

          {/* 4. Langkah Harian */}
          <div className={`p-3.5 rounded-2xl border relative ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-amber-100 shadow-sm'}`}>
            <button 
              onClick={() => { setEditingMetric('steps'); setTempValue(steps); }}
              className="absolute top-2.5 right-2 text-[10px] opacity-50 hover:opacity-100"
            >
              ✏️
            </button>
            <div className="flex items-center gap-1.5 mb-1 text-amber-500">
              <span className="text-base">🚶</span>
              <span className="text-[11px] font-bold">Langkah Kaki</span>
            </div>
            <p className="text-xl font-black">{steps.toLocaleString()} <span className="text-[10px] font-normal opacity-60">step</span></p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.round((steps / 10000) * 100))}%` }}
              ></div>
            </div>
          </div>

          {/* 5. Tingkat Stress */}
          <div className={`p-3.5 rounded-2xl border relative col-span-2 md:col-span-1 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-emerald-100 shadow-sm'}`}>
            <button 
              onClick={() => { setEditingMetric('stress'); setTempValue(stressLevel); }}
              className="absolute top-2.5 right-2 text-[10px] opacity-50 hover:opacity-100"
            >
              ✏️
            </button>
            <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
              <span className="text-base">🧠</span>
              <span className="text-[11px] font-bold">Tingkat Stres</span>
            </div>
            <p className="text-xl font-black">{stressLevel}</p>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">Rileks</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: ANALISIS KUALITAS TIDUR REMAJA 😴 (Daily Device Activity Detection) */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😴</span>
            <div>
              <h2 className="font-bold text-sm">Analisis Kualitas Tidur Remaja</h2>
              <p className="text-[11px] opacity-60">Deteksi otomatis jeda layar inaktif di malam hari</p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            {sleepAnalysis.qualityBadge}
          </span>
        </div>

        {/* Status Sensor Layar */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
          isDarkMode ? 'bg-purple-950/30 border-purple-900/50 text-purple-200' : 'bg-purple-50 border-purple-100 text-purple-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span><strong>Screen Inactivity Tracker:</strong> Aktif mendeteksi durasi istirahat saat ponsel diletakkan.</span>
          </div>
          <button 
            onClick={() => {
              const res = analyzeDeviceSleep();
              setSleepAnalysis(res);
              setSleepHours(res.durationHours);
              triggerFeedback();
            }}
            className="text-[11px] font-bold underline hover:opacity-80 shrink-0 ml-2"
          >
            Segarkan ⟳
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bedtime */}
          <div className={`p-3.5 rounded-2xl border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <span className="text-xl">🌙</span>
            <p className="text-[11px] opacity-60 mt-1">Mulai Tidur (HP Off)</p>
            <p className="text-lg font-black text-indigo-500">{sleepAnalysis.bedtimeStr}</p>
          </div>

          {/* Wake time */}
          <div className={`p-3.5 rounded-2xl border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <span className="text-xl">☀️</span>
            <p className="text-[11px] opacity-60 mt-1">Bangun Pagi (HP On)</p>
            <p className="text-lg font-black text-amber-500">{sleepAnalysis.wakeTimeStr}</p>
          </div>

          {/* Durasi */}
          <div className={`p-3.5 rounded-2xl border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <span className="text-xl">⏱️</span>
            <p className="text-[11px] opacity-60 mt-1">Total Durasi Istirahat</p>
            <p className="text-lg font-black text-purple-500">{sleepHours} Jam</p>
          </div>
        </div>

        {/* Durasi Slider Adjuster */}
        <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-purple-50/40 border-purple-100'}`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Sesuaikan Durasi Tidur Manual:</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{sleepHours} Jam</span>
          </div>
          <input 
            type="range" 
            min="4" 
            max="12" 
            step="0.5" 
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] opacity-50">
            <span>4 Jam (Kurang)</span>
            <span>8 Jam (Ideal Remaja)</span>
            <span>12 Jam (Lebih)</span>
          </div>
        </div>

        {/* Teen Sleep Recommendation */}
        <div className={`text-xs p-3.5 rounded-2xl border space-y-1 ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'
        }`}>
          <p className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <span>💡</span> Panduan Kualitas Tidur Usia Remaja (13–18 Tahun)
          </p>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Remaja membutuhkan <strong>8–10 jam tidur per malam</strong> untuk mendukung hormon pertumbuhan (HGH), konsentrasi belajar, dan kestabilan mood. Hindari paparan sinar biru layar HP minimal 30 menit sebelum tidur agar produksi melatonin maksimal.
          </p>
        </div>
      </div>

      {/* SECTION 3: KALENDER SIKLUS MENSTRUASI DENGAN 3 SKENARIO PREDIKSI 🌸 */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <div>
              <h2 className="font-bold text-sm">Kalender Siklus Menstruasi (Remaja Putri)</h2>
              <p className="text-[11px] opacity-60">Prediksi 3 skenario siklus (Cepat, Normal, Lambat) & masa subur</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePeriod} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-70 font-medium block mb-1">Tanggal Mulai Haid Terakhir</label>
              <input 
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-pink-400 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              />
            </div>

            <div>
              <label className="text-xs opacity-70 font-medium block mb-1">Durasi Rata-rata Haid (Hari)</label>
              <select
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value, 10))}
                className={`w-full border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-pink-400 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                {[4, 5, 6, 7, 8, 9, 10].map((day) => (
                  <option key={day} value={day}>{day} Hari</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gejala Fisik & Mood Remaja */}
          <div>
            <label className="text-xs opacity-70 font-medium block mb-1.5">Catatan Gejala / Mood Menstruasi:</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white border-pink-500 font-bold shadow-sm'
                        : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        : 'bg-pink-50/50 border-pink-200 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{symptom}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-2.5 rounded-2xl text-xs shadow-md hover:opacity-95 transition-all"
          >
            💾 Simpan & Perbarui Kalender Siklus
          </button>
        </form>

        {/* 3 SCENARIO PREDICTIONS DISPLAY */}
        {cycleScenarios ? (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold opacity-80 uppercase tracking-wider">
              Prediksi Tanggal Haid Berikutnya (3 Skenario):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Skenario 1: Cepat (21-24 hari) */}
              <div className={`p-4 rounded-2xl border space-y-1.5 ${
                isDarkMode ? 'bg-orange-950/20 border-orange-900/60 text-orange-200' : 'bg-orange-50/80 border-orange-200 text-orange-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">🟠 Skenario Cepat</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    21–24 Hari
                  </span>
                </div>
                <p className="text-base font-black">{cycleScenarios.cepat.rangeStr}</p>
                <p className="text-[10px] opacity-70">Cocok untuk remaja dengan ritme metabolisme aktif atau siklus pendek.</p>
              </div>

              {/* Skenario 2: Normal (28-30 hari) */}
              <div className={`p-4 rounded-2xl border space-y-1.5 relative overflow-hidden ${
                isDarkMode ? 'bg-emerald-950/30 border-emerald-900 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">🟢 Skenario Normal</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    28–30 Hari
                  </span>
                </div>
                <p className="text-base font-black">{cycleScenarios.normal.rangeStr}</p>
                <p className="text-[10px] opacity-70">Siklus paling umum pada masa pubertas.</p>

                {/* Info Masa Subur */}
                <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10px]">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">🌸 Estimasi Masa Ovulasi:</p>
                  <p className="font-semibold">{cycleScenarios.fertile.rangeStr} (Puncak: {cycleScenarios.fertile.peakStr})</p>
                </div>
              </div>

              {/* Skenario 3: Lambat (31-35 hari) */}
              <div className={`p-4 rounded-2xl border space-y-1.5 ${
                isDarkMode ? 'bg-sky-950/20 border-sky-900/60 text-sky-200' : 'bg-sky-50/80 border-sky-200 text-sky-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">🔵 Skenario Lambat</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    31–35 Hari
                  </span>
                </div>
                <p className="text-base font-black">{cycleScenarios.lambat.rangeStr}</p>
                <p className="text-[10px] opacity-70">Wajar terjadi saat sedang masa ujian sekolah, kelelahan, atau stres emosional.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-2xl border text-center text-xs ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-pink-50/40 border-pink-100 text-pink-700'
          }`}>
            Masukkan tanggal mulai haid terakhir Anda di atas untuk melihat 3 simulasi prediksi siklus! 🌸
          </div>
        )}
      </div>

      {/* SECTION 4: WATER INTAKE TRACKER 💧 */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <span>💧</span> Pengingat Minum Air Putih
          </h2>
          <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
            {waterGlasses} / 8 Gelas (Target)
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx}
                className={`w-7 h-10 rounded-xl border flex items-center justify-center text-xs transition-all ${
                  idx < waterGlasses 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
                    : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-blue-50 border-blue-200 text-blue-300'
                }`}
              >
                🥛
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleMinusWater}
              className={`w-9 h-9 rounded-full font-bold border flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'
              }`}
            >
              -
            </button>
            <button 
              onClick={handleAddWater}
              className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <p className="text-[11px] opacity-60">Target ideal remaja adalah 8 gelas (± 2 liter) per hari agar terhindar dari dehidrasi dan pusing.</p>
      </div>

      {/* SECTION 5: KALKULATOR BMI */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
        <h2 className="font-bold text-sm flex items-center gap-2">
          <span>⚖️</span> Hitung Indeks Massa Tubuh (BMI)
        </h2>

        <form onSubmit={handleCalculateBtn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs opacity-70 font-medium block mb-1">Berat Badan (kg)</label>
            <input 
              type="number"
              value={berat}
              onChange={(e) => setBerat(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-pink-400 ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50/50 border-gray-200 text-gray-800'
              }`}
              placeholder="Contoh: 55"
            />
          </div>
          <div>
            <label className="text-xs opacity-70 font-medium block mb-1">Tinggi Badan (cm)</label>
            <input 
              type="number"
              value={tinggi}
              onChange={(e) => setTinggi(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-pink-400 ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50/50 border-gray-200 text-gray-800'
              }`}
              placeholder="Contoh: 165"
            />
          </div>
          <button 
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-2xl text-xs shadow-md hover:opacity-95 transition-all"
          >
            ✓ Hitung & Konfirmasi BMI
          </button>
        </form>

        {bmiResult && (
          <div className={`p-4 rounded-2xl border ${bmiResult.bgClass} flex items-center justify-between mt-3`}>
            <div>
              <p className="text-xs opacity-70 font-medium">BMI Anda Saat Ini</p>
              <h3 className={`text-2xl font-black ${bmiResult.colorClass}`}>{bmiResult.val}</h3>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${bmiResult.colorClass} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm`}>
              {bmiResult.category}
            </div>
          </div>
        )}

        <div className={`text-[11px] p-3 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
          💡 <strong>Kategori BMI:</strong> Kurang (&lt;18.5) | Normal (18.5 - 24.9) | Overweight (25 - 29.9) | Obesitas (&ge;30)
        </div>
      </div>

      {/* SECTION 6: PANDUAN GIZI REMAJA 🥗 */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
        <h2 className="font-bold text-sm flex items-center gap-2">
          <span>🥗</span> Panduan Gizi Seimbang Remaja (Isi Piringku)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3 rounded-2xl border text-center space-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-100'}`}>
            <span className="text-2xl">🍚</span>
            <p className="font-bold text-xs">Karbohidrat (1/3)</p>
            <p className="text-[10px] opacity-60">Nasi, kentang, gandum</p>
          </div>
          <div className={`p-3 rounded-2xl border text-center space-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-100'}`}>
            <span className="text-2xl">🥩</span>
            <p className="font-bold text-xs">Protein (1/3)</p>
            <p className="text-[10px] opacity-60">Ikan, telur, ayam, tahu</p>
          </div>
          <div className={`p-3 rounded-2xl border text-center space-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
            <span className="text-2xl">🥦</span>
            <p className="font-bold text-xs">Sayuran (1/3)</p>
            <p className="text-[10px] opacity-60">Bayam, brokoli, wortel</p>
          </div>
          <div className={`p-3 rounded-2xl border text-center space-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-100'}`}>
            <span className="text-2xl">🍎</span>
            <p className="font-bold text-xs">Buah-buahan</p>
            <p className="text-[10px] opacity-60">Apel, pisang, jeruk</p>
          </div>
        </div>
      </div>

      {/* SECTION 7: TIPS HARI INI */}
      <div className={`rounded-3xl p-5 shadow-sm border space-y-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
        <h2 className="font-bold text-sm flex items-center gap-2">
          <span>💡</span> Tips Kesehatan Hari Ini
        </h2>
        <div className="space-y-2">
          {randomTips.map((tip, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border text-xs flex items-start gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-pink-50/50 border-pink-100/50 text-gray-700'}`}>
              <span className="font-bold text-pink-400 shrink-0">{idx + 1}.</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8: JADWAL HARI INI COUNT */}
      <div className={`rounded-3xl p-5 shadow-sm border flex items-center justify-between ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl">
            📅
          </div>
          <div>
            <h3 className="font-bold text-sm">Jadwal Hari Ini</h3>
            <p className="text-xs opacity-60">{todayScheduleCount} aktivitas terjadwal</p>
          </div>
        </div>
      </div>

      {/* MODAL POPUP EDIT METRICS */}
      {editingMetric && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-6 max-w-xs w-full space-y-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-100'}`}>
            <h3 className="font-bold text-sm">
              Edit {
                editingMetric === 'gula' ? 'Gula Darah (mg/dL)' : 
                editingMetric === 'stress' ? 'Tingkat Stres' : 
                editingMetric === 'jantung' ? 'Detak Jantung (bpm)' : 
                editingMetric === 'spo2' ? 'Saturasi SpO2 (%)' : 'Langkah Kaki'
              }
            </h3>

            {editingMetric === 'stress' ? (
              <select 
                value={tempValue} 
                onChange={(e) => setTempValue(e.target.value)}
                className={`w-full border rounded-2xl p-3 text-xs outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'}`}
              >
                <option value="Rendah">Rendah</option>
                <option value="Normal">Normal</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            ) : (
              <input 
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className={`w-full border rounded-2xl p-3 text-xs outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'}`}
                placeholder="Masukkan nilai baru..."
              />
            )}

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setEditingMetric(null)}
                className={`flex-1 font-bold py-2.5 rounded-full text-xs ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Batal
              </button>
              <button 
                onClick={handleSaveMetric}
                className="flex-1 bg-pink-500 text-white font-bold py-2.5 rounded-full text-xs hover:bg-pink-600 shadow-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP PAIRING WEARABLE (BLE) */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full space-y-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⌚</span>
                <h3 className="font-bold text-sm">Pindai Smartband / Watch (BLE)</h3>
              </div>
              <button 
                onClick={() => setShowScanModal(false)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs opacity-70">
              Dekatkan smartwatch / smartband Anda ke ponsel untuk menyambungkan sensor biometrik (Detak jantung, SpO2, dan Langkah).
            </p>

            <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
              {[
                { name: 'FitLife Youth Band 8 (BLE)', battery: 94, type: 'Smartband' },
                { name: 'Samsung Galaxy Fit 3', battery: 78, type: 'Smartband' },
                { name: 'Apple Watch Series (HealthKit)', battery: 85, type: 'Smartwatch' },
                { name: 'Garmin Vivosmart 5', battery: 90, type: 'Smartband' },
                { name: 'Xiaomi Smart Band 8 Active', battery: 67, type: 'Smartband' }
              ].map((dev, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-gray-50 border-gray-200 hover:border-indigo-400'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{dev.name}</p>
                    <p className="text-[10px] opacity-60">{dev.type} • Baterai {dev.battery}% • Sinyal Kuat</p>
                  </div>
                  <button
                    onClick={() => handleConnectNewDevice(dev)}
                    className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  >
                    Hubungkan
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowScanModal(false)}
                className={`w-full py-2.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}