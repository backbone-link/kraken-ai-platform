import { cn } from "@/lib/utils";

interface ToggleProps {
  on: boolean;
  onChange?: () => void;
  className?: string;
}

export const Toggle = ({ on, onChange, className }: ToggleProps) => (
  <button
    role="switch"
    type="button"
    aria-checked={on}
    onClick={onChange}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
      on ? "bg-accent" : "bg-white/15",
      className,
    )}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
        on ? "translate-x-[18px]" : "translate-x-0.5",
      )}
    />
  </button>
);
