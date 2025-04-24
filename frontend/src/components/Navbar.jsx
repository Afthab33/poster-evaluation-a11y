import { useState, useEffect } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for client-side render
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/upload", label: "Upload" },
  ];

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <a
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
            aria-label="Poster A11y Home"
          >
            <img 
              src="/accessibility_favicon_revised.svg" 
              alt="Poster A11y Logo" 
              className="h-8 w-8"
            />
            <span className="text-primary">Poster A11y</span>
            {mounted && theme === "dark" && (
              <Badge variant="secondary" className="hidden sm:inline-flex">Dark Mode</Badge>
            )}
            {mounted && theme === "light" && (
              <Badge variant="outline" className="hidden sm:inline-flex">Light Mode</Badge>
            )}
          </a>

          <NavigationMenu className="ml-6 hidden md:block">
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    className="px-4 py-2 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                    href={link.href}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* <div className="flex items-center space-x-4">
          {mounted && (
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={
                theme === "light" ? "Switch to dark theme" : "Switch to light theme"
              }
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu"
                className="hover:bg-primary hover:text-primary-foreground transition-colors">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-primary">Navigation</h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close"
                    className="hover:bg-transparent hover:text-foreground hover:border-b-2 hover:border-secondary">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a
                      href={link.href}
                      className="text-foreground hover:bg-primary hover:text-primary-foreground transition-colors py-2 px-4 rounded-md"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
                <div className="flex flex-col mt-6 pt-6 border-t border-border gap-3">
                  <span className="text-muted-foreground">Theme:</span>
                  <div className="flex gap-4">
                    <Button
                      variant={theme === "light" ? "outline" : "ghost"}
                      onClick={() => setTheme("light")}
                      className="flex-1 hover:bg-transparent hover:border-b-2 hover:border-secondary"
                    >
                      <Sun className="h-4 w-4 mr-2" /> Light Mode
                    </Button>
                    <Button
                      variant={theme === "dark" ? "outline" : "ghost"}
                      onClick={() => setTheme("dark")}
                      className="flex-1 hover:bg-transparent hover:border-b-2 hover:border-secondary"
                    >
                      <Moon className="h-4 w-4 mr-2" /> Dark Mode
                    </Button>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div> */}
      </div>
    </header>
  );
}

export default Navbar;