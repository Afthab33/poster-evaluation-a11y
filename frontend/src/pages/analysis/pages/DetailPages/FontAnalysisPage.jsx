import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MetricsSidebar from "@/components/MetricsSidebar";
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
  Check,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Type,
  Info,
  Table2
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
        <div className="bg-green-500/10 border-l-2 border-l-green-500 p-2 rounded-md mt-2">
          <h4 className="flex items-center gap-1 font-medium text-xs mb-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Why this font size is accessible
          </h4>
          <ul className="list-disc pl-4 text-muted-foreground text-xs space-y-0.5">
            <li>The font size ({fontSize.toFixed(2)}pt) exceeds the minimum of {MIN_ACCESSIBLE_FONT}pt</li>
            <li>Improves readability and reduces eye strain</li>
            <li>Supports users with mild visual impairments</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="bg-destructive/10 border-l-2 border-l-destructive p-2 rounded-md mt-2">
          <h4 className="flex items-center gap-1 font-medium text-xs mb-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            Why this font size needs improvement
          </h4>
          <ul className="list-disc pl-4 text-muted-foreground text-xs space-y-0.5">
            <li>Current size ({fontSize.toFixed(2)}pt) is {(MIN_ACCESSIBLE_FONT - fontSize).toFixed(1)}pt too small</li>
            <li>Small text is hard to read for many users</li>
            <li>Suggestions:
              <ul className="list-disc pl-3 mt-0.5 space-y-0.5">
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
        <Badge className="bg-secondary text-white flex items-center gap-1 text-[10px] py-0 px-1.5">
          <Check className="h-2.5 w-2.5" />
          Accessible
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
          <X className="h-2.5 w-2.5" />
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
            <CardContent className="py-8">
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
            <CardContent className="py-8">
              <div className="text-center">
                <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading Analysis</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
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
      <MetricsSidebar />
      
      <main className="flex-1 py-4">
        <div className="container mx-auto px-3 pl-[60px]">
          {/* Top navigation */}
          <div className="mb-3 flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="-ml-2 flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors text-sm px-2"
              onClick={() => navigate("/analysis")}
              aria-label="Return to analysis page"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            
            {/* Metrics navigation dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1 h-8 text-xs">
                  <Type className="h-3 w-3 text-primary" />
                  <span>Switch Metric</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/analysis/contrast")}>
                  <span className="text-xs">Color Contrast</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/logo")}>
                  <span className="text-xs">Logo Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/hyperlinks")}>
                  <span className="text-xs">Hyperlinks</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/resolution")}>
                  <span className="text-xs">Resolution</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/authors")}>
                  <span className="text-xs">Authors</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-xs">Font Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/tables")}>
                  <span className="text-xs">Tables</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/diagrams")}>
                  <span className="text-xs">Diagrams</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold text-primary">
                  Font Accessibility Evaluation
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-3">
              <Tabs 
                value={activeView} 
                onValueChange={setActiveView} 
                className="w-full mb-3"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="depth">In-Depth Analysis</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {activeView === "overview" ? (
                <Card className="mb-3">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-1.5 text-xs">Section</TableHead>
                          <TableHead className="py-1.5 text-xs">Type</TableHead>
                          <TableHead className="py-1.5 text-xs">Font Size</TableHead>
                          <TableHead className="py-1.5 text-xs">Status</TableHead>
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
                              <TableCell className="font-medium py-1 text-xs">{key.replace(/_/g, ' ')}</TableCell>
                              <TableCell className="py-1 text-xs">{data.type}</TableCell>
                              <TableCell className="py-1 text-xs">{fontSize.toFixed(2)}pt</TableCell>
                              <TableCell className="py-1">{renderStatusBadge(accessible)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline"
                      onClick={goToPrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Previous
                    </Button>
                    
                    <span className="text-muted-foreground text-xs font-medium">
                      Section {currentIndex + 1} of {keys.length}
                    </span>
                    
                    <Button 
                      variant="outline"
                      onClick={goToNext}
                      disabled={currentIndex === keys.length - 1}
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Card className="overflow-hidden shadow-sm">
                    <CardHeader className="py-2 px-3 bg-muted border-b border-border">
                      <CardTitle className="text-sm font-semibold">
                        {currentKey && currentKey.replace(/_/g, ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                        {/* Font Sample Image */}
                        <div className="bg-white p-2 rounded-md shadow-sm border border-border">
                          <figure className="flex flex-col items-center">
                          <img 
                              src={
                                currentFont.img
                                  ? `https://poster-evaluation-a11y-795777136792.us-central1.run.app/${currentFont.img}`
                                  : '/placeholder.png'
                              }
                              alt={`Font sample for ${currentKey}`}
                              className="max-w-full max-h-[180px] object-contain rounded-md"
                              onError={(e) => {
                                console.error("Image failed to load:", e.target.src);
                                e.target.onerror = null;
                                e.target.src = '/placeholder.png';
                                e.target.alt = 'Image not available';
                              }}
                            />
                            <figcaption className="mt-2 text-xs text-muted-foreground">
                              {currentKey && currentKey.replace(/_/g, ' ')}
                            </figcaption>
                          </figure>
                        </div>
                        
                        {/* Font Metrics */}
                        <div className="bg-muted/30 rounded-md p-3">
                          <div className="space-y-2">
                            <div className="flex items-center bg-white rounded-md p-2 shadow-sm">
                              <span className="text-muted-foreground text-xs w-24">Font Size</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm">{currentFontSize.toFixed(2)}pt</span>
                                {renderStatusBadge(currentFontAccessible)}
                              </div>
                            </div>
                            
                            <div className="flex items-center bg-white rounded-md p-2 shadow-sm">
                              <span className="text-muted-foreground text-xs w-24">Type</span>
                              <span className="font-medium text-sm">{currentFont.type}</span>
                            </div>
                            
                            {createFeedback(currentFontSize, currentFontAccessible)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pagination controls for navigating between metrics */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors h-7 text-xs"
              onClick={() => navigate("/analysis/authors")}
            >
              <ChevronLeft className="h-3 w-3" />
              Authors
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors h-7 text-xs"
              onClick={() => navigate("/analysis/tables")}
            >
              Tables
              <Table2 className="h-3 w-3 ml-1" />
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}