import React from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, children, id, checked, ...props }, ref) => {
    return (
      <input
        id={id}
        ref={ref}
        checked={checked}
        aria-checked={checked}
        type="checkbox"
        className={cn(
          "size-4 rounded-md border border-neutral-700 bg-neutral-800",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Label = ({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
};
