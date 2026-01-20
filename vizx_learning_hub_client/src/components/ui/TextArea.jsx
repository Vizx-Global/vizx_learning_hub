import React from "react";
import { cn } from "../../utils/cn";

const Textarea = React.forwardRef(({ className, label, description, error, required = false, disabled = false, placeholder, rows = 4, id, name, ...props }, ref) => {
  const textareaId = id || `textarea-${Math.random()?.toString(36)?.substr(2, 9)}`;

  return (
    <div className={cn("relative w-full", className)}>
      {label && <label htmlFor={textareaId} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block", error ? "text-destructive" : "text-foreground")}>{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      <div className="relative">
        <textarea ref={ref} id={textareaId} name={name} rows={rows} disabled={disabled} placeholder={placeholder} className={cn("flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px]", error && "border-destructive focus:ring-destructive", className)} {...props} />
      </div>
      {description && !error && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;