import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface MetadataOptionsSectionProps {
  form: UseFormReturn<FormValues>;
}

export function MetadataOptionsSection({ form }: MetadataOptionsSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="metadataExtraction"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Automatic Extraction</FormLabel>
            <Select
              value={field.value ? field.value[0] : ""}
              onValueChange={(val) => field.onChange([val])}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select metadata extraction" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="page-numbers">Page numbers</SelectItem>
                <SelectItem value="section-titles">Section titles</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="storeOriginalText"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-gray-300">Store Original Text</FormLabel>
            </div>
            <FormControl>
              <div 
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${field.value ? "bg-gray-700" : "bg-gray-600"}`}
                onClick={() => field.onChange(!field.value)}
              >
                <div 
                  className={`bg-white rounded-full h-4 w-4 shadow-md transform transition-transform ${field.value ? "translate-x-5" : "translate-x-0"}`} 
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="documentStructure"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Document Structure</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select document structure" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="preserve-hierarchy">Preserve hierarchy</SelectItem>
                <SelectItem value="flatten-structure">Flatten structure</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </>
  );
}
