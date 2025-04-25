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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ImageIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function LogoAnalysisPage() {
  const navigate = useNavigate();
  const [logoData, setLogoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Load data from sessionStorage
  useEffect(() => {
    setLoading(true);
    try {
      const dataStr = sessionStorage.getItem('analysisData');
      if (!dataStr) {
        setError("No analysis data found. Please upload a poster first.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(dataStr);
      if (!data.logo_evaluation || !data.logo_evaluation.logos) {
        setError("No logo analysis data found in the results.");
        setLoading(false);
        return;
      }

      setLogoData(data.logo_evaluation);
    } catch (error) {
      console.error('Error processing logo data:', error);
      setError("Failed to process logo analysis data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle navigation between logos
  const navigateLogo = (direction) => {
    if (!logoData || !logoData.logos) return;
    
    const newIndex = currentLogoIndex + direction;
    if (newIndex >= 0 && newIndex < logoData.logos.length) {
      setCurrentLogoIndex(newIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyNavigation = (e) => {
      if (activeTab !== "details") return;
      
      if (e.key === "ArrowLeft") {
        navigateLogo(-1);
      } else if (e.key === "ArrowRight") {
        navigateLogo(1);
      }
    };
    
    document.addEventListener("keydown", handleKeyNavigation);
    return () => document.removeEventListener("keydown", handleKeyNavigation);
  }, [activeTab, currentLogoIndex, logoData]);

  // Calculate statistics
  const getLogoStats = () => {
    if (!logoData || !logoData.logos) {
      return { total: 0, simple: 0, complex: 0 };
    }
    
    const total = logoData.logos.length;
    const simple = logoData.logos.filter(logo => logo.label === "Simple").length;
    const complex = total - simple;
    
    return { total, simple, complex };
  };

  const stats = getLogoStats();
  const currentLogo = logoData?.logos?.[currentLogoIndex];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-muted-foreground">Loading logo analysis...</p>
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
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary mb-6 -ml-4 flex items-center gap-2"
            onClick={() => navigate("/analysis")}
            aria-label="Return to analysis page"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Button>
          
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Error Loading Logo Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button 
                variant="primary" 
                onClick={() => navigate("/analysis")}
                className="hover:bg-primary/90 hover:text-primary-foreground"
              >
                Return to Analysis Page
              </Button>
            </CardContent>
          </Card>
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
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">
                      Logo Analysis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Evaluation of logos and their accessibility
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="text-center px-3 py-1 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-base font-bold">
                      {stats.total}
                    </div>
                  </div>
                  
                  <div className="text-center px-3 py-1 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Simple</div>
                    <div className="text-base font-bold text-secondary">
                      {stats.simple}
                    </div>
                  </div>
                  
                  <div className="text-center px-3 py-1 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Complex</div>
                    <div className={`text-base font-bold ${stats.complex > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {stats.complex}
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
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Summary Panel */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    
                    {/* Status message */}
                    {stats.complex === 0 ? (
                      <Alert className="bg-secondary/10 border-secondary py-2">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <AlertTitle className="text-sm">Excellent Logo Accessibility</AlertTitle>
                        <AlertDescription className="mt-1 text-xs">
                          All logos in your poster are simple and clear, which provides good accessibility for viewers with visual impairments.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-destructive/10 border-destructive py-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <AlertTitle className="text-sm">Logo Accessibility Concerns</AlertTitle>
                        <AlertDescription className="mt-1 text-xs">
                          {stats.complex} of {stats.total} logos in your poster {stats.complex === 1 ? 'is' : 'are'} complex, which may impact accessibility and readability.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Summary image */}
                  {logoData?.logo_evaluation_summary && (
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          Logo Visualization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                          <img 
                            src={logoData.logo_evaluation_summary} 
                            alt="Visualization of logos in the poster"
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              console.error("Image failed to load");
                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==";
                            }}
                          />
                        </AspectRatio>
                      </CardContent>
                      <CardFooter className="text-xs text-muted-foreground flex gap-1 items-center py-1 px-3">
                        <Info className="h-3 w-3 text-primary" />
                        Detected {stats.total} logo{stats.total !== 1 ? 's' : ''} in the poster
                      </CardFooter>
                    </Card>
                  )}
                  
                  {/* Logo accessibility guide */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Info className="h-4 w-4 text-primary" />
                        Logo Accessibility Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-xs">What Makes a Logo Accessible?</h4>
                          <ul className="space-y-1">
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Simple, clean design with clear forms</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-xs">High contrast between elements</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Limited color palette with good contrast</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Legible at various sizes</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-xs">Accessibility Concerns</h4>
                          <ul className="space-y-1">
                            <li className="flex items-start gap-1">
                              <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Intricate details that get lost at small sizes</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Low contrast colors or gradients</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Too many visual elements clustered together</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-xs">Thin lines that may disappear when scaled</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs">
                        <Button 
                          variant="link" 
                          className="text-primary p-0 h-auto text-xs"
                          onClick={() => window.open("https://www.w3.org/WAI/tutorials/images/", "_blank")}
                        >
                          <span className="flex items-center gap-1">
                            Learn more about image accessibility guidelines
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Logo list */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">All Logos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {logoData?.logos?.map((logo, index) => (
                          <div 
                            key={index}
                            className="border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors group"
                            onClick={() => {
                              setCurrentLogoIndex(index);
                              setActiveTab("details");
                            }}
                          >
                            <div className="aspect-square bg-muted flex items-center justify-center p-2">
                              {(() => {
                                const logoKey = `logo_${index + 1}`;
                                const logoPath = logo[logoKey] || 
                                  Object.entries(logo)
                                    .find(([key]) => key.startsWith('logo_'))?.[1];
                                
                                if (logoPath) {
                                  return (
                                    <img 
                                      src={logoPath}
                                      alt={`Logo ${index + 1}`}
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentNode.innerHTML += `<div class="text-center"><AlertTriangle class="h-6 w-6 text-muted-foreground mx-auto mb-1" /><p class="text-xs text-muted-foreground">Image unavailable</p></div>`;
                                      }}
                                    />
                                  );
                                }
                                
                                return (
                                  <div className="text-center">
                                    <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                                    <p className="text-xs text-muted-foreground">No image available</p>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="p-2 flex items-center justify-between">
                              <span className="text-xs font-medium">Logo {index + 1}</span>
                              <Badge variant={logo.label === "Simple" ? "outline" : "destructive"} className="ml-1 text-xs py-0">
                                {logo.label || "Unknown"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Details Tab */}
                <TabsContent value="details">
                  {logoData && logoData.logos && logoData.logos.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* Left column - Logo list */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader className="py-2 px-3">
                            <CardTitle className="text-sm">All Logos</CardTitle>
                            <CardDescription className="text-xs">
                              {stats.simple} simple, {stats.complex} complex
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ScrollArea className="h-[350px]">
                              {logoData.logos.map((logo, index) => (
                                <div 
                                  key={index}
                                  onClick={() => setCurrentLogoIndex(index)}
                                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted/40 transition-colors
                                    ${index === currentLogoIndex ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                                    ${index !== logoData.logos.length - 1 ? 'border-b border-b-border' : ''}
                                  `}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => e.key === "Enter" && setCurrentLogoIndex(index)}
                                  aria-pressed={index === currentLogoIndex}
                                >
                                  <div className="flex items-center gap-2">
                                    {/* Logo thumbnail */}
                                    <div className="w-8 h-8 rounded border bg-white flex-shrink-0 flex items-center justify-center overflow-hidden">
                                      {(() => {
                                        const logoKey = `logo_${index + 1}`;
                                        const logoPath = logo[logoKey] || 
                                          Object.entries(logo)
                                            .find(([key]) => key.startsWith('logo_'))?.[1];
                                        
                                        if (logoPath) {
                                          return (
                                            <img 
                                              src={logoPath}
                                              alt=""
                                              className="max-w-full max-h-full object-contain"
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                              }}
                                            />
                                          );
                                        }
                                        
                                        return <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />;
                                      })()}
                                    </div>
                                    
                                    <div>
                                      <div className="font-medium text-xs">Logo {index + 1}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {logo.label || "Not classified"}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Badge variant={logo.label === "Simple" ? "outline" : "destructive"} className={`text-xs py-0 ${logo.label === "Simple" ? "bg-secondary/10 text-secondary border-secondary" : ""}`}>
                                    {logo.label === "Simple" ? (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle className="h-2.5 w-2.5" />
                                        <span className="text-xs">Simple</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        <span className="text-xs">Complex</span>
                                      </span>
                                    )}
                                  </Badge>
                                </div>
                              ))}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Right column - Current logo details */}
                      <div className="lg:col-span-2">
                        {currentLogo && (
                          <>
                            <Card className={currentLogo.label === "Simple" ? "border-secondary/20" : "border-destructive/20"}>
                              <CardHeader className={`py-2 px-3 ${currentLogo.label === "Simple" ? "bg-secondary/5" : "bg-destructive/5"}`}>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                                      {currentLogo.label === "Simple" ? (
                                        <CheckCircle className="h-4 w-4 text-secondary" />
                                      ) : (
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                      )}
                                    </div>
                                    <div>
                                      <CardTitle className="text-sm">Logo {currentLogoIndex + 1}</CardTitle>
                                      <CardDescription className="text-xs">
                                        {currentLogo.label === "Simple" ? "Good accessibility" : "Potential accessibility concerns"}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <Badge variant={currentLogo.label === "Simple" ? "outline" : "destructive"} className={`text-xs py-0 ${currentLogo.label === "Simple" ? "bg-secondary/10 text-secondary border-secondary flex items-center gap-1" : "flex items-center gap-1"}`}>
                                    {currentLogo.label === "Simple" ? (
                                      <>
                                        <CheckCircle className="h-2.5 w-2.5" />
                                        <span className="text-xs">Simple</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        <span className="text-xs">Complex</span>
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="py-3 px-3">
                                <div className="aspect-ratio mb-3 border rounded-md overflow-hidden bg-white flex items-center justify-center">
                                  {(() => {
                                    // Find the logo image
                                    const logoKey = `logo_${currentLogoIndex + 1}`;
                                    const logoPath = currentLogo[logoKey] || 
                                      Object.entries(currentLogo)
                                        .find(([key]) => key.startsWith('logo_'))?.[1];
                                    
                                    if (logoPath) {
                                      return (
                                        <img 
                                          src={logoPath}
                                          alt={`Logo ${currentLogoIndex + 1}`}
                                          className="max-w-[90%] max-h-[90%] object-contain"
                                          onError={(e) => {
                                            console.error("Logo image failed to load");
                                          }}
                                        />
                                      );
                                    }
                                    
                                    return (
                                      <div className="text-center p-2">
                                        <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                                        <p className="text-xs text-muted-foreground">No image available for this logo</p>
                                      </div>
                                    );
                                  })()}
                                </div>
                                
                                <Separator className="my-3" />
                                
                                {currentLogo.label === "Simple" ? (
                                  <Card className="bg-secondary/5 border-secondary/20 mt-3">
                                    <CardHeader className="py-2 px-3">
                                      <CardTitle className="text-sm flex items-center gap-1">
                                        <CheckCircle className="h-3.5 w-3.5 text-secondary" />
                                        Good Accessibility
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-3 py-2">
                                      <p className="text-xs text-muted-foreground mb-2">
                                        This logo has a simple design that supports good accessibility. Simple logos are easier to recognize and provide better visibility for users with visual impairments.
                                      </p>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <h4 className="text-xs font-medium">Positive Aspects:</h4>
                                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
                                            <li>Simple shapes and minimal details</li>
                                            <li>Good scalability for different sizes</li>
                                            <li>Clear forms that maintain visibility</li>
                                            <li>Easy to recognize at a glance</li>
                                          </ul>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <h4 className="text-xs font-medium">Best Practices:</h4>
                                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
                                            <li>Continue using simple designs</li>
                                            <li>Test how the logo appears at various sizes</li>
                                            <li>Consider how it appears on different backgrounds</li>
                                            <li>Maintain high contrast between elements</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Card className="bg-destructive/5 border-destructive/20 mt-3">
                                    <CardHeader className="py-2 px-3">
                                      <CardTitle className="text-sm flex items-center gap-1">
                                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                        Accessibility Concerns
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-3 py-2">
                                      <p className="text-xs text-muted-foreground mb-2">
                                        This logo has a complex design that may present accessibility challenges. Complex logos can be difficult to recognize at small sizes and may cause issues for users with visual impairments.
                                      </p>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <h4 className="text-xs font-medium">Potential Issues:</h4>
                                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
                                            <li>Intricate details that may be lost at small sizes</li>
                                            <li>Multiple visual elements that can blur together</li>
                                            <li>Possible low contrast between elements</li>
                                            <li>May be difficult to recognize quickly</li>
                                          </ul>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <h4 className="text-xs font-medium">Recommendations:</h4>
                                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
                                            <li>Consider using a simplified version</li>
                                            <li>Increase contrast between elements</li>
                                            <li>Remove unnecessary details</li>
                                            <li>Test legibility at various sizes</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </CardContent>
                            </Card>
                            
                            {/* Navigation controls - centered and side by side */}
                            <div className="flex items-center justify-center mt-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateLogo(-1)}
                                disabled={currentLogoIndex === 0}
                                className="flex items-center gap-1 h-7 text-xs"
                              >
                                <ChevronLeft className="h-3 w-3" />
                                Previous
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateLogo(1)}
                                disabled={currentLogoIndex === logoData.logos.length - 1}
                                className="flex items-center gap-1 h-7 text-xs"
                              >
                                Next
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Card className="border-dashed border-2">
                      <CardContent className="p-6 flex flex-col items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          No Logo Data Available
                        </h3>
                        <p className="text-xs text-muted-foreground text-center">
                          No logos were detected in the analyzed poster.
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