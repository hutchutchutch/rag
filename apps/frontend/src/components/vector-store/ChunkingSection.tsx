import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { cn } from "@/lib/utils";

interface ChunkingSectionProps {
  form: UseFormReturn<FormValues>;
  className?: string;
}

const METADATA_OPTIONS = [
  { value: "page-numbers", label: "Page Numbers" },
  { value: "section-titles", label: "Section Titles" },
  { value: "timestamps", label: "Timestamps" },
  { value: "urls", label: "URLs" },
  { value: "entities", label: "Named Entities" }
];

export function ChunkingSection({ form, className }: ChunkingSectionProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="chunkingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chunking Method</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select chunking method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="recursive">Recursive</SelectItem>
                  <SelectItem value="fixed-size">Fixed Size</SelectItem>
                  <SelectItem value="sentence">Sentence-based</SelectItem>
                  <SelectItem value="paragraph">Paragraph-based</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chunkSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chunk Size (tokens)</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={100}
                  max={8000}
                  step={100}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Current size: {field.value} tokens
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chunkOverlap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chunk Overlap (%)</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  min={0}
                  max={50}
                  step={5}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Current overlap: {field.value}%
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="extractMetadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata Extraction</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {METADATA_OPTIONS.map(option => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name="extractMetadata"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...(field.value || []), option.value]
                                : (field.value || []).filter(val => val !== option.value);
                              field.onChange(newValue);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 