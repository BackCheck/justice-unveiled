import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "hrpm_cookie_consent";

type ConsentChoice = "accepted" | "rejected" | null;

export const CookieConsent = () => {
  const [consent, setConsent] = useState<ConsentChoice>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    } else {
      // Small delay for smoother appearance
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsent("accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsent("rejected");
    setIsVisible(false);
  };

  // Don't render if user already made a choice
  if (consent) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-500 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Cookie Notice
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your experience on our platform. These help us understand how you use HRPM 
                and improve our services. By continuing to browse, you agree to our use of cookies.{" "}
                <a
                  href="/about"
                  className="text-primary hover:underline font-medium"
                >
                  Learn more
                </a>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="flex-1 md:flex-none"
              >
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 md:flex-none"
              >
                Accept All
              </Button>
            </div>

            {/* Close button (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReject}
              className="absolute top-2 right-2 h-8 w-8 md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
