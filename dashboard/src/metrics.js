// Utility functions for computing FairShift fairness metrics from raw data

/**
 * Compute Gini coefficient over an array of values (0 = perfect equity, 1 = total inequity)
 */
export function giniCoefficient(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  if (mean === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sum += Math.abs(sorted[i] - sorted[j]);
    }
  }
  return sum / (2 * n * n * mean);
}

/**
 * WES – Workload Equity Score
 * Gini coefficient of total hours worked per staff within the same role.
 * Returns per-role and overall.
 */
export function computeWES(staff, shifts) {
  const hoursById = {};
  shifts.forEach((s) => {
    hoursById[s.person_id] = (hoursById[s.person_id] || 0) + s.hours_worked + s.overtime_hours;
  });

  // Per role
  const roleHours = {};
  staff.forEach((s) => {
    if (!roleHours[s.role]) roleHours[s.role] = [];
    roleHours[s.role].push(hoursById[s.id] || 0);
  });

  const overall = giniCoefficient(Object.values(hoursById));
  const perRole = Object.fromEntries(
    Object.entries(roleHours).map(([role, hrs]) => [role, giniCoefficient(hrs)])
  );

  return { overall, perRole, hoursById };
}

/**
 * OBI – Overtime Balance Index
 * Share of total overtime absorbed by the top 20% of staff (as percentage).
 */
export function computeOBI(staff, shifts) {
  const otById = {};
  shifts.forEach((s) => {
    otById[s.person_id] = (otById[s.person_id] || 0) + s.overtime_hours;
  });

  const sorted = Object.entries(otById).sort((a, b) => b[1] - a[1]);
  const totalOT = sorted.reduce((s, [, v]) => s + v, 0);
  const top20Count = Math.ceil(sorted.length * 0.2);
  const top20OT = sorted.slice(0, top20Count).reduce((s, [, v]) => s + v, 0);
  const score = totalOT === 0 ? 0 : (top20OT / totalOT) * 100;

  // Top contributors
  const topContributors = sorted.slice(0, 10).map(([id, hours]) => ({
    id,
    name: staff.find((s) => s.id === id)?.name || id,
    role: staff.find((s) => s.id === id)?.role || '',
    hours,
  }));

  return { score, totalOT, top20Percent: score, topContributors, otById };
}

/**
 * SFR – Shift Fairness Ratio
 * Equity of undesirable (weekend/night) shift distribution. 0=unequal, 1=equal.
 */
export function computeSFR(staff, shifts) {
  const weekendById = {};
  const nightById = {};

  staff.forEach((s) => {
    weekendById[s.id] = 0;
    nightById[s.id] = 0;
  });

  shifts.forEach((s) => {
    if (s.is_weekend) weekendById[s.person_id] = (weekendById[s.person_id] || 0) + 1;
    if (s.shift_type === 'Night') nightById[s.person_id] = (nightById[s.person_id] || 0) + 1;
  });

  const weekendValues = Object.values(weekendById);
  const gini = giniCoefficient(weekendValues);
  const sfrScore = 1 - gini;

  // Weekend outliers
  const perStaff = staff.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    weekends: weekendById[s.id] || 0,
    nights: nightById[s.id] || 0,
  })).sort((a, b) => b.weekends - a.weekends);

  return { score: sfrScore, gini, perStaff, weekendById, nightById };
}

/**
 * CPI – Compensation Parity Index
 * Average normalized standard deviation of base pay within each role.
 */
export function computeCPI(staff) {
  const roleMap = {};
  staff.forEach((s) => {
    if (!roleMap[s.role]) roleMap[s.role] = [];
    roleMap[s.role].push(s.base_pay);
  });

  const perRole = {};
  let totalCV = 0;
  const roleCount = Object.keys(roleMap).length;

  Object.entries(roleMap).forEach(([role, pays]) => {
    const avg = pays.reduce((a, b) => a + b, 0) / pays.length;
    const variance = pays.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pays.length;
    const stddev = Math.sqrt(variance);
    const cv = avg === 0 ? 0 : stddev / avg;
    perRole[role] = { avg, stddev, cv, min: Math.min(...pays), max: Math.max(...pays) };
    totalCV += cv;
  });

  return { score: totalCV / roleCount, perRole };
}

/**
 * BRS – Burnout Risk Score (0-100)
 * Composite: overtime percentage + consecutive-day proxy + off-hour shift ratio.
 */
export function computeBRS(staff, shifts) {
  const otById = {};
  const totalShiftsById = {};
  const nightById = {};
  const weekendById = {};

  shifts.forEach((s) => {
    totalShiftsById[s.person_id] = (totalShiftsById[s.person_id] || 0) + 1;
    if (s.overtime_hours > 0) otById[s.person_id] = (otById[s.person_id] || 0) + 1;
    if (s.shift_type === 'Night') nightById[s.person_id] = (nightById[s.person_id] || 0) + 1;
    if (s.is_weekend) weekendById[s.person_id] = (weekendById[s.person_id] || 0) + 1;
  });

  const perStaff = staff.map((s) => {
    const total = totalShiftsById[s.id] || 1;
    const otRate = (otById[s.id] || 0) / total;
    const nightRate = (nightById[s.id] || 0) / total;
    const weekendRate = (weekendById[s.id] || 0) / total;
    const brs = Math.min(100, Math.round((otRate * 50 + nightRate * 30 + weekendRate * 20) * 100));
    return { ...s, brs, otRate, nightRate, weekendRate };
  }).sort((a, b) => b.brs - a.brs);

  const avgBRS = perStaff.reduce((a, b) => a + b.brs, 0) / perStaff.length;

  return { score: avgBRS, perStaff };
}
