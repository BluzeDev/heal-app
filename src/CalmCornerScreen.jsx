import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Sparkles, Heart } from "lucide-react";
import { triggerFeedback } from "./utils/feedback";

export default function CalmCornerScreen({ onBack, isDarkMode }) {
  const [phase, setPhase] = useState("idle"); // idle | inhale | hold | exhale | done
  const [cycleCount, setCycleCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const cycleRef = useRef(0);

  const PHASES = [
    { name: "inhale", label: "Tarik Napas Dalam-dalam", duration: 4, color: "from-sky-400 via-teal-400 to-blue-500", scale: "scale-125" },
    { name: "hold",   label: "Tahan Napas, Rasakan Ketenangan", duration: 7, color: "from-indigo-500 via-purple-500 to-pink-500", scale: "scale-125" },
    { name: "exhale", label: "Hembuskan Perlahan Melalui Mulut", duration: 8, color: "from-teal-400 via-emerald-400 to-cyan-500", scale: "scale-90" },
  ];

  const startBreathing = () => {
    triggerFeedback();
    cycleRef.current = 0;
    setCycleCount(0);
    runPhase(0);
  };

  const runPhase = (idx) => {
    const p = PHASES[idx];
    setPhase(p.name);
    setTimer(p.duration);
    let count = p.duration;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      count--;
      setTimer(count);
      if (count <= 0) {
        clearInterval(intervalRef.current);
        const next = (idx + 1) % PHASES.length;
        if (next === 0) {
          cycleRef.current += 1;
          setCycleCount(cycleRef.current);
          if (cycleRef.current >= 4) {
            setPhase("done");
            return;
          }
        }
        runPhase(next);
      }
    }, 1000);
  };

  const stopBreathing = () => {
    triggerFeedback();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setCycleCount(0);
    setTimer(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const current = PHASES.find((p) => p.name === phase);

  return (
    <div className={`flex flex-col min-h-screen items-center pb-20 transition-colors duration-500 ${
      isDarkMode ? "bg-black text-gray-100" : "bg-gradient-to-b from-sky-50 via-teal-50 to-pink-50 text-gray-800"
    }`}>
      {/* Header */}
      <div className={`w-full flex items-center justify-between p-4 border-b sticky top-0 z-30 backdrop-blur-md ${
        isDarkMode ? "bg-black/85 border-gray-800" : "bg-white/80 border-sky-100"
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { triggerFeedback(); onBack(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all ${
              isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-sky-500" />
          </button>
          <div>
            <h1 className="font-black text-lg flex items-center gap-1.5">
              <span>🌬️</span> Calm Corner
            </h1>
            <p className="text-[10px] opacity-60">Panduan Teknik Pernapasan 4-7-8 untuk Meredakan Cemas</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-6 w-full max-w-sm text-center space-y-6">
        {/* Intisari Teknik 4-7-8 */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            Pertolongan Pertama Cemas & Panik
          </span>
          <h2 className="text-xl font-black pt-1">
            {phase === "idle" && "Tenangkan Pikiranmu"}
            {phase === "inhale" && "Tarik Napas Perlahan..."}
            {phase === "hold" && "Tahan Napas Sejenak..."}
            {phase === "exhale" && "Hembuskan Napas Lega..."}
            {phase === "done" && "Luar Biasa, Kamu Hebat!"}
          </h2>
          <p className="text-xs opacity-70 leading-relaxed max-w-xs mx-auto">
            {phase === "idle" && "Tarik napas 4 detik, tahan 7 detik, dan hembuskan 8 detik untuk mengaktifkan saraf penenang."}
            {phase !== "idle" && phase !== "done" && current?.label}
            {phase === "done" && "Tubuh dan pikiranmu kini lebih rileks. Ulangi kapan pun kamu merasa gelisah."}
          </p>
        </div>

        {/* Breathing Circle Container with Smooth Scale Animation */}
        <div className="relative flex items-center justify-center my-4 py-8">
          {/* Animated Background Glow */}
          <div className={`w-52 h-52 rounded-full bg-gradient-to-br shadow-2xl flex items-center justify-center transition-all duration-1000 ease-in-out ${
            phase === "idle"
              ? "from-sky-300 to-blue-400 scale-100"
              : phase === "done"
              ? "from-emerald-400 to-teal-500 scale-110"
              : `${current?.color} ${current?.scale}`
          }`}>
            <div className="text-center text-white px-4">
              {phase === "idle" && (
                <div className="space-y-1">
                  <span className="text-5xl block animate-bounce">🌬️</span>
                  <span className="text-xs font-black uppercase tracking-wider block">Siap Rileks?</span>
                </div>
              )}
              {phase === "done" && (
                <div className="space-y-1">
                  <span className="text-5xl block">💖</span>
                  <span className="text-xs font-black uppercase tracking-wider block">Selesai 4 Siklus</span>
                </div>
              )}
              {current && phase !== "idle" && phase !== "done" && (
                <div className="space-y-0.5">
                  <div className="text-5xl font-black drop-shadow-md">{timer}</div>
                  <div className="text-xs font-black uppercase tracking-widest opacity-90 drop-shadow-sm">
                    Detik
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pulse Ring when Active */}
          {phase !== "idle" && phase !== "done" && (
            <div className="absolute w-64 h-64 rounded-full border-4 border-sky-400/40 opacity-40 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Siklus Counter Indicator (1 - 4) */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold opacity-60">Kemajuan Siklus Pernapasan:</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black transition-all shadow-sm ${
                  cycleCount >= n
                    ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white scale-105"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-500 border border-gray-700"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}
              >
                {cycleCount >= n ? "✓" : n}
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2 w-full space-y-2">
          {phase === "idle" ? (
            <button
              onClick={startBreathing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white font-black text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Latihan Pernapasan (4 Siklus)</span>
            </button>
          ) : (
            <button
              onClick={stopBreathing}
              className="w-full py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hentikan / Ulangi dari Awal</span>
            </button>
          )}

          {/* Afirmasi Ketenangan */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-sky-100 dark:border-gray-800 text-[11px] leading-relaxed italic opacity-80">
            "Kecemasan ini sementara. Tarik napas, hembuskan rasa takutmu, dan kembalilah ke saat ini." 🌸
          </div>
        </div>
      </div>
    </div>
  );
}
