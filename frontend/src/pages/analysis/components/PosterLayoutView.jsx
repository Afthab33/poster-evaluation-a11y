import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function PosterLayoutView({ layoutUrl }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
          {layoutUrl ? (
            <img 
              src={layoutUrl} 
              alt="Poster components breakdown showing different elements like text, images, and logos"
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-muted-foreground">No layout data available</p>
            </div>
          )}
        </AspectRatio>
      </CardContent>
    </Card>
  );
}