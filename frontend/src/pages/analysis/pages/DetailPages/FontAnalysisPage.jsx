import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function FontAnalysisPage() {
  const navigate = useNavigate();
  const MIN_ACCESSIBLE_FONT = 14.0;
  
  const [fontData, setFontData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keys, setKeys] = useState([]);

  // Load font data from sessionStorage
  useEffect(() => {
    try {
      setLoading(true);
      const analysisDataStr = sessionStorage.getItem('analysisData');
      
      if (!analysisDataStr) {
        setError("No analysis data found. Please upload a poster first.");
        setLoading(false);
        return;
      }

      const analysisData = JSON.parse(analysisDataStr);
      
      if (!analysisData.font_sizes || Object.keys(analysisData.font_sizes).length === 0) {
        setError("No font analysis data was found in the results.");
        setLoading(false);
        return;
      }
      
      setFontData(analysisData.font_sizes);
      setKeys(Object.keys(analysisData.font_sizes));
      setLoading(false);
    } catch (error) {
      console.error('Error processing font analysis data:', error);
      setError("Error processing font analysis data. Please try again.");
      setLoading(false);
    }
  }, []);

  // Check if font is accessible
  const isAccessible = (fontSize) => {
    return Number(fontSize) >= MIN_ACCESSIBLE_FONT;
  };

  // Navigate to previous section
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Navigate to next section
  const goToNext = () => {
    if (currentIndex < keys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Create feedback content based on accessibility
  const createFeedback = (fontSize, isAccessible) => {
    if (isAccessible) {
      return (
        <div className="bg-green-500/10 border-l-4 border-l-green-500 p-4 rounded-md mt-4">
          <h4 className="flex items-center gap-2 font-medium text-foreground mb-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Why this font size is accessible
          </h4>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>The font size ({fontSize.toFixed(2)}pt) exceeds the minimum of {MIN_ACCESSIBLE_FONT}pt</li>
            <li>Improves readability and reduces eye strain</li>
            <li>Supports users with mild visual impairments</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="bg-destructive/10 border-l-4 border-l-destructive p-4 rounded-md mt-4">
          <h4 className="flex items-center gap-2 font-medium text-foreground mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Why this font size needs improvement
          </h4>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>Current size ({fontSize.toFixed(2)}pt) is {(MIN_ACCESSIBLE_FONT - fontSize).toFixed(1)}pt too small</li>
            <li>Small text is hard to read for many users</li>
            <li>Suggestions:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Increase to at least {MIN_ACCESSIBLE_FONT}pt</li>
                <li>Consider stronger font weight</li>
                <li>Ensure good contrast</li>
              </ul>
            </li>
          </ul>
        </div>
      );
    }
  };

  // Render status badge
  const renderStatusBadge = (isAccessible) => {
    if (isAccessible) {
      return (
        <Badge className="bg-secondary text-white flex items-center gap-1">
          <Check className="h-3.5 w-3.5" />
          Accessible
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <X className="h-3.5 w-3.5" />
          Too Small
        </Badge>
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading font analysis...</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Analysis</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => navigate("/analysis")}>
                  Return to Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Get current font data
  const currentKey = keys[currentIndex];
  const currentFont = fontData[currentKey] || {};
  const currentFontSize = Number(currentFont.font_size) || 0;
  const currentFontAccessible = isAccessible(currentFontSize);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:-translate-x-1 mb-8"
            onClick={() => navigate("/analysis")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-10">
            Font Accessibility Evaluation
          </h1>
          
          <Tabs 
            value={activeView} 
            onValueChange={setActiveView} 
            className="w-full max-w-3xl mx-auto mb-8"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="depth">In-Depth Analysis</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeView === "overview" ? (
            <Card className="mb-10">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Font Size</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => {
                      const data = fontData[key];
                      const fontSize = Number(data.font_size) || 0;
                      const accessible = isAccessible(fontSize);
                      
                      return (
                        <TableRow 
                          key={key} 
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => {
                            setCurrentIndex(keys.indexOf(key));
                            setActiveView("depth");
                          }}
                        >
                          <TableCell className="font-medium">{key.replace(/_/g, ' ')}</TableCell>
                          <TableCell>{data.type}</TableCell>
                          <TableCell>{fontSize.toFixed(2)}pt</TableCell>
                          <TableCell>{renderStatusBadge(accessible)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary">In-Depth Analysis</h2>
              
              <div className="flex justify-between items-center mb-6">
                <Button 
                  variant="primary"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-muted-foreground font-medium">
                  Section {currentIndex + 1} of {keys.length}
                </span>
                
                <Button 
                  variant="primary"
                  onClick={goToNext}
                  disabled={currentIndex === keys.length - 1}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Card className="overflow-hidden shadow-lg">
                <CardHeader className="bg-muted border-b border-border">
                  <CardTitle className="text-xl font-semibold">
                    {currentKey && currentKey.replace(/_/g, ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Font Sample Image */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                      <figure className="flex flex-col items-center">
                      <img 
                          src={
                            currentFont.img
                              ? `https://poster-evaluation-a11y-795777136792.us-central1.run.app/${currentFont.img}`
                              : '/placeholder.png'
                          }
                          alt={`Font sample for ${currentKey}`}
                          className="max-w-full max-h-[300px] object-contain rounded-md"
                          onError={(e) => {
                            console.error("Image failed to load:", e.target.src);
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                            e.target.alt = 'Image not available';
                          }}
                        />
                        <figcaption className="mt-4 text-sm text-muted-foreground">
                          {currentKey && currentKey.replace(/_/g, ' ')}
                        </figcaption>
                      </figure>
                    </div>
                    
                    {/* Font Metrics */}
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="space-y-4">
                        <div className="flex items-center bg-white rounded-md p-4 shadow-sm">
                          <span className="text-muted-foreground font-medium w-32">Font Size</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{currentFontSize.toFixed(2)}pt</span>
                            {renderStatusBadge(currentFontAccessible)}
                          </div>
                        </div>
                        
                        <div className="flex items-center bg-white rounded-md p-4 shadow-sm">
                          <span className="text-muted-foreground font-medium w-32">Type</span>
                          <span className="font-medium">{currentFont.type}</span>
                        </div>
                        
                        {createFeedback(currentFontSize, currentFontAccessible)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}