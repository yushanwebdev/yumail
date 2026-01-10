import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export function PageLayout({ children, maxWidth = "3xl" }: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className={`mx-auto ${maxWidthClasses[maxWidth]} px-4 py-6`}>
        {children}
      </div>
    </div>
  );
}
