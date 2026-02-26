// Utility functions for safe JSON parsing
export function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

export function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return '{}';
  }
}
