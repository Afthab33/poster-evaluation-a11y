/**
 * Calculate and evaluate metrics from analysis data
 */

/**
 * Calculates summary metrics for color contrast
 * @param {Object} colorContrast - Color contrast data
 * @returns {Object} Contrast metrics
 */
export function calculateContrastMetrics(colorContrast) {
    if (!colorContrast?.sections?.length) {
      return { status: "No Data", percentage: 0, passCount: 0, totalCount: 0 };
    }
    
    const sections = colorContrast.sections;
    const passCount = sections.filter(s => s.status === "Pass").length;
    const totalCount = sections.length;
    const percentage = Math.round((passCount / totalCount) * 100);
    
    const status = percentage > 70 
      ? "Pass" 
      : percentage >= 50 
        ? "Moderate" 
        : "Needs Improvement";
    
    return {
      status,
      percentage,
      passCount,
      totalCount
    };
  }
  
  /**
   * Calculates summary metrics for font sizes
   * @param {Object} fontSizes - Font size data
   * @returns {Object} Font metrics
   */
  export function calculateFontMetrics(fontSizes) {
    if (!fontSizes) {
      return { status: "No Data", titleSize: 0, bodySize: 0 };
    }
    
    const titleSize = fontSizes.title_font_size || 0;
    const bodySize = fontSizes.body_font_size || 0;
    
    const status = titleSize >= 24 && bodySize >= 12
      ? "Pass"
      : "Needs Improvement";
    
    return {
      status,
      titleSize,
      bodySize
    };
  }
  
  /**
   * Calculates summary metrics for logo accessibility
   * @param {Object} logoEvaluation - Logo evaluation data
   * @returns {Object} Logo metrics
   */
  export function calculateLogoMetrics(logoEvaluation) {
    if (!logoEvaluation?.logos?.length) {
      return { status: "No Data", percentage: 0, simpleCount: 0, totalCount: 0 };
    }
    
    const logos = logoEvaluation.logos;
    const simpleLogos = logos.filter(l => l.complexity_level === "Low").length;
    const percentage = Math.round((simpleLogos / logos.length) * 100);
    
    const status = percentage > 60
      ? "Pass"
      : "Needs Improvement";
    
    return {
      status,
      percentage,
      simpleCount: simpleLogos,
      totalCount: logos.length
    };
  }
  
  /**
   * Calculates summary metrics for image resolution
   * @param {Object} resolution - Resolution data
   * @returns {Object} Resolution metrics
   */
  export function calculateResolutionMetrics(resolution) {
    if (!resolution) {
      return { status: "No Data", dpi: 0, resolution: "0x0" };
    }
    
    const dpi = resolution.DPI || 0;
    const resolutionText = resolution.Resolution || "0x0";
    
    let status = "Low";
    if (dpi >= 150) {
      status = "Pass";
    } else if (dpi >= 100) {
      status = "Moderate";
    }
    
    return {
      status,
      dpi,
      resolution: resolutionText
    };
  }
  
  /**
   * Extracts all summaries from analysis data
   * @param {Object} analysisData - Complete analysis data
   * @returns {Object} All summary metrics
   */
  export function calculateAllMetrics(analysisData) {
    if (!analysisData) return {};
    
    return {
      contrast: calculateContrastMetrics(analysisData.color_contrast),
      font: calculateFontMetrics(analysisData.font_sizes),
      logo: calculateLogoMetrics(analysisData.logo_evaluation),
      resolution: calculateResolutionMetrics(analysisData.image_resolution)
    };
  }