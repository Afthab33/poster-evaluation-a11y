import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../providers/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileUp, 
  Upload, 
  FileText, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Loader2,
  RefreshCcw,
  Image as ImageIcon,
  FileType,
  AlertTriangle
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PosterUploadPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [currentFact, setCurrentFact] = useState("");
  const [factInterval, setFactIntervalId] = useState(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [fileInfo, setFileInfo] = useState({ size: 0, type: "", dimensions: "" });
  
  // ARIA live region for screen reader announcements
  const ariaLiveRef = useRef(null);
  
  // Supported file types
  const acceptedFileTypes = [
    "image/png", 
    "image/jpeg", 
    "image/jpg",
    "application/pdf"
  ];
  
  // Array of accessibility facts
  const accessibilityFacts = [
    "Did you know? <span class='font-medium text-primary'>Color contrast</span> of at least 4.5:1 for normal text ensures readability for people with visual impairments.",
    "<span class='font-medium text-primary'>Font size</span> of at least 18pt (24px) is recommended for posters to ensure readability from a distance.",
    "Nearly <span class='font-medium text-primary'>1 in 12 men</span> and <span class='font-medium text-primary'>1 in 200 women</span> have some form of color vision deficiency.",
    "Using <span class='font-medium text-primary'>descriptive alt text</span> for images helps screen reader users understand your poster's visual content.",
    "Simple, clean <span class='font-medium text-primary'>logos</span> are more easily recognizable and accessible than complex designs with fine details.",
    "<span class='font-medium text-primary'>High-resolution images</span> (300 DPI or higher) ensure your poster looks crisp and professional when printed.",
    "About <span class='font-medium text-primary'>15% of the world's population</span> lives with some form of disability, making accessibility a universal concern.",
    "Using <span class='font-medium text-primary'>headers and a clear hierarchy</span> in your poster helps visitors quickly navigate and understand your content.",
    "For hyperlinks, using <span class='font-medium text-primary'>descriptive link text</span> instead of 'click here' improves accessibility and SEO.",
    "The <span class='font-medium text-primary'>WCAG (Web Content Accessibility Guidelines)</span> are also applicable to print materials like posters.",
    "Avoiding <span class='font-medium text-primary'>overcrowded layouts</span> with adequate white space improves focus and comprehension for all viewers.",
    "<span class='font-medium text-primary'>Sans-serif fonts</span> like Arial, Calibri, or Verdana are generally more readable for digital displays and posters."
  ];
  
  // Function to show random accessibility fact
  const showRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * accessibilityFacts.length);
    setCurrentFact(accessibilityFacts[randomIndex]);
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (factInterval) {
        clearInterval(factInterval);
      }
    };
  }, [factInterval]);
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // Get dimensions for image files
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(`${img.width} × ${img.height}px`);
      };
      img.src = URL.createObjectURL(file);
    });
  };
  
  // Validate file type and size
  const validateAndSetFile = async (file) => {
    setError(null);
    
    if (!file) return;
    
    // Check file type
    if (!acceptedFileTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, or PDF file.");
      return;
    }
    
    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB.");
      return;
    }
    
    setFile(file);
    
    // Create file preview for image types
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      
      // Get image dimensions for additional info
      const dimensions = await getImageDimensions(file);
      setFileInfo({
        size: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type.split('/')[1].toUpperCase(),
        dimensions: dimensions
      });
    } else if (file.type === 'application/pdf') {
      // For PDF files, use a placeholder image
      setFilePreview('/pdf-placeholder.png'); // Make sure this exists in your public folder
      setFileInfo({
        size: (file.size / (1024 * 1024)).toFixed(2),
        type: 'PDF',
        dimensions: 'Multi-page document'
      });
    }
    
    // Auto-switch to preview tab when file is selected
    setActiveTab("preview");
    
    // Save file name in sessionStorage
    sessionStorage.setItem('originalFileName', file.name);
    
    // Save file as base64
    const reader = new FileReader();
    reader.onload = function (e) {
      sessionStorage.setItem('originalImage', e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Announce to screen readers
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = `File ${file.name} selected. Ready for analysis.`;
    }
  };
  
  // Handle upload button click with API integration
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setProcessingComplete(false);
    
    // Start showing facts
    showRandomFact();
    const intervalId = setInterval(showRandomFact, 5000);
    setFactIntervalId(intervalId);
    
    try {
      // Create FormData for API request
      const formData = new FormData();
      formData.append('poster', file);
      
      // Set up XMLHttpRequest for the request
      const xhr = new XMLHttpRequest();
      const API_BASE_URL = 'https://poster-evaluation-a11y-795777136792.us-central1.run.app';
      
      // Wrap XHR in a promise for async/await
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('POST', `${API_BASE_URL}/evaluate`, true);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP Error: ${xhr.status} ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network Error: Unable to connect to the server.'));
        xhr.send(formData);
      });
      
      // After some time, show processing state
      setTimeout(() => {
        setProcessingComplete(true);
        
        // Announce processing to screen readers
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = "Upload complete. Processing your poster...";
        }
      }, 2000);
      
      // Process the response
      const result = await uploadPromise;
      
      // Transform the data structure as in the original code
      const analysisData = {
        authors: result.authors || [],
        captions: Object.entries(result.captions || {}).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: {
            ...value,
            img: value.img ? `${API_BASE_URL}/${value.img}` : null
          }
        }), {}),
        color_contrast: {
          color_contrast_summary: result.color_contrast?.color_contrast_summary ? 
            `${API_BASE_URL}/${result.color_contrast.color_contrast_summary}` : "",
          sections: result.color_contrast?.sections.map(section => ({
            ...section,
            section_image: section.section_image ? 
              `${API_BASE_URL}/${section.section_image}` : null
          })) || []
        },
        hyperlinks: result.hyperlinks || {},
        image_resolution: result.image_resolution || {
          DPI: 0,
          Resolution: "0x0"
        },
        logo_evaluation: {
          logo_evaluation_summary: result.logo_evaluation?.logo_evaluation_summary ? 
            `${API_BASE_URL}/${result.logo_evaluation.logo_evaluation_summary}` : "",
          logos: result.logo_evaluation?.logos.map(logo => ({
            ...logo,
            logo_1: logo.logo_1 ? `${API_BASE_URL}/${logo.logo_1}` : null,
            logo_2: logo.logo_2 ? `${API_BASE_URL}/${logo.logo_2}` : null,
            logo_3: logo.logo_3 ? `${API_BASE_URL}/${logo.logo_3}` : null
          })) || []
        },
        poster_layout: result.poster_layout ? 
          `${API_BASE_URL}/${result.poster_layout}` : "",
        font_sizes: result.font_sizes || {}
      };
      
      // Store data in session storage for analysis page
      sessionStorage.setItem('analysisData', JSON.stringify(analysisData));
      
      // Clear the facts interval
      if (factInterval) {
        clearInterval(factInterval);
        setFactIntervalId(null);
      }
      
      // Show success toast
      toast.success("Analysis Complete", {
        description: "Your poster has been analyzed successfully."
      });
      
      // Announce completion to screen readers
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = "Analysis complete. Navigating to results.";
      }
      
      // Navigate to analysis page
      setTimeout(() => {
        navigate('/analysis');
      }, 1000);
      
    } catch (error) {
      console.error('Error during analysis:', error);
      
      // Clear the facts interval
      if (factInterval) {
        clearInterval(factInterval);
        setFactIntervalId(null);
      }
      
      // Set error state
      setError(error.message || "An error occurred during analysis. Please try again.");
      
      // Show error toast
      toast.error("Analysis Failed", {
        description: error.message || "An error occurred during analysis. Please try again."
      });
      
      // Announce error to screen readers
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Error: ${error.message || "Analysis failed. Please try again."}`;
      }
      
    } finally {
      setUploading(false);
    }
  };
  
  // Reset the form
  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setUploading(false);
    setProgress(0);
    setProcessingComplete(false);
    setError(null);
    setCurrentFact("");
    setActiveTab("upload");
    setFileInfo({ size: 0, type: "", dimensions: "" });
    
    if (factInterval) {
      clearInterval(factInterval);
      setFactIntervalId(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Clean up any object URLs to prevent memory leaks
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Toaster richColors position="top-right" />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-3">Upload Your Poster</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Upload your academic poster for accessibility analysis. We'll check for color contrast, font sizes, image quality, and more.
            </p>
            
            {/* Main upload card with tabs */}
            <Card className="mb-8 overflow-hidden">
              <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start rounded-none border-b border-border p-0">
                  <TabsTrigger 
                    value="upload" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
                  >
                    Upload
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
                    disabled={!file}
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="p-6 m-0">
                  {/* Simple file requirements */}
                  <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    <span>Accepted formats: PNG, JPG, PDF (max 20MB)</span>
                    
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                          <Info className="h-3.5 w-3.5" />
                          <span className="sr-only">More info</span>
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">For best results:</h4>
                          <ul className="text-xs space-y-1">
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-secondary mt-0.5" /> 
                              Use at least 150 DPI resolution
                            </li>
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-secondary mt-0.5" /> 
                              Upload the final version of your poster
                            </li>
                            <li className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-secondary mt-0.5" /> 
                              Ensure text is not flattened in images
                            </li>
                          </ul>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  
                  {/* Drag & Drop Area - improved visual feedback */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                      isDragging ? "border-primary bg-primary/5 shadow-inner" : 
                      file ? "border-secondary bg-secondary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    aria-label="Upload area. Click or drag and drop a file here."
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-8 w-8 text-secondary" />
                          ) : (
                            <FileText className="h-8 w-8 text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground font-semibold mb-1">{file.name}</p>
                          <Badge variant="outline" className="font-normal">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            Click to choose a different file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold mb-1">
                            Drag & drop your poster here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse files
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf"
                    aria-label="Upload poster file"
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="p-0 m-0">
                  {file && filePreview && (
                    <div className="flex flex-col">
                      <div className="p-4 flex justify-between items-center border-b border-border bg-muted/20">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-card">
                            {fileInfo.type}
                          </Badge>
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-card flex items-center gap-1">
                            <FileType className="h-3 w-3" />
                            {fileInfo.dimensions}
                          </Badge>
                          <Badge variant="outline" className="bg-card">
                            {fileInfo.size} MB
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="aspect-video overflow-hidden bg-muted/20 flex items-center justify-center">
                        <img 
                          src={filePreview} 
                          alt="Poster preview" 
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </div>
                      
                      <div className="p-6">
                        <Alert variant="info" className="mb-4 bg-primary/5 border-primary/20">
                          <Info className="h-4 w-4" />
                          <AlertTitle className="text-foreground">Ready for Analysis</AlertTitle>
                          <AlertDescription>
                            Your poster is ready to be analyzed for accessibility issues. Click the button below to start.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <CardContent className="pt-0 px-6 pb-6">
                {/* Error message */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Upload progress */}
                {uploading && (
                  <div className="mb-6 mt-2">
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        {processingComplete ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Processing poster... This may take a few moments</span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Uploading and analyzing your poster...</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-pulse rounded-full"></div>
                    </div>
                  </div>
                )}
                
                {/* Accessibility facts - shown during analysis */}
                {uploading && currentFact && (
                  <div className="mb-6 p-4 bg-secondary/10 rounded-md border border-secondary/20">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-secondary mt-1" />
                      <div 
                        className="text-sm text-foreground" 
                        dangerouslySetInnerHTML={{ __html: currentFact }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={file ? handleUpload : () => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`flex-1 ${file ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {processingComplete ? "Processing your poster..." : "Analyzing..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {file ? (
                          <>
                            <FileUp className="h-5 w-5" />
                            <span className="font-medium">Analyze Poster</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5" />
                            Select a File
                          </>
                        )}
                      </span>
                    )}
                  </Button>
                  
                  {file && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleReset}
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Information cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">What We Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>Color contrast ratio for text readability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>Font sizes and text spacing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>Image resolution and quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>Table accessibility and organization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>Logo clarity and visibility</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Testimonial</CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="italic text-foreground">
                    "Poster A11y helps identify critical accessibility issues in academic posters that we would have otherwise missed. Our posters are now more inclusive for all attendees."
                  </blockquote>
                  <div className="mt-4 text-sm text-muted-foreground">
                    — Wajdi Aljedaani, Clinical Assistant Professor, University of North Texas
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Screen reader announcements (ARIA live region) */}
            <div
              ref={ariaLiveRef}
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}