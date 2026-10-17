/**
 * cyclePredictor.js — Menstrual cycle prediction for adolescent girls (3 scenarios)
 */

export function calculateCycleScenarios(startDateStr, periodDuration = 7) {
  if (!startDateStr) return null;

  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return null;

  const addDays = (baseDate, days) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Periode Haid Terakhir
  const periodEnd = addDays(start, periodDuration - 1);

  // 1. Skenario Cepat (21–24 hari)
  const cepatStart = addDays(start, 21);
  const cepatEnd = addDays(start, 24);

  // 2. Skenario Normal (28–30 hari)
  const normalStart = addDays(start, 28);
  const normalEnd = addDays(start, 30);

  // Masa Subur / Ovulasi (berdasarkan siklus normal: Hari ke-14 ± 2)
  const ovulationDay = addDays(start, 14);
  const fertileStart = addDays(start, 12);
  const fertileEnd = addDays(start, 16);

  // 3. Skenario Lambat (31–35 hari)
  const lambatStart = addDays(start, 31);
  const lambatEnd = addDays(start, 35);

  return {
    lastPeriod: {
      start: startDateStr,
      startFormatted: formatDate(start),
      endFormatted: formatDate(periodEnd),
      duration: periodDuration,
    },
    cepat: {
      label: 'Siklus Cepat (21–24 hari)',
      rangeStr: `${formatDate(cepatStart)} – ${formatDate(cepatEnd)}`,
      days: '21–24 Hari',
      color: 'border-orange-400 text-orange-600 bg-orange-50',
    },
    normal: {
      label: 'Siklus Normal (28–30 hari)',
      rangeStr: `${formatDate(normalStart)} – ${formatDate(normalEnd)}`,
      days: '28–30 Hari',
      color: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    },
    lambat: {
      label: 'Siklus Lambat (31–35 hari)',
      rangeStr: `${formatDate(lambatStart)} – ${formatDate(lambatEnd)}`,
      days: '31–35 Hari',
      color: 'border-sky-500 text-sky-700 bg-sky-50',
    },
    fertile: {
      label: 'Perkiraan Masa Subur (Ovulasi)',
      rangeStr: `${formatDate(fertileStart)} – ${formatDate(fertileEnd)}`,
      peakStr: formatDate(ovulationDay),
      color: 'border-amber-400 text-amber-800 bg-amber-50',
    },
  };
}
