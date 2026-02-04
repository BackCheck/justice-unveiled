import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "hrpm_cookie_consent";

type ConsentType = "accepted" | "rejected" | null;

const CookieConsent = () => {
  const [consent, setConsent] = useState<ConsentType>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      // Show banner after a short delay for better UX
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

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-5 duration-500">
      <Card className={cn(
        "max-w-4xl mx-auto p-4 md:p-6",
        "bg-card/95 backdrop-blur-xl border-border/50",
        "shadow-2xl shadow-black/20"
      )}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-sm md:text-base">
                Cookie Consent
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or 
                reject non-essential cookies.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="flex-1 md:flex-none text-xs md:text-sm"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 md:flex-none text-xs md:text-sm"
            >
              Accept All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0 h-8 w-8"
              aria-label="Close cookie banner"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
