import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Pill, Lock, Unlock, ShieldCheck } from "lucide-react";

const PharmacyPortal = ({ patient, decodedDrugs, isProcessing }) => {
  const encrypted = patient?.scrambled_med || "NULL";

  let decryptedDisplay = "AWAITING DATA...";
  if (isProcessing) {
    decryptedDisplay = "DECRYPTING ENGINE...";
  } else if (decodedDrugs && decodedDrugs.length > 0) {
    decryptedDisplay = decodedDrugs.join(", ");
  }

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
              Raw Payload
            </div>
            <p className="font-mono text-xl text-muted-foreground/80 break-all tracking-wider">
              {encrypted}
            </p>
          </div>

          <div className="border-2 rounded-lg p-5 bg-primary/5 border-primary/20 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Unlock className="h-3.5 w-3.5" />
              Python Backend Result
            </div>
            <p className="font-mono text-2xl font-black text-primary uppercase">
              {decryptedDisplay}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold uppercase tracking-tight">
          <ShieldCheck className="h-4 w-4" />
          <span>Pipeline validation secured. Synchronized with Backend.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyPortal;
