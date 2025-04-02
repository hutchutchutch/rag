import React from 'react';
import { useFormContext } from 'react-hook-form';

export const Form = ({ ...props }) => <form {...props} />;

export const FormItem = ({ className = '', ...props }) => (
  <div className={`space-y-2 ${className}`} {...props} />
);

export const FormLabel = ({ className = '', ...props }) => (
  <label className={`text-sm font-medium ${className}`} {...props} />
);

export const FormControl = ({ ...props }) => <div {...props} />;

export const FormMessage = ({ className = '', children, ...props }) => {
  if (!children) return null;
  return (
    <p className={`text-sm text-red-500 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const FormField = ({ name, render }: any) => {
  const form = useFormContext();
  return render({
    field: form.register(name),
    fieldState: form.getFieldState(name),
    formState: form.formState,
  });
};