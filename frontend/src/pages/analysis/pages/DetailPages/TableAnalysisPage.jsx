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
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Table2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function TableAnalysisPage() {
  const navigate = useNavigate();
  const [tablesData, setTablesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
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

  // Handle keyboard navigation for tables
  useEffect(() => {
    const handleKeyNavigation = (e) => {
      if (activeTab !== "depth") return;
      
      if (e.key === "ArrowLeft") {
        navigateTable(-1);
      } else if (e.key === "ArrowRight") {
        navigateTable(1);
      }
    };
    
    document.addEventListener("keydown", handleKeyNavigation);
    return () => document.removeEventListener("keydown", handleKeyNavigation);
  }, [activeTab, currentTableIndex, tablesData.length]);

  // Load table data from sessionStorage
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
      
      if (!analysisData.tables || !Array.isArray(analysisData.tables) || analysisData.tables.length === 0) {
        setTablesData([]);
      } else {
        setTablesData(analysisData.tables);
      }
    } catch (error) {
      console.error('Error processing table data:', error);
      setError("Failed to process table analysis data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigate between tables
  const navigateTable = (direction) => {
    const newIndex = currentTableIndex + direction;
    if (newIndex >= 0 && newIndex < tablesData.length) {
      setCurrentTableIndex(newIndex);
    }
  };

  // Get current table
  const currentTable = tablesData[currentTableIndex] || null;
  
  // Calculate statistics
  const withCaptions = tablesData.filter(table => isValidCaption(table.caption)).length;
  const withoutCaptions = tablesData.length - withCaptions;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-muted-foreground">Loading table analysis...</p>
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
                <Table2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Table Evaluation
                  </CardTitle>
                  <CardDescription>
                    Analysis of tables and their accessibility features
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
                            <Table2 className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Total Tables</p>
                          <p className="text-3xl font-bold">{tablesData.length}</p>
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
                    
                    {/* Overview Table */}
                    {tablesData.length > 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Tables Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Table</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tablesData.map((table, index) => {
                                const hasCaption = isValidCaption(table.caption);
                                return (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">Table {index + 1}</TableCell>
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
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                          setCurrentTableIndex(index);
                                          setActiveTab("depth");
                                        }}
                                      >
                                        View Details
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-dashed border-2">
                        <CardContent className="p-12 flex flex-col items-center justify-center">
                          <Table2 className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            No Tables Found
                          </h3>
                          <p className="text-muted-foreground text-center">
                            No tables were detected in the analyzed poster.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Accessibility Guidelines */}
                    {tablesData.length > 0 && (
                      <Alert className="bg-primary/5 border-primary">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle>Table Accessibility Guidelines</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">For optimal accessibility, tables should include:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Descriptive captions explaining the table's purpose</li>
                            <li>Proper table structure with header cells</li>
                            <li>Simple, consistent layout for screen readers</li>
                            <li>Sufficient color contrast for all cells</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  {/* In-Depth Analysis Tab */}
                  <TabsContent value="depth">
                    {tablesData.length > 0 && currentTable ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Table image section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Table {currentTableIndex + 1} of {tablesData.length}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center bg-muted/30 rounded-md min-h-[400px]">
                              {currentTable.img ? (
                                <AspectRatio ratio={16/9} className="max-w-full">
                                  <img 
                                    src={currentTable.img} 
                                    alt={`Table ${currentTableIndex + 1} visualization`}
                                    className="object-contain max-h-[350px] rounded-md"
                                  />
                                </AspectRatio>
                              ) : (
                                <div className="text-center text-muted-foreground">
                                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2 mx-auto" />
                                  <p>No image available for this table</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {/* Caption section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Table {currentTableIndex + 1} Caption</CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[400px]">
                              {isValidCaption(currentTable.caption) ? (
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
                                      {currentTable.caption}
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
                                        <li>Screen readers cannot provide context for the table data</li>
                                        <li>Users may miss important information about the table's purpose</li>
                                        <li>Reduces understanding of the data relationships</li>
                                      </ul>
                                    </AlertDescription>
                                  </Alert>
                                  
                                  <Alert className="bg-primary/5 border-primary">
                                    <Info className="h-4 w-4 text-primary" />
                                    <AlertTitle>Recommendations</AlertTitle>
                                    <AlertDescription>
                                      <ul className="list-disc pl-5 space-y-1 mt-2">
                                        <li>Add a clear, descriptive caption</li>
                                        <li>Explain what the table represents</li>
                                        <li>Include key data relationships</li>
                                        <li>Provide context for interpreting the data</li>
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
                            onClick={() => navigateTable(-1)}
                            disabled={currentTableIndex === 0}
                            className="flex items-center gap-2"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous Table
                          </Button>
                          
                          <span className="text-sm text-muted-foreground">
                            Table {currentTableIndex + 1} of {tablesData.length}
                          </span>
                          
                          <Button
                            variant="outline"
                            onClick={() => navigateTable(1)}
                            disabled={currentTableIndex === tablesData.length - 1}
                            className="flex items-center gap-2"
                          >
                            Next Table
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Card className="border-dashed border-2">
                        <CardContent className="p-12 flex flex-col items-center justify-center">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            No Tables Found
                          </h3>
                          <p className="text-muted-foreground text-center">
                            No tables were detected in the analyzed poster.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}