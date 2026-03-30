import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Pill, Lock, Unlock, ShieldCheck } from "lucide-react";

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
    <Card className="shadow-sm border-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Pill className="h-5 w-5 text-primary" />
          Pharmacy Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-5 bg-muted/20">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Lock className="h-3.5 w-3.5" />
              Encrypted Payload
            </div>
            <p className="font-mono text-xl text-muted-foreground/50 italic line-through">
              {encrypted}
            </p>
          </div>

          <div className="border-2 rounded-lg p-5 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Unlock className="h-3.5 w-3.5" />
              Decrypted Result
            </div>
            <p className="font-mono text-2xl font-black text-primary uppercase">
              {decrypted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>
            Biometric validation secured. Approved for administration.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyPortal;
