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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Users, 
  Building, 
  Mail, 
  CheckCircle,
  Info,
  ExternalLink,
  UserX
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function AuthorsAnalysisPage() {
  const navigate = useNavigate();
  const [authorsData, setAuthorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate statistics
  const totalAuthors = authorsData.length;
  const authorsWithAffiliation = authorsData.filter(a => a.affiliation).length;
  const authorsWithEmail = authorsData.filter(a => a.email).length;

  useEffect(() => {
    // Fetch data from sessionStorage
    try {
      const dataStr = sessionStorage.getItem('analysisData');
      if (!dataStr) {
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(dataStr);
      if (data.authors) {
        // Handle different author data formats
        let authors = [];
        if (Array.isArray(data.authors)) {
          // If authors is already an array of strings, convert to objects
          authors = data.authors.map(author => {
            // Check if author is already an object or just a string
            if (typeof author === 'string') {
              return { 
                name: author,
                affiliation: null,
                email: null,
                image_path: null
              };
            }
            return author;
          });
        }
        
        setAuthorsData(authors);
      }
    } catch (error) {
      console.error('Error parsing analysis data:', error);
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
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-3"></div>
            <p className="text-muted-foreground text-sm">Loading author analysis...</p>
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
      
      <main className="flex-1 py-4">
        <div className="container mx-auto px-3 pl-[60px]">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary mb-3 -ml-2 flex items-center gap-1 h-8 text-sm"
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
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">
                      Authors Analysis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Author information detected in poster
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="text-center px-3 py-1 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground">Authors</div>
                    <div className="text-base font-bold">
                      {totalAuthors}
                    </div>
                  </div>
                  
                  {authorsWithAffiliation > 0 && (
                    <div className="text-center px-3 py-1 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">With Affiliation</div>
                      <div className="text-base font-bold text-primary">
                        {authorsWithAffiliation}
                      </div>
                    </div>
                  )}
                  
                  {authorsWithEmail > 0 && (
                    <div className="text-center px-3 py-1 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">With Email</div>
                      <div className="text-base font-bold text-secondary">
                        {authorsWithEmail}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3 px-4">
              {/* Status message */}
              {totalAuthors > 0 ? (
                <>
                  <div className="mb-4">
                    <Alert className="bg-secondary/10 border-secondary py-2">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <AlertTitle className="text-sm">Author Information Detected</AlertTitle>
                      <AlertDescription className="mt-1 text-xs">
                        We've identified {totalAuthors} author{totalAuthors !== 1 ? 's' : ''} in your poster. 
                        {authorsWithEmail > 0 && ` ${authorsWithEmail} author${authorsWithEmail !== 1 ? 's have' : ' has'} contact information.`}
                        {authorsWithAffiliation > 0 && ` ${authorsWithAffiliation} author${authorsWithAffiliation !== 1 ? 's have' : ' has'} affiliation details.`}
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  {/* Authors section */}
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        Authors List
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {authorsData.map((author, index) => (
                          <Card 
                            key={index}
                            className="border overflow-hidden"
                          >
                            <CardContent className="p-3">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                  <h3 className="text-sm font-semibold text-foreground">
                                    {author.name}
                                  </h3>
                                  
                                  {author.affiliation && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Building className="h-3 w-3" />
                                      <span>{author.affiliation}</span>
                                    </div>
                                  )}
                                  
                                  {author.email && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Mail className="h-3 w-3" />
                                      <span>{author.email}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {author.email && (
                                  <div>
                                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary text-xs py-0">
                                      <span className="flex items-center gap-1">
                                        <CheckCircle className="h-2.5 w-2.5" />
                                        Contact Available
                                      </span>
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Best practices */}
                  <Card className="mt-3">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm flex items-center gap-1">
                        <Info className="h-4 w-4 text-primary" />
                        Author Information Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-2">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Good author information practices help your research reach a wider audience:
                        </p>
                        
                        <ul className="space-y-1">
                          <li className="flex items-start gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-xs">Include all contributing authors with their full names</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-xs">Consider including institutional affiliations for authors</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-xs">Where appropriate, include contact details for correspondence</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-xs">Consider adding ORCID identifiers or other academic profiles</span>
                          </li>
                        </ul>
                        
                        <div className="mt-2 text-xs">
                          <Button 
                            variant="link" 
                            className="text-primary p-0 h-auto text-xs"
                            onClick={() => window.open("https://www.apa.org/pubs/journals/resources/author-order", "_blank")}
                          >
                            <span className="flex items-center gap-1">
                              Learn more about author information guidelines
                              <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                // No authors found
                <Card className="border-dashed border-2">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <UserX className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      No Authors Found
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      No author information was detected in the analyzed poster. Author details help with proper attribution of your research.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
            <CardFooter className="border-t border-border pt-3 pb-3 px-4 flex justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 inline" />
                Author information helps with proper attribution of academic work
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}