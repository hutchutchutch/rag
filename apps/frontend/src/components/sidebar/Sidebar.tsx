import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Database, 
  Search, 
  Settings 
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useRagPipeline } from "../../hooks/use-rag-pipeline";
import { SidebarItem } from "./SidebarItem";

interface SidebarProps {
  position: "left" | "right";
  title: string;
  children?: React.ReactNode;
}

export function Sidebar({ position, title, children }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { processDocument, isPreparing } = useRagPipeline();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      alert("Please upload a markdown file");
      return;
    }
    
    processDocument(file, {
      chunkSize: 1024,
      overlap: 200,
      cleaner: "simple",
      strategy: "fixed",
      model: "gpt-3.5-turbo"
    }).catch(error => {
      console.error("Error processing document:", error);
      alert("Failed to process document. Please try again.");
    });
  };

  if (collapsed) {
    return (
      <Card className={`h-full w-16 rounded-none border-0 shadow-none ${
        position === "left" ? "border-r" : "border-l"
      } border-dark-700 bg-dark-900`}>
        <div className="flex flex-col items-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="mb-6"
          >
            {position === "left" ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {position === "left" ? "Expand left sidebar" : "Expand right sidebar"}
            </span>
          </Button>
          
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-dark-300 hover:text-primary-400"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPreparing}
            >
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload document</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-dark-300 hover:text-primary-400"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-dark-300 hover:text-primary-400"
            >
              <Database className="h-4 w-4" />
              <span className="sr-only">Database</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-dark-300 hover:text-primary-400"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.markdown"
          className="hidden"
        />
      </Card>
    );
  }

  return (
    <Card className={`h-full w-80 rounded-none border-0 shadow-none ${
      position === "left" ? "border-r" : "border-l"
    } border-dark-700 bg-dark-900`}>
      <div className="flex items-center justify-between border-b border-dark-700 p-4">
        <h2 className="text-lg font-semibold text-dark-50">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
        >
          {position === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="sr-only">
            {position === "left" ? "Collapse left sidebar" : "Collapse right sidebar"}
          </span>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)]">
        {children}
      </ScrollArea>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".md,.markdown"
        className="hidden"
      />
    </Card>
  );
}