/**
 * Strip HTML tags from a string and decode HTML entities
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary div element to decode HTML entities and strip tags
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  
  // Fallback for server-side
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Truncate text to a specified length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

/**
 * Clean and truncate HTML content
 * @param html - HTML string to clean and truncate
 * @param maxLength - Maximum length for plain text
 * @returns Cleaned and truncated plain text
 */
export const cleanHtmlContent = (html: string, maxLength?: number): string => {
  const plainText = stripHtmlTags(html);
  if (maxLength) {
    return truncateText(plainText, maxLength);
  }
  return plainText;
};

/**
 * Extract plain text summary from HTML
 * @param html - HTML string
 * @param wordLimit - Number of words to limit to
 * @returns Plain text summary
 */
export const getHtmlSummary = (html: string, wordLimit: number = 30): string => {
  const plainText = stripHtmlTags(html);
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= wordLimit) {
    return plainText;
  }
  
  return words.slice(0, wordLimit).join(' ') + '...';
};