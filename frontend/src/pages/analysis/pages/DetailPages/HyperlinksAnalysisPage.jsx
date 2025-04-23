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
  CardFooter,
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
} from "lucide-react";

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
                <LinkIcon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Hyperlinks Analysis
                  </CardTitle>
                  <CardDescription>
                    Evaluation of hyperlinks and references for accessibility
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
                <>
                  {/* Stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <LinkIcon className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Total Links</p>
                        <p className="text-3xl font-bold">{hyperlinksData.length}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                          <CheckCircle className="h-6 w-6 text-secondary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Valid Links</p>
                        <p className="text-3xl font-bold">{validLinks}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                          <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">Invalid Links</p>
                        <p className="text-3xl font-bold">{invalidLinks}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Links list */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hyperlinks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {hyperlinksData.length > 0 ? (
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>URL</TableHead>
                                <TableHead className="w-[100px] text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {hyperlinksData.map((link, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <a 
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80 flex items-center gap-1 max-w-lg truncate"
                                    >
                                      {link.url}
                                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                    </a>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {link.valid ? (
                                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary flex items-center gap-1 ml-auto">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Valid
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 ml-auto">
                                        <XCircle className="h-3.5 w-3.5" />
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
                        <div className="text-center py-12 border-2 border-dashed rounded-md">
                          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg">No hyperlinks were found in the poster.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {invalidLinks > 0 && (
                    <div className="mt-6">
                      <Alert variant="destructive" className="bg-destructive/5 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Invalid Links Detected</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">There are {invalidLinks} invalid hyperlinks in the document which may impact accessibility.</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Invalid links may lead to confusion or frustration</li>
                            <li>Broken references reduce the scientific credibility</li>
                            <li>Users with assistive technology may be unable to navigate properly</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {hyperlinksData.length > 0 && validLinks === hyperlinksData.length && (
                    <div className="mt-6">
                      <Alert className="bg-secondary/5 border-secondary">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <AlertTitle>All Links Valid</AlertTitle>
                        <AlertDescription>
                          Great job! All hyperlinks in the document are valid, providing good accessibility and user experience.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  <div className="mt-8 p-4 bg-muted rounded-md">
                    <div className="flex items-start gap-4">
                      <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Hyperlink Accessibility Guidelines</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          For optimal accessibility, hyperlinks should:
                        </p>
                        <ul className="text-sm space-y-1 ml-5 list-disc text-muted-foreground">
                          <li>Be valid and functional</li>
                          <li>Have descriptive link text (avoid "click here")</li>
                          <li>Be visually distinguishable from surrounding text</li>
                          <li>Include proper URL encoding</li>
                          <li>Open in a predictable manner (use external link indicators when opening in new windows)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}