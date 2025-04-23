/**
 * Determine the badge color based on status
 * @param {String} status - The status text
 * @returns {String} CSS class or color value
 */
export function getStatusColor(status) {
    if (!status) return "bg-muted";
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('pass') || statusLower.includes('good')) {
      return "text-secondary";
    } else if (statusLower.includes('moderate') || statusLower.includes('warn')) {
      return "text-amber-500";
    } else {
      return "text-destructive";
    }
  }
  
  /**
   * Format DPI for display with appropriate context
   * @param {Number} dpi - DPI value
   * @returns {String} Formatted display text
   */
  export function formatDpi(dpi) {
    if (!dpi) return "No DPI data";
    
    if (dpi >= 300) {
      return `${dpi} DPI (Excellent)`;
    } else if (dpi >= 150) {
      return `${dpi} DPI (Good)`;
    } else if (dpi >= 100) {
      return `${dpi} DPI (Fair)`;
    } else {
      return `${dpi} DPI (Poor)`;
    }
  }
  
  /**
   * Format percentage for display
   * @param {Number} percentage - Percentage value
   * @returns {String} Formatted percentage
   */
  export function formatPercentage(percentage) {
    return `${Math.round(percentage)}%`;
  }