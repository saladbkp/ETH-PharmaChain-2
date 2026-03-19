/**
 * PharmaChain Utility Functions
 */

/**
 * Format MAL number for better readability
 * Format: MAL 2026 00001A (with spaces)
 * @param {string} malNumber - MAL number in format MAL202600001A
 * @returns {string} - Formatted MAL number: MAL 2026 00001A
 */
export function formatMALNumber(malNumber) {
  if (!malNumber) return 'N/A';

  // MAL + 4 digit year + 5 digit sequence + 1 letter checksum
  const pattern = /^MAL(\d{4})(\d{5})([A-Z])$/;
  const match = malNumber.match(pattern);

  if (match) {
    const [, year, sequence, checksum] = match;
    return `MAL ${year} ${sequence}${checksum}`;
  }

  return malNumber;
}

/**
 * Format batch ID for display
 * @param {string} batchId - Batch ID
 * @returns {string} - Formatted batch ID
 */
export function formatBatchId(batchId) {
  if (!batchId) return 'N/A';

  // If already in formatted format, return as is
  if (batchId.includes('-')) {
    return batchId;
  }

  return batchId;
}

/**
 * Validate MAL number format
 * @param {string} malNumber - MAL number to validate
 * @returns {boolean} - True if valid
 */
export function isValidMALNumber(malNumber) {
  const pattern = /^MAL\d{4}\d{5}[A-Z]$/;
  return pattern.test(malNumber);
}

/**
 * Generate MAL number display component
 * @param {string} malNumber - MAL number
 * @returns {JSX} - Formatted MAL number component
 */
export function MALNumberDisplay({ malNumber }) {
  const formatted = formatMALNumber(malNumber);

  return (
    <span className="mal-number-formatted">
      {formatted}
    </span>
  );
}

/**
 * Generate batch ID display component
 * @param {string} batchId - Batch ID
 * @returns {JSX} - Formatted batch ID component
 */
export function BatchIdDisplay({ batchId }) {
  return (
    <span className="batch-id-display">
      {batchId}
    </span>
  );
}

export default {
  formatMALNumber,
  formatBatchId,
  isValidMALNumber,
  MALNumberDisplay,
  BatchIdDisplay
};
