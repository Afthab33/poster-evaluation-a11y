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
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  LinkIcon,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Maximize,
  BarChart2
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function HyperlinksAnalysisPage() {
  const navigate = useNavigate();
  const [hyperlinksData, setHyperlinksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load hyperlinks data from sessionStorage
  useEffect(() => {
    setLoading(true);
    try {
      const dataStr = sessionStorage.getItem("analysisData");
      if (!dataStr) {
        setError("No analysis data found. Please upload a poster first.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(dataStr);
      if (!data.hyperlinks || !Array.isArray(data.hyperlinks)) {
        setHyperlinksData([]);
      } else {
        setHyperlinksData(data.hyperlinks);
      }
    } catch (error) {
      console.error("Error processing hyperlinks data:", error);
      setError("Error processing hyperlinks data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const validLinks = hyperlinksData.filter((link) => link.valid).length;
  const invalidLinks = hyperlinksData.length - validLinks;
  const validPercentage = hyperlinksData.length > 0 
    ? Math.round((validLinks / hyperlinksData.length) * 100) 
    : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-muted-foreground">Loading hyperlinks analysis...</p>
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
          {/* Top navigation */}
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
            
            {/* Metrics navigation dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1 h-8 text-xs">
                  <LinkIcon className="h-3 w-3 text-primary" />
                  <span>Switch Metric</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/analysis/contrast")}>
                  <span className="text-xs">Color Contrast</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/logo")}>
                  <span className="text-xs">Logo Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-xs">Hyperlinks</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/resolution")}>
                  <span className="text-xs">Resolution</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/authors")}>
                  <span className="text-xs">Authors</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/fonts")}>
                  <span className="text-xs">Font Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/tables")}>
                  <span className="text-xs">Tables</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analysis/diagrams")}>
                  <span className="text-xs">Diagrams</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg font-bold text-primary">
                    Hyperlinks Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Evaluation of hyperlinks and references for accessibility
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
                <>
                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Card className="overflow-hidden">
                      <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <LinkIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total Links</p>
                          <p className="text-xl font-bold">{hyperlinksData.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Valid Links</p>
                          <p className="text-xl font-bold">{validLinks}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Invalid Links</p>
                          <p className="text-xl font-bold">{invalidLinks}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Links list */}
                  <Card className="mb-3">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">Hyperlinks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {hyperlinksData.length > 0 ? (
                        <ScrollArea className="h-[240px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="py-1.5 text-xs">URL</TableHead>
                                <TableHead className="w-[90px] text-right py-1.5 text-xs">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {hyperlinksData.map((link, index) => (
                                <TableRow key={index}>
                                  <TableCell className="py-1">
                                    <a 
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80 flex items-center gap-1 max-w-lg truncate text-xs"
                                    >
                                      {link.url}
                                      <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                                    </a>
                                  </TableCell>
                                  <TableCell className="text-right py-1">
                                    {link.valid ? (
                                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary flex items-center gap-1 ml-auto text-[10px] py-0 px-1.5">
                                        <CheckCircle className="h-2.5 w-2.5" />
                                        Valid
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 ml-auto text-[10px] py-0 px-1.5">
                                        <XCircle className="h-2.5 w-2.5" />
                                        Invalid
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-6 border border-dashed rounded-md">
                          <Info className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground text-xs">No hyperlinks were found in the poster.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {invalidLinks > 0 && (
                    <Alert variant="destructive" className="bg-destructive/5 text-destructive py-1.5 mb-3">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertTitle className="text-xs">Invalid Links Detected</AlertTitle>
                      <AlertDescription className="text-xs">
                        <p className="mb-1">There are {invalidLinks} invalid hyperlinks which may impact accessibility.</p>
                        <div className="grid grid-cols-2 gap-x-1 gap-y-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-destructive text-xs">•</span>
                            <span className="text-xs">Confusion for users</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-destructive text-xs">•</span>
                            <span className="text-xs">Reduced credibility</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-destructive text-xs">•</span>
                            <span className="text-xs">Navigation problems</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-destructive text-xs">•</span>
                            <span className="text-xs">Screen reader issues</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {hyperlinksData.length > 0 && validLinks === hyperlinksData.length && (
                    <Alert className="bg-secondary/5 border-secondary py-1.5 mb-3">
                      <CheckCircle className="h-3 w-3 text-secondary" />
                      <AlertTitle className="text-xs">All Links Valid</AlertTitle>
                      <AlertDescription className="text-xs">
                        Great job! All hyperlinks in the document are valid, providing good accessibility.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="p-2 bg-muted rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium mb-1">Hyperlink Accessibility Guidelines</h4>
                        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-primary text-xs">•</span>
                            <span className="text-xs text-muted-foreground">Use valid URLs</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-primary text-xs">•</span>
                            <span className="text-xs text-muted-foreground">Use descriptive text</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-primary text-xs">•</span>
                            <span className="text-xs text-muted-foreground">Make links visible</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-primary text-xs">•</span>
                            <span className="text-xs text-muted-foreground">Use proper encoding</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Pagination controls for navigating between metrics */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors h-7 text-xs"
              onClick={() => navigate("/analysis/logo")}
            >
              <ChevronLeft className="h-3 w-3" />
              Logo Analysis
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors h-7 text-xs"
              onClick={() => navigate("/analysis/resolution")}
            >
              Resolution
              <Maximize className="h-3 w-3 ml-1" />
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}