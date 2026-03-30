import {
  User,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  Cpu,
  Unlock,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";

const IdentityCard = ({ patient }) => {
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {getInitials(patient.decoded_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Badge
                  variant="secondary"
                  className="mb-2 uppercase text-[10px] tracking-widest"
                >
                  <Shield className="h-3 w-3 mr-1" /> Identity Verified
                </Badge>
                <h2 className="text-2xl font-bold">{patient.decoded_name}</h2>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  ID: {patient.ghost_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Patient Information
              </p>
              <p className="text-sm font-semibold mt-1">
                {patient.decoded_name}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Ward Assignment
              </p>
              <p className="text-sm font-semibold mt-1 uppercase">
                {patient.ward}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Age Specification
              </p>
              <p className="text-2xl font-black mt-1">{patient.age}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary uppercase text-[10px] font-bold tracking-widest">
                <Cpu className="h-3 w-3" /> Encrypted Payload
              </div>
              <code className="text-sm font-mono text-muted-foreground break-all">
                {patient.hr_hex || "0xNULL"}
              </code>
            </div>
            <div className="space-y-1 sm:text-right">
              <div className="flex items-center gap-2 text-primary uppercase text-[10px] font-bold tracking-widest sm:justify-end">
                <Unlock className="h-3 w-3" /> Decrypted Reconstruction
              </div>
              <p className="text-xl font-bold">
                {patient.hr_decoded || patient.bpm}{" "}
                <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                  BPM
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdentityCard;
