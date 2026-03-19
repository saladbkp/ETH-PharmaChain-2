/**
 * MAL Number Generator Utility
 * Format: MAL + YYYY + 5-digit sequence + checksum
 * Example: MAL202600001A
 */

/**
 * Generate a MAL number with checksum
 * @param {number} currentYear - The current year (e.g., 2026)
 * @param {number} sequence - The sequence number for this year
 * @returns {string} - Generated MAL number
 */
function generateMALNumber(currentYear, sequence) {
  const malWithoutChecksum = `MAL${currentYear}${String(sequence).padStart(5, '0')}`;
  const checksum = calculateChecksum(malWithoutChecksum);
  return malWithoutChecksum + checksum;
}

/**
 * Calculate checksum for MAL number
 * Sum of character codes mod 26 -> A-Z
 * @param {string} malWithoutChecksum - MAL number without checksum
 * @returns {string} - Single uppercase letter checksum
 */
function calculateChecksum(malWithoutChecksum) {
  let sum = 0;
  for (let i = 0; i < malWithoutChecksum.length; i++) {
    sum += malWithoutChecksum.charCodeAt(i);
  }
  return String.fromCharCode(65 + (sum % 26)); // A-Z
}

/**
 * Validate MAL number format and checksum
 * @param {string} malNumber - MAL number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateMALNumber(malNumber) {
  // Check format: MAL + YYYY + 5 digits + 1 letter
  const pattern = /^MAL\d{4}\d{5}[A-Z]$/;
  if (!pattern.test(malNumber)) {
    return false;
  }

  // Verify checksum
  const withoutChecksum = malNumber.slice(0, -1);
  const expectedChecksum = calculateChecksum(withoutChecksum);
  return malNumber.slice(-1) === expectedChecksum;
}

/**
 * Extract year from MAL number
 * @param {string} malNumber - Valid MAL number
 * @returns {number|null} - Year or null if invalid
 */
function extractYear(malNumber) {
  if (!validateMALNumber(malNumber)) {
    return null;
  }
  const yearStr = malNumber.substring(3, 7);
  return parseInt(yearStr, 10);
}

/**
 * Extract sequence number from MAL number
 * @param {string} malNumber - Valid MAL number
 * @returns {number|null} - Sequence number or null if invalid
 */
function extractSequence(malNumber) {
  if (!validateMALNumber(malNumber)) {
    return null;
  }
  const seqStr = malNumber.substring(7, 12);
  return parseInt(seqStr, 10);
}

/**
 * Get next sequence number for a given year
 * @param {Array} existingMeds - Array of existing medicines with MAL numbers
 * @param {number} year - Year to get sequence for
 * @returns {number} - Next sequence number
 */
function getNextSequence(existingMeds, year) {
  const yearMeds = existingMeds.filter(med => {
    if (!med.malNumber) return false;
    const medYear = extractYear(med.malNumber);
    return medYear === year;
  });

  if (yearMeds.length === 0) {
    return 1;
  }

  const maxSequence = yearMeds.reduce((max, med) => {
    const seq = extractSequence(med.malNumber);
    return seq > max ? seq : max;
  }, 0);

  return maxSequence + 1;
}

module.exports = {
  generateMALNumber,
  validateMALNumber,
  extractYear,
  extractSequence,
  getNextSequence,
  calculateChecksum
};
