import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MetricsSidebar from "@/components/MetricsSidebar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keys, setKeys] = useState([]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyNavigation = (e) => {
      if (activeTab !== "details") return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (keys.length && currentIndex < keys.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }
    };
    
    document.addEventListener("keydown", handleKeyNavigation);
    return () => document.removeEventListener("keydown", handleKeyNavigation);
  }, [activeTab, currentIndex, keys]);

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
      
      // Sort font sizes - put inaccessible ones first
      const processedFontData = {...analysisData.font_sizes};
      const sortedKeys = Object.keys(processedFontData).sort((a, b) => {
        const aAccessible = Number(processedFontData[a].font_size) >= MIN_ACCESSIBLE_FONT;
        const bAccessible = Number(processedFontData[b].font_size) >= MIN_ACCESSIBLE_FONT;
        
        // Sort inaccessible first
        if (!aAccessible && bAccessible) return -1;
        if (aAccessible && !bAccessible) return 1;
        
        // Then sort by size (smallest first)
        return Number(processedFontData[a].font_size) - Number(processedFontData[b].font_size);
      });
      
      setFontData(processedFontData);
      setKeys(sortedKeys);
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

  // Navigate to previous/next section
  const navigateSection = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < keys.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Calculate metrics
  const getFontMetrics = () => {
    if (!keys.length) {
      return { passCount: 0, failCount: 0, totalCount: 0, passPercentage: 0 };
    }
    
    const totalCount = keys.length;
    const passCount = keys.filter(key => isAccessible(fontData[key].font_size)).length;
    
    return {
      passCount,
      failCount: totalCount - passCount,
      totalCount,
      passPercentage: Math.round((passCount / totalCount) * 100)
    };
  };
  
  const metrics = getFontMetrics();
  const allFontsAccessible = metrics.passPercentage === 100;

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
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500 flex items-center gap-1 text-xs py-0">
          <Check className="h-2.5 w-2.5" />
          Accessible
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 text-xs py-0">
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
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-3"></div>
            <p className="text-muted-foreground text-sm">Loading font analysis...</p>
          </div>
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
        <main className="flex-1 container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            className="mb-3 -ml-2 flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
            onClick={() => navigate("/analysis")}
            aria-label="Return to analysis page"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
          
          <Card className="max-w-lg mx-auto">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                <XCircle className="h-5 w-5" />
                Error Loading Font Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <p className="text-muted-foreground mb-4 text-sm">{error}</p>
              <Button variant="primary" onClick={() => navigate("/analysis")}>
                Return to Analysis Page
              </Button>
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
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-3 -ml-2 flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
            onClick={() => navigate("/analysis")}
            aria-label="Return to analysis page"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
          
          <Card className="mb-4">
            <CardHeader className="border-b border-border py-3 px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Type className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">
                      Font Accessibility Evaluation
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Evaluating font sizes based on accessibility standards
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="text-center px-3 py-1 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-base font-bold text-secondary">
                      {metrics.passPercentage}%
                    </div>
                  </div>
                  
                  <div className="text-center px-3 py-1 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Accessible</div>
                    <div className="text-base font-bold text-secondary">
                      {metrics.passCount}/{metrics.totalCount}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="py-3 px-4">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {/* Summary Panel */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        Font Size Compliance: {metrics.passCount} of {metrics.totalCount} sections pass
                      </h3>
                    </div>
                    
                    {/* Congratulatory message for all passing */}
                    {allFontsAccessible ? (
                      <Alert className="bg-green-500/10 border-green-500 py-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <AlertTitle className="text-sm">Excellent Font Sizes</AlertTitle>
                        <AlertDescription className="mt-1 text-xs">
                          All text sections in your poster use font sizes that meet accessibility standards (≥ {MIN_ACCESSIBLE_FONT}pt). This ensures good readability for viewers with visual impairments.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-amber-500/10 border-amber-500 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <AlertTitle className="text-sm">Font Size Improvements Needed</AlertTitle>
                        <AlertDescription className="mt-1 text-xs">
                          {metrics.failCount} section(s) in your poster use font sizes smaller than the recommended minimum of {MIN_ACCESSIBLE_FONT}pt. Consider increasing these font sizes for better accessibility.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Font standards explanation */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Info className="h-4 w-4 text-primary" />
                        Font Size Standards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-2">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-primary/10">
                            <th className="text-left p-1.5">Type</th>
                            <th className="text-left p-1.5">Recommended Size</th>
                            <th className="text-left p-1.5">Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border">
                            <td className="p-1.5">Body Text</td>
                            <td className="p-1.5">≥ 14pt</td>
                            <td className="p-1.5">Main content readability</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="p-1.5">Headers</td>
                            <td className="p-1.5">≥ 18pt</td>
                            <td className="p-1.5">Section titles, emphasis</td>
                          </tr>
                          <tr>
                            <td className="p-1.5">Captions</td>
                            <td className="p-1.5">≥ 14pt</td>
                            <td className="p-1.5">Image descriptions, footnotes</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div className="mt-2 flex items-center gap-1 bg-muted/50 p-2 rounded-md">
                        <Info className="h-3 w-3 text-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Font sizes below 14pt can be difficult to read for many viewers, especially those with visual impairments.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Section table */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">All Font Sections</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="rounded-md border">
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
                            {keys.map((key, index) => {
                              const data = fontData[key];
                              const fontSize = Number(data.font_size) || 0;
                              const accessible = isAccessible(fontSize);
                              
                              return (
                                <TableRow 
                                  key={key} 
                                  className="cursor-pointer hover:bg-muted/40"
                                  onClick={() => {
                                    setCurrentIndex(index);
                                    setActiveTab("details");
                                  }}
                                >
                                  <TableCell className="font-medium py-1.5 text-xs">{key.replace(/_/g, ' ')}</TableCell>
                                  <TableCell className="py-1.5 text-xs">{data.type}</TableCell>
                                  <TableCell className="py-1.5 text-xs">{fontSize.toFixed(2)}pt</TableCell>
                                  <TableCell className="py-1.5">{renderStatusBadge(accessible)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  {keys.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* Left column - Section list */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader className="py-2 px-3">
                            <CardTitle className="text-sm">All Sections</CardTitle>
                            <CardDescription className="text-xs">
                              {metrics.passCount} accessible sections
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ScrollArea className="h-[350px]">
                              {keys.map((key, index) => {
                                const section = fontData[key];
                                const fontSize = Number(section.font_size) || 0;
                                const accessible = isAccessible(fontSize);
                                
                                return (
                                  <div 
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted/40 transition-colors
                                      ${index === currentIndex ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                                      ${index !== keys.length - 1 ? 'border-b border-b-border' : ''}
                                    `}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && setCurrentIndex(index)}
                                    aria-pressed={index === currentIndex}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded border flex-shrink-0 bg-muted flex items-center justify-center">
                                        <span className="text-[8px]">{fontSize.toFixed(0)}pt</span>
                                      </div>
                                      
                                      <div>
                                        <div className="font-medium text-xs">{key.replace(/_/g, ' ')}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {section.type || "Text"}
                                        </div>
                                      </div>
                                    </div>
                                    {renderStatusBadge(accessible)}
                                  </div>
                                );
                              })}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Right column - Current section details */}
                      <div className="lg:col-span-2">
                        {currentKey && (
                          <div>
                            <Card className={currentFontAccessible ? "border-green-500/20" : "border-destructive/20"}>
                              <CardHeader className={currentFontAccessible ? "py-2 px-3 bg-green-500/5" : "py-2 px-3 bg-destructive/5"}>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                                      {currentFontAccessible ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                      )}
                                    </div>
                                    <div>
                                      <CardTitle className="text-sm">{currentKey.replace(/_/g, ' ')}</CardTitle>
                                      <CardDescription className="text-xs">
                                        {currentFontAccessible ? 'Meets accessibility standards' : 'Below recommended size'}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  {renderStatusBadge(currentFontAccessible)}
                                </div>
                              </CardHeader>
                              
                              <CardContent className="py-3 px-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  {/* Font Sample Image */}
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Text Sample</div>
                                    <div className="border rounded-md overflow-hidden bg-white h-[140px] flex items-center justify-center">
                                      {currentFont && currentFont.img ? (
                                        <img 
                                          src={`https://poster-evaluation-a11y-795777136792.us-central1.run.app/${currentFont.img}`}
                                          alt={`Font sample for ${currentKey}`}
                                          className="max-w-full max-h-[130px] object-contain rounded-md"
                                          onError={(e) => {
                                            console.log("Debug - Image Error:", e.target.src);
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder.png';
                                            e.target.alt = 'Image not available';
                                          }}
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                          <Info className="h-8 w-8 mb-2 opacity-50" />
                                          <p className="text-xs text-center">No font sample available</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Font Metrics */}
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Font Details</div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between p-1.5 bg-muted rounded-md">
                                        <span className="text-xs text-muted-foreground">Font Size:</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-xs">{currentFontSize.toFixed(2)}pt</span>
                                          {currentFontAccessible ? (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 text-[10px] py-0 px-1.5">
                                              Sufficient
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="bg-destructive/10 text-destructive text-[10px] py-0 px-1.5">
                                              Too small
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between p-1.5 bg-muted rounded-md">
                                        <span className="text-xs text-muted-foreground">Type:</span>
                                        <span className="font-medium text-xs">{currentFont.type || "Text"}</span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between p-1.5 bg-muted rounded-md">
                                        <span className="text-xs text-muted-foreground">Min Required:</span>
                                        <span className="font-medium text-xs">{MIN_ACCESSIBLE_FONT}pt</span>
                                      </div>
                                      
                                      {!currentFontAccessible && (
                                        <div className="flex items-center justify-between p-1.5 bg-muted rounded-md">
                                          <span className="text-xs text-muted-foreground">Size Difference:</span>
                                          <span className="font-medium text-xs text-destructive">
                                            {(MIN_ACCESSIBLE_FONT - currentFontSize).toFixed(1)}pt too small
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Feedback card */}
                                {currentFontAccessible ? (
                                  <Card className="bg-green-500/5 border-green-500/20 mt-3">
                                    <CardHeader className="py-2 px-3">
                                      <CardTitle className="text-sm flex items-center gap-1">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                        Accessible Font Size
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-3 py-2">
                                      <p className="text-xs text-muted-foreground">
                                        This section uses a font size of {currentFontSize.toFixed(2)}pt, which meets accessibility standards. Fonts at or above {MIN_ACCESSIBLE_FONT}pt ensure text is readable by people with mild visual impairments.
                                      </p>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Card className="bg-destructive/5 border-destructive/20 mt-3">
                                    <CardHeader className="py-2 px-3">
                                      <CardTitle className="text-sm flex items-center gap-1">
                                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                        Font Size Improvement Needed
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-3 py-2">
                                      <p className="text-xs text-muted-foreground mb-2">
                                        This section uses a font size of {currentFontSize.toFixed(2)}pt, which is below the recommended minimum of {MIN_ACCESSIBLE_FONT}pt. Small text can be difficult to read for many viewers.
                                      </p>
                                      <div className="bg-muted/50 p-2 rounded-md">
                                        <h4 className="text-xs font-medium mb-1">Recommendations:</h4>
                                        <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
                                          <li>Increase font size to at least {MIN_ACCESSIBLE_FONT}pt</li>
                                          <li>Consider using a stronger font weight for better visibility</li>
                                          <li>Ensure good contrast with the background color</li>
                                        </ul>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </CardContent>
                            </Card>
                          
                            {/* Navigation controls */}
                            <div className="flex items-center justify-center mt-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateSection(-1)}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-1 h-7 text-xs"
                              >
                                <ChevronLeft className="h-3 w-3" />
                                Previous Section
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateSection(1)}
                                disabled={currentIndex === keys.length - 1}
                                className="flex items-center gap-1 h-7 text-xs"
                              >
                                Next Section
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Card className="border border-dashed">
                      <CardContent className="p-6 flex flex-col items-center justify-center">
                        <XCircle className="h-10 w-10 text-muted-foreground mb-3" />
                        <h3 className="text-base font-semibold text-foreground mb-1">
                          No Font Sections Found
                        </h3>
                        <p className="text-sm text-muted-foreground text-center">
                          No font sections were detected in the analyzed poster.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
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