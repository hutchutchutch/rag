import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface AdvancedSettingsSectionProps {
  form: UseFormReturn<FormValues>;
}

export function AdvancedSettingsSection({ form }: AdvancedSettingsSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="languageProcessing"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Language Processing</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select language processing" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="auto-detect">Auto-detect language</SelectItem>
                <SelectItem value="specific-language">Specific language</SelectItem>
                <SelectItem value="multilingual">Multilingual</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="dimensionReduction"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Vector Dimension Reduction</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select dimension reduction" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="pca">PCA</SelectItem>
                <SelectItem value="t-sne">t-SNE</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="distanceMetric"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Distance Metric</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="input-highlight animated-border">
                  <SelectValue placeholder="Select distance metric" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#303030] border-gray-600 text-white">
                <SelectItem value="cosine">Cosine</SelectItem>
                <SelectItem value="euclidean">Euclidean</SelectItem>
                <SelectItem value="dot">Dot Product</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </>
  );
}
