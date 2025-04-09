import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface EmbeddingConfigSectionProps {
  form: UseFormReturn<FormValues>;
}

export function EmbeddingConfigSection({ form }: EmbeddingConfigSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="modelDimensions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Model Dimensions</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select dimensions" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="384">384</SelectItem>
                <SelectItem value="768">768</SelectItem>
                <SelectItem value="1536">1536</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="contextualSetting"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Contextual Setting</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select contextual setting" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="with-context">With document context</SelectItem>
                <SelectItem value="without-context">Without context</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="batchSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Batch Processing</FormLabel>
            <Select
              value={field.value?.toString() || ""}
              onValueChange={(val) => field.onChange(parseInt(val))}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select batch size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="16">Batch size: 16</SelectItem>
                <SelectItem value="32">Batch size: 32</SelectItem>
                <SelectItem value="64">Batch size: 64</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </>
  );
}
