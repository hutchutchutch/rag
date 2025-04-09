import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface PreprocessingSectionProps {
  form: UseFormReturn<FormValues>;
}

const TEXT_CLEANING_OPTIONS = [
  { value: "remove-special-chars", label: "Remove Special Characters" },
  { value: "remove-extra-whitespace", label: "Remove Extra Whitespace" },
  { value: "remove-urls", label: "Remove URLs" },
  { value: "remove-email-addresses", label: "Remove Email Addresses" },
  { value: "remove-phone-numbers", label: "Remove Phone Numbers" }
];

export function PreprocessingSection({ form }: PreprocessingSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="textCleaning"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Text Cleaning</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {TEXT_CLEANING_OPTIONS.map(option => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="textCleaning"
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="removeStopwords"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Remove Stopwords</FormLabel>
                <p className="text-xs text-gray-400">
                  Remove common words that don't add meaning
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="useLemmatization"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Use Lemmatization</FormLabel>
                <p className="text-xs text-gray-400">
                  Convert words to their base form
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 