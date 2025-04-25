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
  ChevronRight,
  ChevronDown,
  Users,
  Type,
  BarChart2
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
                <Table2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg font-bold text-primary">
                    Table Evaluation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Analysis of tables and their accessibility features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-3">
              {error ? (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertTitle className="text-sm">Error</AlertTitle>
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              ) : (
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="depth">In-Depth Analysis</TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-3">
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Card className="overflow-hidden">
                        <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Table2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Tables</p>
                            <p className="text-xl font-bold">{tablesData.length}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="overflow-hidden">
                        <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-secondary" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">With Captions</p>
                            <p className="text-xl font-bold">{withCaptions}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="overflow-hidden">
                        <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Missing Captions</p>
                            <p className="text-xl font-bold">{withoutCaptions}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Overview Table */}
                    {tablesData.length > 0 ? (
                      <Card>
                        <CardHeader className="py-2 px-3">
                          <CardTitle className="text-sm">Tables Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[220px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[80px] py-1.5 text-xs">Table</TableHead>
                                  <TableHead className="w-[100px] py-1.5 text-xs">Status</TableHead>
                                  <TableHead className="text-right py-1.5 text-xs w-[80px]">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tablesData.map((table, index) => {
                                  const hasCaption = isValidCaption(table.caption);
                                  return (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium py-1 text-xs">Table {index + 1}</TableCell>
                                      <TableCell className="py-1">
                                        {hasCaption ? (
                                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary flex items-center gap-1 text-[10px] py-0 px-1.5">
                                            <CheckCircle className="h-2.5 w-2.5" />
                                            Has Caption
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 text-[10px] py-0 px-1.5">
                                            <XCircle className="h-2.5 w-2.5" />
                                            No Caption
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right py-1">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-6 text-[10px] px-2"
                                          onClick={() => {
                                            setCurrentTableIndex(index);
                                            setActiveTab("depth");
                                          }}
                                        >
                                          Details
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-dashed border">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                          <Table2 className="h-8 w-8 text-muted-foreground mb-2" />
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            No Tables Found
                          </h3>
                          <p className="text-muted-foreground text-center text-xs">
                            No tables were detected in the analyzed poster.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Accessibility Guidelines */}
                    {tablesData.length > 0 && (
                      <Alert className="bg-primary/5 border-primary py-2">
                        <Info className="h-3 w-3 text-primary" />
                        <AlertTitle className="text-xs">Table Accessibility Guidelines</AlertTitle>
                        <AlertDescription className="text-xs">
                          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 mt-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Use descriptive captions</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Include proper header cells</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Use simple layouts</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary text-xs">•</span>
                              <span className="text-xs text-muted-foreground">Ensure good color contrast</span>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  {/* In-Depth Analysis Tab */}
                  <TabsContent value="depth">
                    {tablesData.length > 0 && currentTable ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          {/* Table image section */}
                          <Card>
                            <CardHeader className="py-2 px-3">
                              <CardTitle className="text-sm">
                                Table {currentTableIndex + 1} of {tablesData.length}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center bg-muted/30 rounded-md min-h-[240px] p-2">
                              {currentTable.img ? (
                                <AspectRatio ratio={16/9} className="max-w-full">
                                  <img 
                                    src={currentTable.img} 
                                    alt={`Table ${currentTableIndex + 1} visualization`}
                                    className="object-contain max-h-[220px] rounded-md"
                                  />
                                </AspectRatio>
                              ) : (
                                <div className="text-center text-muted-foreground">
                                  <AlertTriangle className="h-8 w-8 text-muted-foreground mb-1 mx-auto" />
                                  <p className="text-xs">No image available for this table</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {/* Caption section */}
                          <Card>
                            <CardHeader className="py-2 px-3">
                              <CardTitle className="text-sm">Table {currentTableIndex + 1} Caption</CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[240px] p-3">
                              {isValidCaption(currentTable.caption) ? (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary flex items-center gap-1 text-xs">
                                      <CheckCircle className="h-3 w-3" />
                                      Has Caption
                                    </Badge>
                                  </div>
                                  
                                  <Separator className="my-1" />
                                  
                                  <div className="h-[190px] overflow-auto">
                                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Caption Content:</h4>
                                    <div className="p-2 bg-muted rounded-md text-foreground text-xs">
                                      {currentTable.caption}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 text-xs">
                                      <XCircle className="h-3 w-3" />
                                      No Caption
                                    </Badge>
                                  </div>
                                  
                                  <Alert variant="destructive" className="py-2">
                                    <AlertTriangle className="h-3 w-3" />
                                    <AlertTitle className="text-xs">Missing Caption: Accessibility Impact</AlertTitle>
                                    <AlertDescription className="text-xs">
                                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 mt-1">
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-destructive text-xs">•</span>
                                          <span className="text-xs">No context for screen readers</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-destructive text-xs">•</span>
                                          <span className="text-xs">Missing purpose information</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-destructive text-xs">•</span>
                                          <span className="text-xs">Reduced understanding</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-destructive text-xs">•</span>
                                          <span className="text-xs">Data relationship unclear</span>
                                        </div>
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                  
                                  <Alert className="bg-primary/5 border-primary py-2">
                                    <Info className="h-3 w-3 text-primary" />
                                    <AlertTitle className="text-xs">Recommendations</AlertTitle>
                                    <AlertDescription className="text-xs">
                                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 mt-1">
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-primary text-xs">•</span>
                                          <span className="text-xs">Add a clear caption</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-primary text-xs">•</span>
                                          <span className="text-xs">Explain table's purpose</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-primary text-xs">•</span>
                                          <span className="text-xs">Describe key relationships</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-primary text-xs">•</span>
                                          <span className="text-xs">Provide data context</span>
                                        </div>
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Navigation controls */}
                        <div className="flex items-center justify-between mt-3">
                          <Button
                            variant="outline"
                            onClick={() => navigateTable(-1)}
                            disabled={currentTableIndex === 0}
                            className="flex items-center gap-1 h-7 text-xs"
                          >
                            <ChevronLeft className="h-3 w-3" />
                            Previous
                          </Button>
                          
                          <span className="text-xs text-muted-foreground">
                            Table {currentTableIndex + 1} of {tablesData.length}
                          </span>
                          
                          <Button
                            variant="outline"
                            onClick={() => navigateTable(1)}
                            disabled={currentTableIndex === tablesData.length - 1}
                            className="flex items-center gap-1 h-7 text-xs"
                          >
                            Next
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Card className="border-dashed border">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                          <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            No Tables Found
                          </h3>
                          <p className="text-muted-foreground text-center text-xs">
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