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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ArrowLeft,
  BarChart2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Contrast,
  ImageIcon,
  LinkIcon,
  Maximize,
  Users,
  Type,
  Table2
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function DiagramAnalysisPage() {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDiagramIndex, setCurrentDiagramIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Check if a caption is valid
  const isValidCaption = (caption) => {
    if (!caption) return false;
    const trimmedCaption = caption.trim();
    return trimmedCaption !== '' && 
           trimmedCaption !== 'No caption provided' &&
           trimmedCaption !== '""' &&
           trimmedCaption !== '"' &&
           trimmedCaption !== '[]' &&
           trimmedCaption !== '{}';
  };

  // Navigate between diagrams
  const navigateDiagram = (direction) => {
    const newIndex = currentDiagramIndex + direction;
    
    if (newIndex >= 0 && newIndex < diagrams.length) {
      setCurrentDiagramIndex(newIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyNavigation = (e) => {
      if (activeTab !== "depth") return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateDiagram(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateDiagram(1);
      }
    };
    
    document.addEventListener("keydown", handleKeyNavigation);
    return () => document.removeEventListener("keydown", handleKeyNavigation);
  }, [activeTab, currentDiagramIndex, diagrams.length]);

  // Load diagram data
  useEffect(() => {
    try {
      setLoading(true);
      const dataStr = sessionStorage.getItem('analysisData');
      
      if (!dataStr) {
        setError("No analysis data found. Please upload a poster first.");
        setLoading(false);
        return;
      }
      
      const analysisData = JSON.parse(dataStr);
      
      if (!analysisData.captions) {
        setError("No diagram data found in the analysis results.");
        setLoading(false);
        return;
      }

      const parsedDiagrams = [];
      
      for (const [key, caption] of Object.entries(analysisData.captions)) {
        if (!caption || caption === '{}') continue;

        const imagePath = caption.img;
        const captionText = caption.caption;
        
        if (imagePath) {
          parsedDiagrams.push({
            key: key,
            image_path: imagePath,
            captionText: captionText
          });
        }
      }

      if (parsedDiagrams.length === 0) {
        setError("No diagrams were found in the document.");
      } else {
        setDiagrams(parsedDiagrams);
      }
    } catch (error) {
      console.error("Error loading diagram data:", error);
      setError("Error parsing analysis data. Please try analyzing the poster again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-muted-foreground">Loading diagram analysis...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get current diagram
  const currentDiagram = diagrams[currentDiagramIndex] || null;
  
  // Calculate statistics
  const withCaptions = diagrams.filter(d => isValidCaption(d.captionText)).length;
  const withoutCaptions = diagrams.length - withCaptions;

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
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <span>Switch Metric</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/analysis/contrast")}>
                  <Contrast className="h-4 w-4 mr-2 text-primary" />
                  <span>Color Contrast</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/logo")}>
                  <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                  <span>Logo Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/hyperlinks")}>
                  <LinkIcon className="h-4 w-4 mr-2 text-primary" />
                  <span>Hyperlinks</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/resolution")}>
                  <Maximize className="h-4 w-4 mr-2 text-primary" />
                  <span>Resolution</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/authors")}>
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <span>Authors</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/fonts")}>
                  <Type className="h-4 w-4 mr-2 text-primary" />
                  <span>Font Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/tables")}>
                  <Table2 className="h-4 w-4 mr-2 text-primary" />
                  <span>Tables</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                  <span>Diagrams</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Diagram Analysis
                  </CardTitle>
                  <CardDescription>
                    Evaluation of diagrams and their captions for accessibility
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
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="depth">In-Depth Analysis</TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <BarChart2 className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Total Diagrams</p>
                          <p className="text-3xl font-bold">{diagrams.length}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                            <CheckCircle className="h-6 w-6 text-secondary" />
                          </div>
                          <p className="text-sm text-muted-foreground">With Captions</p>
                          <p className="text-3xl font-bold">{withCaptions}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                            <XCircle className="h-6 w-6 text-destructive" />
                          </div>
                          <p className="text-sm text-muted-foreground">Missing Captions</p>
                          <p className="text-3xl font-bold">{withoutCaptions}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Diagrams table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Diagram Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">Diagram</TableHead>
                                <TableHead className="w-[200px]">Caption Status</TableHead>
                                <TableHead>Caption Preview</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {diagrams.map((diagram, index) => {
                                const hasCaption = isValidCaption(diagram.captionText);
                                const captionPreview = hasCaption 
                                  ? diagram.captionText.substring(0, 100) + (diagram.captionText.length > 100 ? '...' : '')
                                  : 'No caption provided';
                                
                                return (
                                  <TableRow 
                                    key={index}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                      setCurrentDiagramIndex(index);
                                      setActiveTab("depth");
                                    }}
                                  >
                                    <TableCell className="font-medium">{diagram.key}</TableCell>
                                    <TableCell>
                                      {hasCaption ? (
                                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary flex items-center gap-1">
                                          <CheckCircle className="h-3.5 w-3.5" />
                                          Has Caption
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1">
                                          <XCircle className="h-3.5 w-3.5" />
                                          No Caption
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                      {captionPreview}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* In-Depth Analysis Tab */}
                  <TabsContent value="depth">
                    {currentDiagram ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Diagram image section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {currentDiagram.key} ({currentDiagramIndex + 1} of {diagrams.length})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center bg-muted/30 rounded-md min-h-[400px]">
                              {currentDiagram.image_path ? (
                                <AspectRatio ratio={16/9} className="max-w-full">
                                  <img 
                                    src={currentDiagram.image_path} 
                                    alt={`Diagram ${currentDiagramIndex + 1} visualization`}
                                    className="object-contain max-h-[350px] rounded-md"
                                  />
                                </AspectRatio>
                              ) : (
                                <div className="text-center text-muted-foreground">
                                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2 mx-auto" />
                                  <p>No image available for this diagram</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {/* Caption section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Caption Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[400px]">
                              {isValidCaption(currentDiagram.captionText) ? (
                                <div className="space-y-4">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Has Caption
                                    </Badge>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Caption Content:</h4>
                                    <div className="p-4 bg-muted rounded-md text-foreground">
                                      {currentDiagram.captionText}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1">
                                      <XCircle className="h-3.5 w-3.5" />
                                      No Caption
                                    </Badge>
                                  </div>
                                  
                                  <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Missing Caption: Accessibility Impact</AlertTitle>
                                    <AlertDescription>
                                      <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Screen readers cannot convey the diagram's content</li>
                                        <li>Users may miss important information</li>
                                        <li>Reduces understanding of the visualization</li>
                                      </ul>
                                    </AlertDescription>
                                  </Alert>
                                  
                                  <Alert className="bg-primary/5 border-primary">
                                    <Info className="h-4 w-4 text-primary" />
                                    <AlertTitle>Recommendations</AlertTitle>
                                    <AlertDescription>
                                      <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Add a clear, descriptive caption</li>
                                        <li>Explain key elements and relationships</li>
                                        <li>Include relevant measurements or trends</li>
                                        <li>Provide context for the visualization</li>
                                      </ul>
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Navigation controls */}
                        <div className="flex items-center justify-between mt-8">
                          <Button
                            variant="outline"
                            onClick={() => navigateDiagram(-1)}
                            disabled={currentDiagramIndex === 0}
                            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous Diagram
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => navigateDiagram(1)}
                            disabled={currentDiagramIndex === diagrams.length - 1}
                            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            Next Diagram
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Card className="border-dashed border-2">
                        <CardContent className="p-12 flex flex-col items-center justify-center">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            No Diagram Selected
                          </h3>
                          <p className="text-muted-foreground text-center">
                            Please select a diagram from the overview tab.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          
          {/* Pagination controls for navigating between metrics */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/analysis/tables")}
            >
              <ChevronLeft className="h-4 w-4" />
              <Table2 className="h-4 w-4 mr-1" />
              Tables
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/analysis/fonts")}
            >
              Font Analysis
              <Type className="h-4 w-4 ml-1" />
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}