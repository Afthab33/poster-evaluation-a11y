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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Maximize,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Monitor,
  Image,
  ChevronLeft,
  ChevronRight,
  Type
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function ResolutionAnalysisPage() {
  const navigate = useNavigate();
  const [resolutionData, setResolutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetsMinimum, setMeetsMinimum] = useState(false);
  const [meetsHD, setMeetsHD] = useState(false);
  
  // Minimum thresholds
  const MINIMUM_WIDTH = 800;
  const MINIMUM_HEIGHT = 600;
  const HD_WIDTH = 1920;
  const HD_HEIGHT = 1080;

  // Load resolution data from sessionStorage
  useEffect(() => {
    try {
      setLoading(true);
      const dataStr = sessionStorage.getItem('analysisData');
      
      if (!dataStr) {
        setError("No analysis data found. Please upload a poster first.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(dataStr);
      if (!data.image_resolution) {
        setError("No resolution data found in the analysis results.");
        setLoading(false);
        return;
      }

      setResolutionData(data.image_resolution);
      
      // Determine if resolution meets thresholds
      let width = 0, height = 0;
      if (typeof data.image_resolution.Resolution === 'string' && data.image_resolution.Resolution.includes('x')) {
        [width, height] = data.image_resolution.Resolution.split('x').map(Number);
        setMeetsMinimum(width >= MINIMUM_WIDTH && height >= MINIMUM_HEIGHT);
        setMeetsHD(width >= HD_WIDTH && height >= HD_HEIGHT);
      }
    } catch (error) {
      console.error("Error processing resolution data:", error);
      setError("Failed to process resolution data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Format resolution for display
  const getFormattedResolution = () => {
    if (!resolutionData || !resolutionData.Resolution) return 'N/A';
    
    let formattedResolution = resolutionData.Resolution;
    
    // Handle "width x height" format
    if (typeof formattedResolution === 'string' && formattedResolution.includes('x')) {
      const [width, height] = formattedResolution.split('x').map(Number);
      return `${Math.round(width)} × ${Math.round(height)}`;
    } 
    // Handle numerical values (like DPI)
    else if (!isNaN(formattedResolution)) {
      return Math.round(formattedResolution).toString();
    }
    
    return formattedResolution;
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-muted-foreground">Loading resolution analysis...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MetricsSidebar />
      
      <main className="flex-1 py-4">
        <div className="container mx-auto px-3 pl-[60px]">
          {/* Top navigation bar with metrics dropdown */}
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
            
          </div>
          
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg font-bold text-primary">
                    Resolution Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Evaluation of poster resolution and display quality
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {error ? (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertTitle className="text-sm">Error</AlertTitle>
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {/* Resolution Card */}
                  <Card className={`border-l-4 ${meetsMinimum ? 'border-l-secondary' : 'border-l-destructive'}`}>
                    <CardContent className="p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <Maximize className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-base font-semibold">Resolution</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{getFormattedResolution()}</span>
                          {meetsMinimum ? (
                            <CheckCircle className="h-5 w-5 text-secondary" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        The resolution of your poster determines how clear and readable it will be when displayed or printed.
                      </p>
                      
                      {/* Status alert */}
                      <Alert variant={meetsMinimum ? "default" : "destructive"} className={`${meetsMinimum ? "bg-secondary/10 text-secondary border-secondary" : ""} py-2`}>
                        {meetsMinimum ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        <AlertTitle className="text-xs">
                          {meetsMinimum ? "Meets Recommended Threshold" : "Below Recommended Threshold"}
                        </AlertTitle>
                        <AlertDescription className="text-xs">
                          Your poster's resolution {meetsMinimum ? "is sufficient" : "doesn't meet the minimum"} for clear display ({MINIMUM_WIDTH} × {MINIMUM_HEIGHT}).
                          {!meetsMinimum && (
                            <div className="mt-2 space-y-1">
                              <p className="font-medium text-xs">Steps to improve resolution:</p>
                              <ul className="list-disc ml-4 space-y-0.5 text-xs">
                                <li>Use a higher resolution image</li>
                                <li>Ensure the image is not compressed</li>
                                <li>Export the poster at a higher resolution</li>
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                      
                      {/* HD status */}
                      {meetsMinimum && (
                        <Alert className={`mt-2 py-2 ${meetsHD ? "bg-secondary/10 text-secondary border-secondary" : "bg-primary/10 border-primary text-primary"}`}>
                          {meetsHD ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Info className="h-3 w-3" />
                          )}
                          <AlertTitle className="text-xs">
                            {meetsHD ? "HD Resolution" : "Standard Resolution"}
                          </AlertTitle>
                          <AlertDescription className="text-xs">
                            Your poster {meetsHD ? "meets" : "doesn't meet"} high-definition standards ({HD_WIDTH} × {HD_HEIGHT}).
                            {!meetsHD && (
                              <span className="block mt-1">
                                Consider increasing resolution for large displays or professional printing.
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Threshold information */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">Recommended Thresholds</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start p-3 bg-muted rounded-md">
                        <Image className="h-4 w-4 text-primary mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex flex-1 justify-between items-center">
                          <div>
                            <p className="text-xs font-medium">Minimum Resolution</p>
                            <p className="text-xs text-muted-foreground">Recommended minimum for web images</p>
                          </div>
                          <div className="font-semibold text-primary text-sm">{MINIMUM_WIDTH} × {MINIMUM_HEIGHT}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 bg-muted rounded-md">
                        <Monitor className="h-4 w-4 text-primary mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex flex-1 justify-between items-center">
                          <div>
                            <p className="text-xs font-medium">HD Resolution</p>
                            <p className="text-xs text-muted-foreground">Standard high-definition resolution</p>
                          </div>
                          <div className="font-semibold text-primary text-sm">{HD_WIDTH} × {HD_HEIGHT}</div>
                        </div>
                      </div>
                      
                      <Alert className="mt-2 bg-primary/5 border-primary py-2">
                        <Info className="h-3 w-3 text-primary" />
                        <AlertTitle className="text-xs">Resolution Importance</AlertTitle>
                        <AlertDescription className="text-xs">
                          <p className="mb-1">Higher resolution provides several benefits for accessibility:</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Improved readability</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Better visualization</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Allows zooming in</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Professional appearance</span>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
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
              onClick={() => navigate("/analysis/hyperlinks")}
            >
              <ChevronLeft className="h-3 w-3" />
              Hyperlinks
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors h-7 text-xs"
              onClick={() => navigate("/analysis/authors")}
            >
              Authors
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}