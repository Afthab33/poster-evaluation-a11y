import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../providers/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator"; 
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowRight, CheckCircle, BarChart2, Layout, Eye, FileText, 
  Image, Link as LinkIcon, Table, Zap, MousePointer, Monitor, 
  Award, Lightbulb, ChevronRight, ArrowUpRight, AlignJustify
} from "lucide-react";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [animateHero, setAnimateHero] = useState(false);
  const [activeStat, setActiveStat] = useState(0);
  const posterRef = useRef(null);
  const statsData = [
    { number: "92%", text: "of academic posters fail at least one accessibility test" },
    { number: "45%", text: "of poster content is missed by viewers with visual impairments" },
    { number: "3x", text: "increased engagement with accessible posters" },
    { number: "71%", text: "of researchers never check their posters for accessibility" }
  ];

  useEffect(() => {
    setAnimateHero(true);
    
    // Rotate through stats
    const interval = setInterval(() => {
      setActiveStat(prev => (prev + 1) % statsData.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Poster 3D tilt effect
  const handlePosterMove = (e) => {
    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    posterRef.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.05, 1.05, 1.05)`;
  };
  
  const handlePosterLeave = () => {
    if (!posterRef.current) return;
    posterRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - With floating elements and dynamic backdrop */}
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/10 to-background -z-10"></div>
          
          {/* Animated floating shapes */}
          <div className="absolute inset-0 overflow-hidden -z-5">
            {animateHero && (
              <>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, x: -100, y: -100 }}
                  animate={{ opacity: 0.8, scale: 1, x: 0, y: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-[15%] left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-xl"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, x: 100, y: 100 }}
                  animate={{ opacity: 0.6, scale: 1, x: 0, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                  className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full bg-secondary/20 blur-xl"
                />
              </>
            )}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-1 text-left max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge variant="secondary" className="mb-3 text-secondary-foreground">Academic Accessibility Platform</Badge>
                  <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight leading-tight">
                    Transform Your <span className="relative inline-block">
                      Academic Posters
                      <motion.div 
                        className="absolute -bottom-1 left-0 w-full h-1.5 bg-secondary/60 rounded-full"
                        initial={{ width: '0%', opacity: 0 }}
                        animate={{ width: '100%', opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                      />
                    </span>
                  </h1>
                  
                  {/* Animated statistics */}
                  <div className="h-16 relative mb-4">
                    {statsData.map((stat, index) => (
                      <motion.div 
                        key={index}
                        className="absolute inset-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: activeStat === index ? 1 : 0,
                          y: activeStat === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-2xl md:text-3xl font-bold text-secondary mb-1">{stat.number}</p>
                        <p className="text-sm text-muted-foreground">{stat.text}</p>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-base md:text-lg text-muted-foreground mb-4">
                    Analyze your academic posters for accessibility issues and get actionable recommendations.
                  </p>
                  
                  <div className="flex gap-3">
                    <Button size="default" className="px-4 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:text-secondary-foreground group" asChild>
                      <a href="/upload" className="flex items-center gap-2">
                        Get Started 
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                    <Button size="default" variant="outline" className="px-4 text-sm" asChild>
                      <a href="#how-it-works" className="flex items-center gap-2">
                        How It Works <ChevronRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </div>
              
              {/* 3D Poster Mockup with hover effect */}
              <motion.div 
                className="flex-1 relative max-w-xs mx-auto md:max-w-md"
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="relative aspect-[3/4] cursor-pointer"
                  ref={posterRef}
                  onMouseMove={handlePosterMove}
                  onMouseLeave={handlePosterLeave}
                  style={{ transition: 'transform 0.2s ease-out' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary rounded-xl shadow-2xl overflow-hidden transform transition-all">
                    <div className="absolute inset-[3px] bg-card rounded-lg p-4 flex flex-col">
                      {/* Poster Content - Academic Research Poster */}
                      <div className="text-center mb-2">
                        <div className="bg-secondary/90 py-2 rounded-md mb-2">
                          <h4 className="text-sm md:text-base font-bold text-white leading-tight px-2">Neural Network Approaches to Predict Climate-Induced Migration</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Jennifer R. Martinez, PhD<sup>1</sup> • David H. Chen, MSc<sup>1</sup>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <sup>1</sup>Institute for Climate Research
                        </p>
                      </div>
                      
                      {/* Abstract */}
                      <div className="mb-2 bg-background/80 p-2 rounded-lg">
                        <h5 className="font-semibold text-primary text-xs mb-1 text-center">Abstract</h5>
                        <p className="text-[7px] text-foreground leading-tight">
                          This study presents a novel machine learning approach to predicting population displacement due to climate-related events. We developed a deep neural network model that integrates satellite imagery, historical climate data, and socioeconomic indicators.
                        </p>
                      </div>
                      
                      {/* Two-Column Layout for Methods and Results */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-background/80 p-2 rounded-lg">
                          <h5 className="font-semibold text-primary text-xs mb-1 text-center">Methodology</h5>
                          <ul className="text-[6px] list-disc list-inside text-foreground space-y-0.5">
                            <li>Multi-modal data collection</li>
                            <li>3-layer LSTM architecture</li>
                            <li>Cross-validation using data</li>
                          </ul>
                        </div>
                        
                        <div className="bg-background/80 p-2 rounded-lg">
                          <h5 className="font-semibold text-primary text-xs mb-1 text-center">Key Results</h5>
                          <ul className="text-[6px] list-disc list-inside text-foreground space-y-0.5">
                            <li>83% prediction accuracy</li>
                            <li>47% reduction in errors</li>
                            <li>Lead time improved by 3.8 months</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Data Visualization */}
                      <div className="bg-background/80 p-2 rounded-lg mb-2">
                        <h5 className="font-semibold text-primary text-xs mb-1 text-center">Model Performance</h5>
                        <div className="flex items-end justify-center h-10 gap-2 mb-1">
                          <div className="flex flex-col items-center">
                            <div className="h-5 w-6 bg-primary/50 rounded-t-sm"></div>
                            <span className="text-[5px] mt-0.5">Statistical</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="h-7 w-6 bg-primary/70 rounded-t-sm"></div>
                            <span className="text-[5px] mt-0.5">Random Forest</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-6 bg-secondary/70 rounded-t-sm"></div>
                            <span className="text-[5px] mt-0.5">Our Model</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-6 bg-primary/60 rounded-t-sm"></div>
                            <span className="text-[5px] mt-0.5">Ensemble</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Conclusions */}
                      <div className="bg-background/80 p-2 rounded-lg mb-2">
                        <h5 className="font-semibold text-primary text-xs mb-1 text-center">Conclusions</h5>
                        <p className="text-[6px] text-foreground leading-tight">
                          Our neural network model demonstrates significant improvements in predicting climate-induced migration patterns. The enhanced lead time provides crucial advantages for humanitarian response planning.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating evaluation elements */}
                  <motion.div 
                    className="absolute -right-6 top-1/4 bg-card p-2 rounded-lg shadow-lg border border-border flex items-center gap-1.5 z-20"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    whileHover={{ y: -3, scale: 1.05 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                      <BarChart2 className="h-3 w-3 text-destructive" />
                    </div>
                    <div>
                      <div className="text-[8px] font-medium">Contrast Ratio</div>
                      <div className="text-destructive text-[8px] font-semibold">2.4:1 (Fail)</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -left-6 top-1/2 bg-card p-2 rounded-lg shadow-lg border border-border flex items-center gap-1.5 z-20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    whileHover={{ y: -3, scale: 1.05 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <FileText className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <div className="text-[8px] font-medium">Font Size</div>
                      <div className="text-primary text-[8px] font-semibold">12pt (Pass)</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-6 left-1/3 bg-card p-2 rounded-lg shadow-lg border border-border flex items-center gap-1.5 z-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    whileHover={{ y: -3, scale: 1.05 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Image className="h-3 w-3 text-secondary" />
                    </div>
                    <div>
                      <div className="text-[8px] font-medium">Resolution</div>
                      <div className="text-secondary text-[8px] font-semibold">300 DPI (Pass)</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works - With animated steps and connections */}
        <section id="how-it-works" className="py-10 bg-card/30 dark:bg-card/5 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-8"
            >
              <Badge variant="outline" className="mb-2 bg-primary/5 text-primary">Simple 3-Step Process</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Our AI-powered system analyzes your academic posters and provides detailed accessibility recommendations
              </p>
            </motion.div>
            
            <div className="relative max-w-4xl mx-auto">
              {/* Process connector line with animation */}
              <motion.div 
                className="absolute left-1/2 top-12 bottom-12 w-1 bg-gradient-to-b from-secondary via-primary to-secondary -z-10 hidden md:block"
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              ></motion.div>
              
              <div className="grid md:grid-cols-3 gap-4 md:gap-6 justify-center">
                {/* Step 1 */}
                <motion.div 
                  className="flex flex-col items-center text-center relative bg-card rounded-lg p-4 shadow-md border border-border hover:border-secondary/50 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-xl font-bold text-white mb-3 relative z-10 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    1
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Upload Your Poster</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Upload your academic poster in PDF, PNG, or JPG format.</p>
                </motion.div>
                
                {/* Step 2 */}
                <motion.div 
                  className="flex flex-col items-center text-center relative bg-card rounded-lg p-4 shadow-md border border-border hover:border-primary/50 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xl font-bold text-white mb-3 relative z-10 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    2
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Automated Analysis</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Our system evaluates accessibility using WCAG guidelines.</p>
                </motion.div>
                
                {/* Step 3 */}
                <motion.div 
                  className="flex flex-col items-center text-center relative bg-card rounded-lg p-4 shadow-md border border-border hover:border-secondary/50 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ y: -3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-xl font-bold text-white mb-3 relative z-10 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    3
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Recommendations</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Get actionable recommendations to enhance accessibility.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Interactive with animations */}
        <section className="py-10 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-6"
            >
              <Badge variant="outline" className="mb-2 bg-primary/5 text-primary">Comprehensive Analysis</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                What We <span className="text-primary">Analyze</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Our platform performs a comprehensive analysis of your academic posters
              </p>
            </motion.div>
            
            <Tabs defaultValue="contrast" className="max-w-3xl mx-auto">
              <div className="relative">
                <ScrollArea className="max-w-full pb-2">
                  <TabsList className="flex w-full min-w-max bg-card/50 p-1 border-b border-border mb-4">
                    <TabsTrigger 
                      value="contrast" 
                      className="flex gap-1 items-center data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-secondary text-xs"
                    >
                      <BarChart2 className="h-3 w-3" /> Contrast
                    </TabsTrigger>
                    <TabsTrigger 
                      value="text" 
                      className="flex gap-1 items-center data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-secondary text-xs"
                    >
                      <FileText className="h-3 w-3" /> Text
                    </TabsTrigger>
                    <TabsTrigger 
                      value="images" 
                      className="flex gap-1 items-center data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-secondary text-xs"
                    >
                      <Image className="h-3 w-3" /> Images
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tables" 
                      className="flex gap-1 items-center data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-secondary text-xs"
                    >
                      <Table className="h-3 w-3" /> Tables
                    </TabsTrigger>
                    <TabsTrigger 
                      value="links" 
                      className="flex gap-1 items-center data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-secondary text-xs"
                    >
                      <LinkIcon className="h-3 w-3" /> Links
                    </TabsTrigger>
                    <TabsTrigger 
                      value="layout" 
                      className="flex gap-1 items-center data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-secondary text-xs"
                    >
                      <Layout className="h-3 w-3" /> Layout
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>
              </div>
              
              <div className="relative">
                <motion.div 
                  className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl -z-10"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <div className="border border-border rounded-xl p-4 bg-card/95 backdrop-blur-sm shadow-xl">
                  <TabsContent value="contrast" className="mt-0 space-y-4">
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      <div className="w-full md:w-auto flex-shrink-0">
                        <motion.div 
                          className="w-full md:w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <BarChart2 className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">Color Contrast Analysis</h3>
                        <p className="text-foreground text-sm mb-4">
                          Poor color contrast makes content difficult to read, especially for people with visual impairments. 
                          We analyze text-background combinations against WCAG 2.1 AA standards.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Text-background ratio</h4>
                                  <p className="text-xs text-muted-foreground">Evaluates contrast</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Color combinations</h4>
                                  <p className="text-xs text-muted-foreground">Identifies issues</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="text" className="mt-0 space-y-4">
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      <div className="w-full md:w-auto flex-shrink-0">
                        <motion.div 
                          className="w-full md:w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <FileText className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">Font Analysis</h3>
                        <p className="text-foreground text-sm mb-4">
                          Small or decorative fonts can be difficult to read from typical viewing distances.
                          We evaluate text size, spacing, and readability for conference environments.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Font size evaluation</h4>
                                  <p className="text-xs text-muted-foreground">Analyzes sizes for optimal viewing</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Text spacing</h4>
                                  <p className="text-xs text-muted-foreground">Checks readability standards</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="images" className="mt-0 space-y-4">
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      <div className="w-full md:w-auto flex-shrink-0">
                        <motion.div 
                          className="w-full md:w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <Image className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">Image Resolution</h3>
                        <p className="text-foreground text-sm mb-4">
                          Low-resolution images can make important content appear blurry or unreadable.
                          We verify resolution and quality based on DPI best practices.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">DPI evaluation</h4>
                                  <p className="text-xs text-muted-foreground">Ensures proper resolution</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Image clarity</h4>
                                  <p className="text-xs text-muted-foreground">Identifies low-quality content</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tables" className="mt-0 space-y-4">
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      <div className="w-full md:w-auto flex-shrink-0">
                        <motion.div 
                          className="w-full md:w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <Table className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">Table & Diagram Analysis</h3>
                        <p className="text-foreground text-sm mb-4">
                          Tables and diagrams with poor structure create barriers. We analyze for proper labeling, 
                          organization, and readability for all users.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Table structure</h4>
                                  <p className="text-xs text-muted-foreground">Evaluates organization and labeling</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Diagram clarity</h4>
                                  <p className="text-xs text-muted-foreground">Checks for visual complexity issues</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="links" className="mt-0 space-y-4">
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      <div className="w-full md:w-auto flex-shrink-0">
                        <motion.div 
                          className="w-full md:w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <LinkIcon className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">Hyperlink Checking</h3>
                        <p className="text-foreground text-sm mb-4">
                          QR codes and hyperlinks must be accessible and descriptive. We check link functionality
                          and evaluate if they're screen reader friendly.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Link validation</h4>
                                  <p className="text-xs text-muted-foreground">Checks for broken or ambiguous links</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">QR code sizing</h4>
                                  <p className="text-xs text-muted-foreground">Ensures codes are properly sized for scanning</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="layout" className="mt-0 space-y-4">
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      <div className="w-full md:w-auto flex-shrink-0">
                        <motion.div 
                          className="w-full md:w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <Layout className="h-8 w-8 text-primary" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-2">Layout Structure</h3>
                        <p className="text-foreground text-sm mb-4">
                          Proper layout ensures that all users can navigate content logically. We analyze poster structure
                          and information flow for accessibility.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Section hierarchy</h4>
                                  <p className="text-xs text-muted-foreground">Evaluates heading and content organization</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="pt-4 pb-4 px-3">
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">Reading flow</h4>
                                  <p className="text-xs text-muted-foreground">Analyzes logical content navigation</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-10 bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Make Your Poster Accessible?</h2>
                <p className="text-base opacity-90 mb-6">
                  Join thousands of students who have improved their academic posters
                </p>
                
                <div className="flex justify-center">
                  <Button size="default" className="px-6 bg-white text-primary hover:bg-white/90 hover:text-primary shadow-lg" asChild>
                    <a href="/upload">Analyze Your Poster Now</a>
                  </Button>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-secondary" />
                    <span className="text-white/90">Free for academic use</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-white/90">WCAG 2.1 compliant</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-secondary" />
                    <span className="text-white/90">Privacy focused</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

// Additional component for the shield icon since it was missing
function Shield(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}