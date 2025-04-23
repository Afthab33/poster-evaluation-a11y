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
  Image
} from "lucide-react";

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
      
      {/* Add the metrics sidebar for vertical navigation */}
      <MetricsSidebar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 pl-[60px]">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-6 -ml-4 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => navigate("/analysis")}
            aria-label="Return to analysis page"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Button>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Maximize className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Resolution Analysis
                  </CardTitle>
                  <CardDescription>
                    Evaluation of poster resolution and display quality
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-8">
                  {/* Resolution Card */}
                  <Card className={`border-l-4 ${meetsMinimum ? 'border-l-secondary' : 'border-l-destructive'}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                          <Maximize className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Resolution</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl font-bold">{getFormattedResolution()}</span>
                        {meetsMinimum ? (
                          <CheckCircle className="h-8 w-8 text-secondary" />
                        ) : (
                          <XCircle className="h-8 w-8 text-destructive" />
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        The resolution of your poster determines how clear and readable it will be when displayed or printed.
                      </p>
                      
                      {/* Status alert */}
                      <Alert variant={meetsMinimum ? "default" : "destructive"} className={meetsMinimum ? "bg-secondary/10 text-secondary border-secondary" : ""}>
                        {meetsMinimum ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                          {meetsMinimum ? "Meets Recommended Threshold" : "Below Recommended Threshold"}
                        </AlertTitle>
                        <AlertDescription>
                          Your poster's resolution {meetsMinimum ? "is sufficient" : "doesn't meet the minimum"} for clear display (800 × 600).
                          {!meetsMinimum && (
                            <div className="mt-4 space-y-2">
                              <p className="font-medium">Steps to improve resolution:</p>
                              <ul className="list-disc ml-5 space-y-1">
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
                        <Alert className={`mt-4 ${meetsHD ? "bg-secondary/10 text-secondary border-secondary" : "bg-primary/10 border-primary text-primary"}`}>
                          {meetsHD ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Info className="h-4 w-4" />
                          )}
                          <AlertTitle>
                            {meetsHD ? "HD Resolution" : "Standard Resolution"}
                          </AlertTitle>
                          <AlertDescription>
                            Your poster {meetsHD ? "meets" : "doesn't meet"} high-definition standards (1920 × 1080).
                            {!meetsHD && (
                              <div className="mt-2">
                                Consider increasing resolution for large displays or professional printing.
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Threshold information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommended Thresholds</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start p-4 bg-muted rounded-md">
                        <Image className="h-5 w-5 text-primary mt-0.5 mr-4 flex-shrink-0" />
                        <div className="flex flex-1 justify-between">
                          <div>
                            <p className="font-medium">Minimum Resolution</p>
                            <p className="text-sm text-muted-foreground">Recommended minimum resolution for web images</p>
                          </div>
                          <div className="font-semibold text-primary">{MINIMUM_WIDTH} × {MINIMUM_HEIGHT}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 bg-muted rounded-md">
                        <Monitor className="h-5 w-5 text-primary mt-0.5 mr-4 flex-shrink-0" />
                        <div className="flex flex-1 justify-between">
                          <div>
                            <p className="font-medium">HD Resolution</p>
                            <p className="text-sm text-muted-foreground">Standard high-definition resolution</p>
                          </div>
                          <div className="font-semibold text-primary">{HD_WIDTH} × {HD_HEIGHT}</div>
                        </div>
                      </div>
                      
                      <Alert className="mt-4 bg-primary/5 border-primary">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle>Resolution Importance</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">Higher resolution provides several benefits for accessibility:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Improved readability for text elements</li>
                            <li>Better visualization of diagrams and graphs</li>
                            <li>Allows users to zoom in without losing clarity</li>
                            <li>More professional appearance in presentations</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}