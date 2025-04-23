import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../providers/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio"; 
import { SkipNavLink, SkipNavContent } from "@/components/ui/skip-nav";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  PieChart,
  Layers,
  XCircle,
  Contrast,
  ImageIcon,
  LinkIcon,
  Maximize,
  Users,
  Type,
  Table2,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Download,
  HelpCircle,
  BookOpen,
  ExternalLink
} from "lucide-react";

// Import hooks and utilities
import { useAnalysisData } from "../hooks/useAnalysisData";
import { calculateAllMetrics } from "../utils/analysisHelpers";

export default function AnalysisPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Use our custom hook to get analysis data
  const { 
    analysisData, 
    loading, 
    error, 
    fileName, 
    navigateToDetailPage 
  } = useAnalysisData();
  
  // Calculate all metrics based on analysis data
  const metrics = calculateAllMetrics(analysisData);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-lg font-medium text-foreground mb-2">Analyzing Your Poster</p>
            <p className="text-muted-foreground mb-6">We're examining accessibility features and generating detailed insights...</p>
            <Progress value={66} className="h-2 w-full" />
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
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Error Loading Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button variant="primary" onClick={() => navigate("/upload")}>
                Return to Upload Page
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function to determine status badge
  const getStatusBadge = (isSuccess) => {
    if (isSuccess) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          Pass
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          Issues
        </Badge>
      );
    }
  };

  // Calculate simple metrics for status badges with percentages and count info
  const contrastPassing = analysisData?.color_contrast?.sections && Array.isArray(analysisData.color_contrast.sections) && analysisData.color_contrast.sections.length > 0;
  const contrastPassingCount = contrastPassing ? 
    analysisData.color_contrast.sections.filter(s => s.accessibility === "PASS").length : 0;
  const contrastTotalCount = contrastPassing ? analysisData.color_contrast.sections.length : 0;
  const contrastPercentage = contrastPassing ? 
    Math.round((contrastPassingCount / contrastTotalCount) * 100) : 0;
  const contrastIsGood = contrastPercentage >= 70;
  
  const simpleLogos = analysisData?.logo_evaluation?.logos && Array.isArray(analysisData.logo_evaluation.logos) && analysisData.logo_evaluation.logos.length > 0;
  const simpleLogoCount = simpleLogos ? 
    analysisData.logo_evaluation.logos.filter(l => l.label === "Simple").length : 0;
  const logoTotalCount = simpleLogos ? analysisData.logo_evaluation.logos.length : 0;
  const simpleLogoPercentage = simpleLogos ? 
    Math.round((simpleLogoCount / logoTotalCount) * 100) : 0;
  const logosAreGood = simpleLogoPercentage >= 50;
    
  const linksExist = analysisData?.hyperlinks && Array.isArray(analysisData.hyperlinks) && analysisData.hyperlinks.length > 0;
  const validLinksCount = linksExist ? 
    analysisData.hyperlinks.filter(l => l.valid).length : 0;
  const linksTotalCount = linksExist ? analysisData.hyperlinks.length : 0;
  const validLinksPercentage = linksExist ? 
    Math.round((validLinksCount / linksTotalCount) * 100) : 0;
  const linksAreGood = validLinksPercentage >= 90;
    
  const hasResolution = analysisData?.image_resolution?.Resolution;
  const [resWidth, resHeight] = hasResolution && analysisData.image_resolution.Resolution.includes('x') ? 
    analysisData.image_resolution.Resolution.split('x').map(Number) : [0, 0];
  const goodResolution = hasResolution && resWidth >= 800 && resHeight >= 600;
  const resolutionText = hasResolution ? analysisData.image_resolution.Resolution : 'N/A';
  
  const hasAuthors = analysisData?.authors && Array.isArray(analysisData.authors) && analysisData.authors.length > 0;
  const authorCount = hasAuthors ? analysisData.authors.length : 0;
  
  const fontSizesExist = analysisData?.font_sizes && Object.keys(analysisData.font_sizes).length > 0;
  let headingFonts = 0, bodyFonts = 0, accessibleHeadings = 0, accessibleBody = 0;
  
  if (fontSizesExist) {
    Object.values(analysisData.font_sizes).forEach(font => {
      if (font.type === 'heading') {
        headingFonts++;
        if (font.font_size >= 16) accessibleHeadings++;
      } else if (font.type === 'plain_text' || font.type === 'caption') {
        bodyFonts++;
        if (font.font_size >= 12) accessibleBody++;
      }
    });
  }
  
  const totalFonts = headingFonts + bodyFonts;
  const accessibleFontsCount = accessibleHeadings + accessibleBody;
  const accessibleFontsPercentage = totalFonts > 0 ? 
    Math.round((accessibleFontsCount / totalFonts) * 100) : 0;
  const fontsAreGood = accessibleFontsPercentage >= 80;
  
  const tablesExist = analysisData?.tables && Array.isArray(analysisData.tables) && analysisData.tables.length > 0;
  const tablesWithCaptionsCount = tablesExist ? 
    analysisData.tables.filter(t => t.caption && t.caption.trim() !== '').length : 0;
  const tablesTotalCount = tablesExist ? analysisData.tables.length : 0;
  const tablesWithCaptionsPercentage = tablesExist ? 
    Math.round((tablesWithCaptionsCount / tablesTotalCount) * 100) : 0;
  const tablesAreGood = tablesWithCaptionsCount > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SkipNavLink />
      <Navbar />
      
      <main className="flex-1">
        <SkipNavContent />
        <div className="container mx-auto px-4 py-8">
          {/* Top navigation bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-border pb-4">
            <Button 
              variant="ghost" 
              className="text-primary hover:bg-primary hover:text-primary-foreground transition-colors mb-4 md:mb-0 -ml-4"
              onClick={() => navigate("/upload")}
              aria-label="Return to upload page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
            <div className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {fileName}
            </div>
          </div>
          
          {/* Summary cards - similar to old HTML summary section */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Accessibility Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Contrast className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Color Contrast</div>
                      <div className="font-bold">
                        {contrastPassing ? `${contrastPassingCount}/${contrastTotalCount} Passing` : 'No data'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Type className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Font Sizes</div>
                      <div className="font-bold">
                        {fontSizesExist ? `${accessibleFontsPercentage}% Accessible` : 'No data'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Logo Accessibility</div>
                      <div className="font-bold">
                        {simpleLogos ? `${simpleLogoCount}/${logoTotalCount} Simple` : 'No data'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Maximize className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Image Resolution</div>
                      <div className="font-bold">
                        {hasResolution ? (goodResolution ? 'Sufficient' : 'Too Low') : 'No data'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">
                Poster Component Analysis
              </CardTitle>
              <CardDescription>
                Explore each aspect of your poster's accessibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Poster Visualization */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Poster Layout
                    </h2>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <AspectRatio ratio={3/4} className="bg-muted rounded-md overflow-hidden">
                          {analysisData?.poster_layout ? (
                            <img 
                              src={analysisData.poster_layout} 
                              alt="Poster components breakdown showing different elements like text, images, and logos"
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <p className="text-muted-foreground">No layout data available</p>
                            </div>
                          )}
                        </AspectRatio>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        Component Map
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        This visualization maps the key elements of your poster. The color coding indicates:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-muted-foreground">Text elements</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">Images & diagrams</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-muted-foreground">Tables & data</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className="text-muted-foreground">Logos & branding</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Accessibility Metrics */}
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Accessibility Metrics
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Color Contrast Card - now with percentage info */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${contrastIsGood ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("contrast")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Contrast className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Color Contrast</h3>
                            <p className="text-sm text-muted-foreground mb-2">Text readability against backgrounds</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {contrastPassing ? (
                                  <div className="font-medium text-base">
                                    {contrastPassingCount}/{contrastTotalCount} sections pass
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No contrast data</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(contrastIsGood)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {contrastPassing && (
                              <div className="mt-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${contrastIsGood ? 'bg-secondary' : 'bg-destructive'}`}
                                    style={{ width: `${contrastPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{contrastPercentage}% Pass WCAG Standards</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Logo Evaluation */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${logosAreGood ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("logo")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Logos Analysis</h3>
                            <p className="text-sm text-muted-foreground mb-2">Clarity and readability of logos</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {simpleLogos ? (
                                  <div className="font-medium text-base">
                                    {simpleLogoCount}/{logoTotalCount} simple logos
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No logo data</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(logosAreGood)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {simpleLogos && (
                              <div className="mt-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${logosAreGood ? 'bg-secondary' : 'bg-destructive'}`}
                                    style={{ width: `${simpleLogoPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{simpleLogoPercentage}% Simple & Accessible</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Hyperlinks */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${linksAreGood ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("hyperlinks")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Hyperlinks</h3>
                            <p className="text-sm text-muted-foreground mb-2">Validity of URLs and references</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {linksExist ? (
                                  <div className="font-medium text-base">
                                    {validLinksCount}/{linksTotalCount} working links
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No hyperlinks found</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(linksAreGood)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {linksExist && (
                              <div className="mt-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${linksAreGood ? 'bg-secondary' : 'bg-destructive'}`}
                                    style={{ width: `${validLinksPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{validLinksPercentage}% Valid URLs</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Resolution */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${goodResolution ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("resolution")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Maximize className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Resolution</h3>
                            <p className="text-sm text-muted-foreground mb-2">Image quality and display clarity</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {hasResolution ? (
                                  <div className="font-medium text-base">
                                    {resolutionText}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No resolution data</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(goodResolution)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {hasResolution && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {goodResolution ? 
                                  "Meets minimum recommended resolution (800×600)" : 
                                  "Below recommended resolution for clear display"}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Authors */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${hasAuthors ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("authors")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Authors</h3>
                            <p className="text-sm text-muted-foreground mb-2">Author information and contacts</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {hasAuthors ? (
                                  <div className="font-medium text-base">
                                    {authorCount} {authorCount === 1 ? 'author' : 'authors'} found
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No authors found</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(hasAuthors)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {hasAuthors && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Author information improves accessibility and attribution
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Font Sizes */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${fontsAreGood ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("fonts")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Type className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Font Analysis</h3>
                            <p className="text-sm text-muted-foreground mb-2">Text size and readability</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {fontSizesExist ? (
                                  <div className="font-medium text-base">
                                    {accessibleFontsCount}/{totalFonts} accessible sizes
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No font data</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(fontsAreGood)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {fontSizesExist && (
                              <div className="mt-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${fontsAreGood ? 'bg-secondary' : 'bg-destructive'}`}
                                    style={{ width: `${accessibleFontsPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{accessibleFontsPercentage}% Meet size guidelines</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Tables */}
                    <Card 
                      className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${tablesAreGood ? 'border-l-secondary' : 'border-l-destructive'}`}
                      onClick={() => navigateToDetailPage("tables")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Table2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-foreground">Tables</h3>
                            <p className="text-sm text-muted-foreground mb-2">Tabular data accessibility</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {tablesExist ? (
                                  <div className="font-medium text-base">
                                    {tablesWithCaptionsCount}/{tablesTotalCount} with captions
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">No tables found</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(tablesAreGood)}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                            
                            {tablesExist && (
                              <div className="mt-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${tablesAreGood ? 'bg-secondary' : 'bg-destructive'}`}
                                    style={{ width: `${tablesWithCaptionsPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{tablesWithCaptionsPercentage}% Include proper captions</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Click any card above for detailed analysis
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Generate Report
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download a PDF report with all analysis details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}