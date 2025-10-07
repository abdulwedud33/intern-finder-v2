/**
 * Decode HTML entities in a string
 * @param str - String that may contain HTML entities
 * @returns Decoded string
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || typeof str !== 'string') return str;
  
  return str
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'");
}

/**
 * Decode HTML entities in an object recursively
 * @param obj - Object that may contain HTML entities in string values
 * @returns Object with decoded strings
 */
export function decodeHtmlEntitiesInObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(decodeHtmlEntitiesInObject);
  }
  
  const decoded: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      decoded[key] = decodeHtmlEntities(value);
    } else if (typeof value === 'object' && value !== null) {
      decoded[key] = decodeHtmlEntitiesInObject(value);
    } else {
      decoded[key] = value;
    }
  }
  
  return decoded;
}
