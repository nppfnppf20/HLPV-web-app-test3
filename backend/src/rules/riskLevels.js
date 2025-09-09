/**
 * CENTRALIZED RISK SCORING SYSTEM
 * 
 * Unified 0-7 risk scale used across all constraint layers:
 * - Heritage (listed buildings, conservation areas, scheduled monuments)
 * - Landscape (AONB, Green Belt)
 * - Flood risk, transport, utilities, etc.
 * 
 * Higher numbers = higher risk/more constraints
 */

export const RISK_SCORES = {
  NO_RISK: 0,
  LOW: 1,
  MEDIUM_LOW: 2,
  MEDIUM: 3,
  MEDIUM_HIGH: 4,
  HIGH: 5,
  EXTREMELY_HIGH: 6,
  SHOWSTOPPER: 7
};

export const RISK_LABELS = {
  [RISK_SCORES.NO_RISK]: 'No Risk',
  [RISK_SCORES.LOW]: 'Low',
  [RISK_SCORES.MEDIUM_LOW]: 'Medium-Low',
  [RISK_SCORES.MEDIUM]: 'Medium',
  [RISK_SCORES.MEDIUM_HIGH]: 'Medium-High',
  [RISK_SCORES.HIGH]: 'High',
  [RISK_SCORES.EXTREMELY_HIGH]: 'Extremely High',
  [RISK_SCORES.SHOWSTOPPER]: 'Showstopper'
};

export const RISK_COLORS = {
  [RISK_SCORES.NO_RISK]: '#10b981',      // Green
  [RISK_SCORES.LOW]: '#84cc16',          // Light green
  [RISK_SCORES.MEDIUM_LOW]: '#eab308',   // Yellow
  [RISK_SCORES.MEDIUM]: '#f59e0b',       // Orange
  [RISK_SCORES.MEDIUM_HIGH]: '#f97316',  // Dark orange
  [RISK_SCORES.HIGH]: '#ef4444',         // Red
  [RISK_SCORES.EXTREMELY_HIGH]: '#dc2626', // Dark red
  [RISK_SCORES.SHOWSTOPPER]: '#991b1b'   // Very dark red
};

export const RISK_DESCRIPTIONS = {
  [RISK_SCORES.NO_RISK]: 'No significant constraints identified',
  [RISK_SCORES.LOW]: 'Minimal constraints, standard mitigation measures sufficient',
  [RISK_SCORES.MEDIUM_LOW]: 'Some constraints, straightforward assessment required',
  [RISK_SCORES.MEDIUM]: 'Moderate constraints, detailed assessment and mitigation required',
  [RISK_SCORES.MEDIUM_HIGH]: 'Significant constraints, specialist input and careful design required',
  [RISK_SCORES.HIGH]: 'Major constraints, extensive specialist assessment and mitigation required',
  [RISK_SCORES.EXTREMELY_HIGH]: 'Severe constraints, fundamental design changes likely required',
  [RISK_SCORES.SHOWSTOPPER]: 'Critical constraints, development likely not viable without major redesign'
};

/**
 * Calculate overall project risk across all constraint layers
 * @param {number[]} layerRisks - Array of risk scores from different layers
 * @returns {number} Maximum risk score (highest constraint takes precedence)
 */
export function calculateOverallRisk(layerRisks) {
  const validRisks = layerRisks.filter(risk => risk !== null && risk !== undefined);
  return validRisks.length > 0 ? Math.max(...validRisks) : RISK_SCORES.NO_RISK;
}

/**
 * Get risk label by score
 * @param {number} score - Risk score (0-7)
 * @returns {string} Human-readable risk label
 */
export function getRiskLabel(score) {
  return RISK_LABELS[score] || 'Unknown';
}

/**
 * Get risk color by score
 * @param {number} score - Risk score (0-7)
 * @returns {string} CSS color value
 */
export function getRiskColor(score) {
  return RISK_COLORS[score] || '#6b7280';
}

/**
 * Get risk description by score
 * @param {number} score - Risk score (0-7)
 * @returns {string} Detailed risk description
 */
export function getRiskDescription(score) {
  return RISK_DESCRIPTIONS[score] || 'Unknown risk level';
}