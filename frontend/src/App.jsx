import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'
import { ThemeProvider } from "./providers/ThemeProvider";
import HomePage from './pages/HomePage';
import PosterUploadPage from './pages/PosterUploadPage';
import AnalysisPage from './pages/analysis/pages/AnalysisPage';

// Import detail pages
import FontAnalysisPage from './pages/analysis/pages/DetailPages/FontAnalysisPage';
import ContrastAnalysisPage from './pages/analysis/pages/DetailPages/ContrastAnalysisPage';
import LogoAnalysisPage from './pages/analysis/pages/DetailPages/LogoAnalysisPage';
import DiagramAnalysisPage from './pages/analysis/pages/DetailPages/DiagramAnalysisPage';
import AuthorsAnalysisPage from './pages/analysis/pages/DetailPages/AuthorsAnalysisPage';
import HyperlinksAnalysisPage from './pages/analysis/pages/DetailPages/HyperlinksAnalysisPage';
import ResolutionAnalysisPage from './pages/analysis/pages/DetailPages/ResolutionAnalysisPage';
import TableAnalysisPage from './pages/analysis/pages/DetailPages/TableAnalysisPage';

function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<PosterUploadPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/analysis/fonts" element={<FontAnalysisPage />} />
          <Route path="/analysis/contrast" element={<ContrastAnalysisPage />} />
          <Route path="/analysis/logo" element={<LogoAnalysisPage />} />
          <Route path="/analysis/diagram" element={<DiagramAnalysisPage />} />
          <Route path="/analysis/authors" element={<AuthorsAnalysisPage />} />
          <Route path="/analysis/hyperlinks" element={<HyperlinksAnalysisPage />} />
          <Route path="/analysis/resolution" element={<ResolutionAnalysisPage />} />
          <Route path="/analysis/tables" element={<TableAnalysisPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;