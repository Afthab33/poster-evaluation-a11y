import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to fetch and manage analysis data
 * @returns {Object} Analysis data and state
 */
export function useAnalysisData() {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("Poster Analysis");

  useEffect(() => {
    // Fetch analysis data from sessionStorage
    try {
      const storedData = sessionStorage.getItem("analysisData");
      const storedFileName = sessionStorage.getItem("originalFileName");
      
      if (storedData) {
        setAnalysisData(JSON.parse(storedData));
      } else {
        setError("No analysis data found. Please upload a poster first.");
      }
      
      if (storedFileName) {
        setFileName(storedFileName);
      }
      
    } catch (err) {
      console.error("Error loading analysis data:", err);
      setError("Error loading analysis data. Please try uploading your poster again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigate to detail pages
  // Suggestion for implementation in /src/pages/analysis/hooks/useAnalysisData.js
  const navigateToDetailPage = (pageType) => {
    switch (pageType) {
      case 'fonts':
        navigate('/analysis/fonts');
        break;
      case 'contrast':
        navigate('/analysis/contrast');
        break;
      case 'logo':
        navigate('/analysis/logo');
        break;
      case 'diagram':
        navigate('/analysis/diagram');
        break;
      case 'authors':
        navigate('/analysis/authors');
        break;
      case 'hyperlinks':
        navigate('/analysis/hyperlinks');
        break;
      case 'resolution':
        navigate('/analysis/resolution');
        break;
      case 'tables':
        navigate('/analysis/tables');
        break;
      default:
        navigate('/analysis');
    }
  };

  return {
    analysisData,
    loading,
    error,
    fileName,
    navigateToDetailPage
  };
}