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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Contrast,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Eye,
  Copy
} from "lucide-react";

export default function ContrastAnalysisPage() {
  const navigate = useNavigate();
  const [contrastData, setContrastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedColor, setCopiedColor] = useState(null);
  
  // Keyboard navigation for sections
  useEffect(() => {
    const handleKeyNavigation = (e) => {
      if (activeTab !== "details") return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentSectionIndex > 0) {
          setCurrentSectionIndex(prev => prev - 1);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (contrastData?.sections && currentSectionIndex < contrastData.sections.length - 1) {
          setCurrentSectionIndex(prev => prev + 1);
        }
      }
    };
    
    document.addEventListener("keydown", handleKeyNavigation);
    return () => document.removeEventListener("keydown", handleKeyNavigation);
  }, [activeTab, currentSectionIndex, contrastData]);
  
  // Load data from sessionStorage
  useEffect(() => {
    try {
      const dataStr = sessionStorage.getItem('analysisData');
      if (!dataStr) {
        setError("No analysis data found. Please upload a poster first.");
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(dataStr);
      if (data.color_contrast) {
        // Map the sections to include status field based on accessibility
        if (data.color_contrast.sections) {
          data.color_contrast.sections = data.color_contrast.sections.map(section => ({
            ...section,
            status: section.accessibility === "PASS" ? "Pass" : "Fail"
          }));
          
          // Sort the failing sections first (if any)
          data.color_contrast.sections.sort((a, b) => {
            // First by status (failing first)
            if (a.status === "Fail" && b.status !== "Fail") return -1;
            if (a.status !== "Fail" && b.status === "Fail") return 1;
            
            // Then by contrast ratio (lowest first)
            return (a.contrast_ratio || 0) - (b.contrast_ratio || 0);
          });
        }
        
        setContrastData(data.color_contrast);
      } else {
        setError("No contrast analysis data found in the results.");
      }
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      setError("Failed to load contrast analysis data.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Navigate between sections
  const navigateSection = (direction) => {
    const newIndex = currentSectionIndex + direction;
    if (contrastData?.sections && newIndex >= 0 && newIndex < contrastData.sections.length) {
      setCurrentSectionIndex(newIndex);
    }
  };
  
  // Calculate metrics
  const getContrastMetrics = () => {
    if (!contrastData?.sections || contrastData.sections.length === 0) {
      return { passCount: 0, failCount: 0, totalCount: 0, passPercentage: 0 };
    }
    
    const sections = contrastData.sections;
    const passCount = sections.filter(s => s.status === "Pass").length;
    const totalCount = sections.length;
    
    return {
      passCount,
      failCount: totalCount - passCount,
      totalCount,
      passPercentage: Math.round((passCount / totalCount) * 100)
    };
  };
  
  const metrics = getContrastMetrics();
  
  // Get the current section for detailed view
  const currentSection = contrastData?.sections?.[currentSectionIndex] || null;
  
  // Helper function to render status badge
  const renderStatusBadge = (status) => {
    if (!status) return null;
    
    if (status === "Pass") {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500 flex items-center gap-1 text-xs">
          <CheckCircle className="h-3 w-3" />
          Pass
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 text-xs">
          <XCircle className="h-3 w-3" />
          Fail
        </Badge>
      );
    }
  };
  
  // Helper to get contrast grade
  const getContrastGrade = (ratio) => {
    if (!ratio) return { grade: "N/A" };
    
    if (ratio >= 7) return { grade: "AAA" };
    if (ratio >= 4.5) return { grade: "AA" };
    if (ratio >= 3) return { grade: "AA Large" };
    
    return { grade: "Fail" };
  };
  
  // Handle color copy
  const copyColorToClipboard = (colorArray) => {
    if (!colorArray) return;
    
    const colorString = `rgb(${colorArray.join(',')})`;
    navigator.clipboard.writeText(colorString)
      .then(() => {
        setCopiedColor(colorString);
        setTimeout(() => setCopiedColor(null), 2000);
      })
      .catch(err => console.error('Failed to copy color:', err));
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-3"></div>
            <p className="text-muted-foreground text-sm">Loading contrast analysis...</p>
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
                Error Loading Contrast Data
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
  
  // Check if all sections pass
  const allSectionsPass = metrics.passPercentage === 100;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Add the metrics sidebar for vertical navigation */}
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
                    <Contrast className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">
                      Color Contrast Analysis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Evaluating text readability based on WCAG standards
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
                    <div className="text-xs text-muted-foreground">Passing</div>
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
                        Contrast Compliance: {metrics.passCount} of {metrics.totalCount} sections pass
                      </h3>
                    </div>
                    
                    {/* Congratulatory message for all passing */}
                    {allSectionsPass && (
                      <Alert className="bg-green-500/10 border-green-500 py-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <AlertTitle className="text-sm">Excellent Contrast</AlertTitle>
                        <AlertDescription className="mt-1 text-xs">
                          All text sections in your poster have sufficient contrast ratios that meet WCAG standards. This ensures good readability for viewers with visual impairments.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Summary image */}
                  {contrastData?.color_contrast_summary && (
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm flex items-center gap-1">
                          <Eye className="h-4 w-4 text-primary" />
                          Contrast Visualization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                          <img 
                            src={contrastData.color_contrast_summary} 
                            alt="Visualization of contrast in the poster"
                            className="object-contain w-full h-full"
                          />
                        </AspectRatio>
                      </CardContent>
                      <CardFooter className="text-xs text-muted-foreground flex gap-1 items-center py-1 px-3">
                        <Info className="h-3 w-3 text-primary" />
                        All sections have sufficient contrast for readability
                      </CardFooter>
                    </Card>
                  )}
                  
                  {/* WCAG reference - simplified */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Info className="h-4 w-4 text-primary" />
                        WCAG Contrast Standards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-2">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-primary/10">
                            <th className="text-left p-1.5">Level</th>
                            <th className="text-left p-1.5">Normal Text</th>
                            <th className="text-left p-1.5">Large Text</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border">
                            <td className="p-1.5">AA (Minimum)</td>
                            <td className="p-1.5">4.5:1</td>
                            <td className="p-1.5">3:1</td>
                          </tr>
                          <tr>
                            <td className="p-1.5">AAA (Enhanced)</td>
                            <td className="p-1.5">7:1</td>
                            <td className="p-1.5">4.5:1</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div className="mt-2 text-xs">
                        <Button 
                          variant="link" 
                          className="text-primary p-0 h-auto text-xs"
                          onClick={() => window.open("https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html", "_blank")}
                        >
                          <span className="flex items-center gap-1">
                            Learn more about WCAG guidelines
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Section table - simplified */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">All Contrast Sections</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px] py-1.5 text-xs">Section</TableHead>
                              <TableHead className="py-1.5 text-xs">Sample</TableHead>
                              <TableHead className="py-1.5 text-xs">Contrast Ratio</TableHead>
                              <TableHead className="py-1.5 text-xs">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contrastData?.sections?.map((section, index) => {
                              const { grade } = getContrastGrade(section.contrast_ratio);
                              return (
                                <TableRow 
                                  key={index}
                                  className="cursor-pointer hover:bg-muted/40"
                                  onClick={() => {
                                    setCurrentSectionIndex(index);
                                    setActiveTab("details");
                                  }}
                                >
                                  <TableCell className="font-medium py-1.5 text-xs">Section {index + 1}</TableCell>
                                  <TableCell className="py-1.5">
                                    <div className="w-12 h-6 rounded border flex items-center justify-center"
                                      style={{
                                        backgroundColor: section.background_color ? 
                                          `rgb(${section.background_color.join(',')})` : 
                                          '#FFFFFF',
                                        color: section.text_color ? 
                                          `rgb(${section.text_color.join(',')})` : 
                                          '#000000'
                                      }}
                                    >
                                      <span className="text-[9px]">Text</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-1.5 text-xs">
                                    <div className="flex items-center gap-1">
                                      <span>{section.contrast_ratio?.toFixed(2) || "N/A"}</span>
                                      {grade !== "N/A" && (
                                        <Badge variant="outline" className={
                                          grade === "AAA" ? "bg-green-500/10 text-green-500 border-green-500 text-xs py-0" :
                                          grade === "AA" ? "bg-primary/10 text-primary border-primary text-xs py-0" :
                                          grade === "AA Large" ? "bg-amber-500/10 text-amber-500 border-amber-500 text-xs py-0" :
                                          "bg-destructive/10 text-destructive border-destructive text-xs py-0"
                                        }>
                                          {grade}
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-1.5">{renderStatusBadge(section.status)}</TableCell>
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
                  {contrastData?.sections && contrastData.sections.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* Left column - Section list */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader className="py-2 px-3">
                            <CardTitle className="text-sm">All Sections</CardTitle>
                            <CardDescription className="text-xs">
                              {metrics.passCount} passing sections
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ScrollArea className="h-[350px]">
                              {contrastData.sections.map((section, index) => {
                                return (
                                  <div 
                                    key={index}
                                    onClick={() => setCurrentSectionIndex(index)}
                                    className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted/40 transition-colors
                                      ${index === currentSectionIndex ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                                      ${index !== contrastData.sections.length - 1 ? 'border-b border-b-border' : ''}
                                    `}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && setCurrentSectionIndex(index)}
                                    aria-pressed={index === currentSectionIndex}
                                  >
                                    <div className="flex items-center gap-2">
                                      {/* Color sample */}
                                      <div className="w-6 h-6 rounded border flex-shrink-0"
                                        style={{
                                          backgroundColor: section.background_color ? 
                                            `rgb(${section.background_color.join(',')})` : 
                                            '#FFFFFF',
                                          color: section.text_color ? 
                                            `rgb(${section.text_color.join(',')})` : 
                                            '#000000'
                                        }}
                                      >
                                        <span className="text-[8px] flex items-center justify-center h-full">Aa</span>
                                      </div>
                                      
                                      <div>
                                        <div className="font-medium text-xs">Section {index + 1}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {section.contrast_ratio?.toFixed(2) || "N/A"} ratio
                                        </div>
                                      </div>
                                    </div>
                                    {renderStatusBadge(section.status)}
                                  </div>
                                );
                              })}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Right column - Current section details */}
                      <div className="lg:col-span-2">
                        {currentSection && (
                          <>
                            <Card className="border-secondary/20">
                              <CardHeader className="py-2 px-3 bg-green-500/5">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-sm">Section {currentSectionIndex + 1}</CardTitle>
                                      <CardDescription className="text-xs">
                                        Meets accessibility standards
                                      </CardDescription>
                                    </div>
                                  </div>
                                  {renderStatusBadge(currentSection.status)}
                                </div>
                              </CardHeader>
                              
                              <CardContent className="py-3 px-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  {/* Text sample */}
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Text Sample</div>
                                    <div className="aspect-ratio border rounded-md overflow-hidden">
                                      <div
                                        className="w-full h-full flex items-center justify-center p-3 text-center"
                                        style={{
                                          backgroundColor: currentSection.background_color ? 
                                            `rgb(${currentSection.background_color.join(',')})` : 
                                            '#FFFFFF',
                                          color: currentSection.text_color ? 
                                            `rgb(${currentSection.text_color.join(',')})` : 
                                            '#000000'
                                        }}
                                      >
                                        <div>
                                          <p className="font-medium mb-1 text-sm">Sample Text</p>
                                          <p className="text-xs">This is how text appears in this section</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Section image */}
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">From Poster</div>
                                    <div className="border rounded-md overflow-hidden bg-muted/30 aspect-ratio">
                                      {currentSection.section_image ? (
                                        <img 
                                          src={currentSection.section_image} 
                                          alt={`Contrast section ${currentSectionIndex + 1} from poster`} 
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <div className="h-full flex items-center justify-center p-3">
                                          <p className="text-muted-foreground text-xs text-center">
                                            No section image available
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  {/* Contrast details */}
                                  <div>
                                    <h4 className="text-xs font-medium mb-2">Contrast Details</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between p-1.5 bg-muted rounded-md">
                                        <span className="text-xs text-muted-foreground">Contrast Ratio:</span>
                                        <span className="font-medium text-xs">{currentSection.contrast_ratio?.toFixed(2) || "Unknown"}</span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between p-1.5 bg-muted rounded-md">
                                        <span className="text-xs text-muted-foreground">WCAG Grade:</span>
                                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary text-xs py-0">
                                          {getContrastGrade(currentSection.contrast_ratio).grade}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Color details */}
                                  <div>
                                    <h4 className="text-xs font-medium mb-2">Color Information</h4>
                                    <div className="space-y-2">
                                      <TooltipProvider>
                                        <div className="flex items-center gap-2 p-1.5 bg-muted rounded-md">
                                          <div className="text-xs text-muted-foreground w-16">Text Color:</div>
                                          <div className="flex items-center gap-1.5">
                                            <div 
                                              className="h-6 w-6 rounded-md border" 
                                              style={{ 
                                                backgroundColor: currentSection.text_color ? 
                                                  `rgb(${currentSection.text_color.join(',')})` : 
                                                  "#000000" 
                                              }}
                                            ></div>
                                            <div className="text-[10px] font-mono">
                                              {currentSection.text_color ? 
                                                `RGB(${currentSection.text_color.join(',')})` : 
                                                "RGB(0,0,0)"}
                                            </div>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-5 w-5 p-0"
                                                  onClick={() => copyColorToClipboard(currentSection.text_color)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs">{copiedColor ? "Copied!" : "Copy color"}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 p-1.5 bg-muted rounded-md">
                                          <div className="text-xs text-muted-foreground w-16">Background:</div>
                                          <div className="flex items-center gap-1.5">
                                            <div 
                                              className="h-6 w-6 rounded-md border" 
                                              style={{ 
                                                backgroundColor: currentSection.background_color ? 
                                                  `rgb(${currentSection.background_color.join(',')})` : 
                                                  "#FFFFFF" 
                                              }}
                                            ></div>
                                            <div className="text-[10px] font-mono">
                                              {currentSection.background_color ? 
                                                `RGB(${currentSection.background_color.join(',')})` : 
                                                "RGB(255,255,255)"}
                                            </div>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-5 w-5 p-0"
                                                  onClick={() => copyColorToClipboard(currentSection.background_color)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs">{copiedColor ? "Copied!" : "Copy color"}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </div>
                                        </div>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Success message for good contrast */}
                                <Card className="bg-green-500/5 border-green-500/20 mt-3">
                                  <CardHeader className="py-2 px-3">
                                    <CardTitle className="text-sm flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                      Good Contrast
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="px-3 py-2">
                                    <p className="text-xs text-muted-foreground">
                                      This section has a contrast ratio of {currentSection.contrast_ratio?.toFixed(2)}, which meets WCAG standards. Good contrast ensures text is readable by people with visual impairments.
                                    </p>
                                  </CardContent>
                                </Card>
                              </CardContent>
                            </Card>

                            {/* Navigation controls */}
                            <div className="flex items-center justify-center mt-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateSection(-1)}
                                disabled={currentSectionIndex === 0}
                                className="flex items-center gap-1 h-7 text-xs"
                              >
                                <ChevronLeft className="h-3 w-3" />
                                Previous Section
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateSection(1)}
                                disabled={currentSectionIndex === contrastData.sections.length - 1}
                                className="flex items-center gap-1 h-7 text-xs"
                              >
                                Next Section
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Card className="border border-dashed">
                      <CardContent className="p-6 flex flex-col items-center justify-center">
                        <XCircle className="h-10 w-10 text-muted-foreground mb-3" />
                        <h3 className="text-base font-semibold text-foreground mb-1">
                          No Contrast Sections Found
                        </h3>
                        <p className="text-sm text-muted-foreground text-center">
                          No contrast sections were detected in the analyzed poster.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}