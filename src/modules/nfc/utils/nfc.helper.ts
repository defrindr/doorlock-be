/**
 * NFC Helper Utilities
 * Contains utility functions for NFC data processing
 */

/**
 * Convert hexadecimal string to text
 * @param hexString - Hexadecimal string to convert
 * @returns Decoded text string
 */
export const hexToText = (hexString: string): string => {
  let result = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexPair = hexString.substring(i, i + 2);
    const decimalValue = parseInt(hexPair, 16);
    result += String.fromCharCode(decimalValue);
  }
  return result;
};

/**
 * Convert text string to hexadecimal
 * @param text - Text string to convert
 * @returns Hexadecimal string
 */
export const textToHex = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const hex = text.charCodeAt(i).toString(16);
    result += hex.padStart(2, '0');
  }
  return result;
};

/**
 * Check if buffer contains valid data (not all zeros)
 * @param buffer - Buffer to check
 * @returns True if buffer contains non-zero data
 */
export const hasValidData = (buffer: Buffer): boolean => {
  return !buffer.every((byte) => byte === 0);
};

/**
 * Trim trailing zeros from buffer
 * @param buffer - Buffer to trim
 * @returns Trimmed buffer
 */
export const trimBuffer = (buffer: Buffer): Buffer => {
  let lastIndex = buffer.length - 1;
  while (lastIndex >= 0 && buffer[lastIndex] === 0x00) {
    lastIndex--;
  }
  return buffer.slice(0, lastIndex + 1);
};

/**
 * Convert JSON object to buffer with padding
 * @param data - Object to convert
 * @param blockSize - Size of each block (default: 16)
 * @returns Buffer with proper padding
 */
export const jsonToBuffer = (data: any, blockSize = 16): Buffer => {
  const jsonString = JSON.stringify(data);
  const dataBuffer = Buffer.from(jsonString, 'utf8');

  // Pad to block size boundary
  const paddedSize = Math.ceil(dataBuffer.length / blockSize) * blockSize;
  const paddedBuffer = Buffer.alloc(paddedSize);
  dataBuffer.copy(paddedBuffer);

  return paddedBuffer;
};

/**
 * Parse buffer data to JSON object
 * @param buffer - Buffer containing JSON data
 * @returns Parsed JSON object or null if invalid
 */
export const bufferToJson = (buffer: Buffer): any | null => {
  try {
    const trimmedBuffer = trimBuffer(buffer);
    const jsonString = trimmedBuffer.toString('utf8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse buffer as JSON:', error);
    return null;
  }
};

/**
 * Validate UID format
 * @param uid - UID string to validate
 * @returns True if UID format is valid
 */
export const isValidUid = (uid: string): boolean => {
  // UID should be a hexadecimal string of even length
  return /^[0-9A-Fa-f]+$/.test(uid) && uid.length % 2 === 0;
};

/**
 * Format UID for display
 * @param uid - UID string
 * @returns Formatted UID with colons
 */
export const formatUid = (uid: string): string => {
  return uid
    .replace(/(.{2})/g, '$1:')
    .slice(0, -1)
    .toUpperCase();
};
