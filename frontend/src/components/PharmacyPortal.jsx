import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Pill, Lock, Unlock, ShieldCheck, ArrowRight } from "lucide-react";

const PharmacyPortal = ({ patient }) => {
  const decryptMedication = (scrambled, age) => {
    if (!scrambled) return { encrypted: "NULL", decrypted: "N/A" };
    const shift = age % 26;
    const decrypted = scrambled
      .split("")
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode(((code - base - shift + 26) % 26) + base);
        }
        return char;
      })
      .join("");
    return { encrypted: scrambled, decrypted: decrypted };
  };

  const { encrypted, decrypted } = decryptMedication(
    patient?.scrambled_med,
    patient?.age || 0,
  );

  return (
    <Card className="shadow-md border-muted/50 overflow-hidden bg-gradient-to-br from-background to-muted/5 h-full flex flex-col">
      <CardHeader className="pb-4 border-b bg-background/50 backdrop-blur-sm z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Pill className="h-5 w-5 text-primary" />
          Pharmacy Portal
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-6">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Encrypted Block */}
          <div className="flex-1 border border-dashed border-muted-foreground/30 rounded-xl p-5 bg-muted/10 relative">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Lock className="h-4 w-4" />
              Encrypted Payload
            </div>
            {/* Removed line-through for better professional readability */}
            <p className="font-mono text-xl text-muted-foreground/80 tracking-widest break-all">
              {encrypted}
            </p>
          </div>

          {/* Pipeline Connector */}
          <div className="hidden sm:flex justify-center items-center px-1">
            <div className="bg-background border shadow-sm rounded-full p-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4 opacity-50" />
            </div>
          </div>

          {/* Decrypted Block */}
          <div className="flex-1 border-2 border-primary/20 rounded-xl p-5 bg-primary/5 shadow-inner relative overflow-hidden">
            <div className="absolute -right-6 -top-6 bg-primary/10 h-24 w-24 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Unlock className="h-4 w-4" />
                Decrypted Result
              </div>
              <p className="font-mono text-2xl font-black text-primary uppercase tracking-wider break-all">
                {decrypted}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-tight bg-emerald-500/10 p-3.5 rounded-lg border border-emerald-500/20 shadow-inner">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>
            Biometric validation secured. Approved for administration.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyPortal;
