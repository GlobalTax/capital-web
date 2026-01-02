import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatNumberWithDots, parseNumberWithDots } from "@/utils/numberFormatting";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, suffix = "€", className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => 
      value > 0 ? formatNumberWithDots(value) : ''
    );

    // Sync display value when external value changes (e.g., reset form)
    React.useEffect(() => {
      if (value === 0 && displayValue !== '') {
        setDisplayValue('');
      } else if (value > 0) {
        const parsed = parseNumberWithDots(displayValue);
        if (parsed !== value) {
          setDisplayValue(formatNumberWithDots(value));
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // Allow only digits and dots (European format)
      const sanitized = input.replace(/[^\d.]/g, '');
      setDisplayValue(sanitized);
    };

    const handleBlur = () => {
      const parsed = parseNumberWithDots(displayValue);
      onChange(parsed);
      // Format the display value
      if (parsed > 0) {
        setDisplayValue(formatNumberWithDots(parsed));
      } else {
        setDisplayValue('');
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn("pr-8", className)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
