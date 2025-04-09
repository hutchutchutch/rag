import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface TextProcessingSectionProps {
  form: UseFormReturn<FormValues>;
}

export function TextProcessingSection({ form }: TextProcessingSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="strategy"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Chunking Method</FormLabel>
            <div>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select chunking method" />
                </SelectTrigger>
                <SelectContent className="bg-[#303030] border-gray-600 text-white">
                  <SelectItem value="fixed">Fixed Size</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="sliding">Sliding Window</SelectItem>
                  <SelectItem value="recursive">Recursive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="chunkSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Chunk Size</FormLabel>
              <div>
                <Select
                  value={field.value.toString()}
                  onValueChange={(val) => field.onChange(parseInt(val))}
                >
                  <SelectTrigger className="input-highlight animated-border">
                    <SelectValue placeholder="Select chunk size" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#303030] border-gray-600 text-white">
                    <SelectItem value="256">256 tokens</SelectItem>
                    <SelectItem value="512">512 tokens</SelectItem>
                    <SelectItem value="1024">1024 tokens</SelectItem>
                    <SelectItem value="2048">2048 tokens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="overlap"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Chunk Overlap</FormLabel>
              <div>
                <Select
                  value={field.value.toString()}
                  onValueChange={(val) => {
                    const percentage = parseInt(val);
                    const chunkSize = form.getValues("chunkSize");
                    const overlapValue = Math.round(chunkSize * (percentage / 100));
                    field.onChange(overlapValue);
                  }}
                >
                  <SelectTrigger className="input-highlight animated-border">
                    <SelectValue placeholder="Select overlap" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#303030] border-gray-600 text-white">
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="specialContentHandling"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Special Content Handling</FormLabel>
            <div>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Special content handling" />
                </SelectTrigger>
                <SelectContent className="bg-[#303030] border-gray-600 text-white">
                  <SelectItem value="keep-tables">Keep tables</SelectItem>
                  <SelectItem value="extract-tables">Extract tables as structured data</SelectItem>
                  <SelectItem value="remove-tables">Remove tables</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="cleaner"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Document Preprocessing</FormLabel>
            <div>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select a cleaner" />
                </SelectTrigger>
                <SelectContent className="bg-[#303030] border-gray-600 text-white">
                  <SelectItem value="simple">Remove headers/footers</SelectItem>
                  <SelectItem value="advanced">Clean formatting artifacts</SelectItem>
                  <SelectItem value="ocr-optimized">Keep raw text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
  );
}
