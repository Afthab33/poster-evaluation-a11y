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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Type,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Contrast,
  ImageIcon,
  LinkIcon,
  Maximize,
  Users,
  Table2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function FontAnalysisPage() {
  const navigate = useNavigate();
  const [fontData, setFontData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load font data from session storage
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
      
      // Fix: Looking for font_sizes instead of font_analysis
      if (!analysisData.font_sizes || Object.keys(analysisData.font_sizes).length === 0) {
        setError("No font analysis data was found in the results.");
        setLoading(false);
        return;
      }
      
      // Convert the font_sizes object to an array of font objects
      const fontArray = Object.entries(analysisData.font_sizes).map(([key, value]) => {
        // Determine if this is a heading, body text, etc.
        const elementType = value.type === 'heading' || value.type === 'title' ? 
          'heading' : (value.type === 'plain_text' || value.type === 'caption' ? 'body' : value.type);
        
        return {
          id: key,
          element_type: elementType,
          size: value.font_size || 0,
          min_size: value.min_size || 0,
          max_size: value.max_size || 0,
          text_count: value.text_count || 0,
          image_path: value.img || null,
          sample_text: key.replace(/_/g, ' '),
          type: value.type
        };
      });
      
      // Sort by element type then by size (descending)
      fontArray.sort((a, b) => {
        if (a.element_type === b.element_type) {
          return b.size - a.size; // Descending size
        }
        // Headings first, then body text, then others
        if (a.element_type === 'heading') return -1;
        if (b.element_type === 'heading') return 1;
        if (a.element_type === 'body') return -1;
        if (b.element_type === 'body') return 1;
        return 0;
      });
      
      setFontData(fontArray);
    } catch (error) {
      console.error('Error processing font analysis data:', error);
      setError("Error processing font analysis data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    if (!fontData || !fontData.length) {
      return { 
        totalFonts: 0, 
        accessibleFonts: 0, 
        averageSize: 0,
        headingsCount: 0,
        bodyCount: 0,
        accessibleHeadings: 0,
        accessibleBody: 0,
        accessiblePercentage: 0
      };
    }

    const totalFonts = fontData.length;
    
    let headingsCount = 0;
    let bodyCount = 0;
    let accessibleHeadings = 0;
    let accessibleBody = 0;
    
    fontData.forEach(font => {
      if (font.element_type === 'heading') {
        headingsCount++;
        if (font.size >= 16) accessibleHeadings++;
      } else if (font.element_type === 'body') {
        bodyCount++;
        if (font.size >= 12) accessibleBody++;
      }
    });
    
    const accessibleFonts = accessibleHeadings + accessibleBody;
    const accessiblePercentage = Math.round((accessibleFonts / totalFonts) * 100);
    
    const totalSize = fontData.reduce((sum, font) => sum + font.size, 0);
    const averageSize = totalFonts > 0 ? Math.round(totalSize / totalFonts * 10) / 10 : 0;

    return { 
      totalFonts, 
      accessibleFonts, 
      averageSize,
      headingsCount,
      bodyCount,
      accessibleHeadings,
      accessibleBody,
      accessiblePercentage
    };
  };

  const stats = calculateStats();

  // Check if a font is accessible
  const isAccessible = (font) => {
    return (font.element_type === 'heading' && font.size >= 16) || 
           (font.element_type === 'body' && font.size >= 12) ||
           (font.element_type === 'authors' && font.size >= 12);
  };

  // Navigate to different analysis pages
  const navigateToPage = (page) => {
    navigate(`/analysis/${page}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-muted-foreground">Loading font analysis...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Add the metrics sidebar for vertical navigation */}
      <MetricsSidebar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 pl-[60px]">
          {/* Top navigation bar with metrics dropdown */}
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="-ml-4 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/analysis")}
              aria-label="Return to analysis page"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis
            </Button>
            
            {/* Metrics navigation dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                  <span>Switch Metric</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigateToPage("contrast")}>
                  <Contrast className="h-4 w-4 mr-2 text-primary" />
                  <span>Color Contrast</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateToPage("logo")}>
                  <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                  <span>Logo Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateToPage("hyperlinks")}>
                  <LinkIcon className="h-4 w-4 mr-2 text-primary" />
                  <span>Hyperlinks</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateToPage("resolution")}>
                  <Maximize className="h-4 w-4 mr-2 text-primary" />
                  <span>Resolution</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateToPage("authors")}>
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <span>Authors</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Type className="h-4 w-4 mr-2 text-primary" />
                  <span>Font Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateToPage("tables")}>
                  <Table2 className="h-4 w-4 mr-2 text-primary" />
                  <span>Tables</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateToPage("diagram")}>
                  <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                  <span>Diagrams</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="border-b border-border pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Type className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-primary">
                      Font Size Analysis
                    </CardTitle>
                    <CardDescription>
                      Evaluating text size and readability for accessibility
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-center px-4 py-2 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-lg font-bold text-secondary">
                      {stats.accessiblePercentage}%
                    </div>
                  </div>
                  
                  <div className="text-center px-4 py-2 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Accessible</div>
                    <div className="text-lg font-bold text-secondary">
                      {stats.accessibleFonts}/{stats.totalFonts}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {/* Summary Panel */}
                  <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Font Accessibility: {stats.accessibleFonts} of {stats.totalFonts} fonts meet size standards
                      </h3>
                    </div>
                    
                    {stats.accessiblePercentage >= 90 ? (
                      <Alert className="bg-secondary/10 border-secondary">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Excellent Font Sizes</AlertTitle>
                        <AlertDescription className="mt-2">
                          Nearly all text in your poster uses font sizes that meet accessibility standards. This ensures good readability for viewers with visual impairments.
                        </AlertDescription>
                      </Alert>
                    ) : stats.accessiblePercentage >= 70 ? (
                      <Alert className="bg-amber-500/10 border-amber-500">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertTitle>Mostly Accessible Font Sizes</AlertTitle>
                        <AlertDescription className="mt-2">
                          Most of your text uses accessible font sizes, but some elements might be difficult to read for viewers with visual impairments. Consider increasing the size of smaller text.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-destructive/10 border-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Font Size Concerns</AlertTitle>
                        <AlertDescription className="mt-2">
                          Many text elements in your poster use font sizes that are too small for optimal accessibility. Consider increasing these sizes to improve readability.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Type className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Font Elements</div>
                            <div className="text-xl font-bold">{stats.totalFonts}</div>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div className="h-2 bg-primary rounded-full" style={{ width: "100%" }}></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Accessible Fonts</div>
                            <div className="text-xl font-bold">{stats.accessibleFonts}</div>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div className="h-2 bg-secondary rounded-full" style={{ width: `${stats.accessiblePercentage}%` }}></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Type className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Headings</div>
                            <div className="text-xl font-bold">{stats.accessibleHeadings}/{stats.headingsCount}</div>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: stats.headingsCount > 0 ? `${(stats.accessibleHeadings / stats.headingsCount) * 100}%` : "0%" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Type className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Body Text</div>
                            <div className="text-xl font-bold">{stats.accessibleBody}/{stats.bodyCount}</div>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: stats.bodyCount > 0 ? `${(stats.accessibleBody / stats.bodyCount) * 100}%` : "0%" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Font table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Type className="h-5 w-5 text-primary" />
                        All Font Elements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Element Type</TableHead>
                              <TableHead>Font Size (pt)</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fontData.map((font, index) => {
                              const accessible = isAccessible(font);
                              return (
                                <TableRow key={index} className="hover:bg-muted/40">
                                  <TableCell className="font-medium">
                                    {font.id.replace(/_/g, ' ')}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`font-medium ${!accessible ? 'text-destructive' : ''}`}>
                                      {font.size.toFixed(1)}pt
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-primary/5 text-primary">
                                      {font.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {accessible ? (
                                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500 flex items-center gap-1">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Pass
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1">
                                        <XCircle className="h-3.5 w-3.5" />
                                        Too Small
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* WCAG guidelines section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Font Size Accessibility Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        The Web Content Accessibility Guidelines (WCAG) recommend the following for font sizes:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium">Minimum Sizes</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Body text: <strong>at least 12pt</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Headings: <strong>at least 16pt</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Captions: <strong>at least 10pt</strong></span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Best Practices</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Use relative units (em, rem) when possible</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Body text should be scalable up to 200%</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Consider enough contrast with backgrounds</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <Button 
                          variant="link" 
                          className="text-primary p-0 h-auto"
                          onClick={() => window.open("https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html", "_blank")}
                        >
                          <span className="flex items-center gap-1">
                            Learn more about WCAG text sizing guidelines
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </Button>
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
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/analysis/contrast")}
            >
              <ChevronLeft className="h-4 w-4" />
              <Contrast className="h-4 w-4 mr-1" />
              Color Contrast
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/analysis/logo")}
            >
              Logo Analysis
              <ImageIcon className="h-4 w-4 ml-1" />
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Adding missing imports
function ChevronDown(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BarChart2(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}