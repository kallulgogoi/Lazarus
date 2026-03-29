import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import IdentityCard from "./components/IdentityCard";
import VitalsChart from "./components/VitalsChart";
import PharmacyPortal from "./components/PharmacyPortal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Menu,
  Search,
  Database,
  AlertTriangle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const App = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debounce state
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);
  const observer = useRef();
  const scrollContainerRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const lowerQuery = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.decoded_name.toLowerCase().includes(lowerQuery) ||
        p.ghost_id.toLowerCase().includes(lowerQuery),
    );
  }, [patients, searchQuery]);

  const fetchPatients = useCallback(
    async (pageNum) => {
      if (fetchingRef.current || !hasMore) return;

      fetchingRef.current = true;
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/patients?skip=${pageNum * 20}&limit=20`,
        );
        const data = await response.json();

        const formatted = data.map((p) => ({
          ghost_id: p.patient_id,
          decoded_name: p.patient_name || "Unknown Identity",
          age: p.age,
          ward: p.status || "Unassigned",
          bpm: p.hr_adjusted,
          spo2: p.spo2_adjusted,
          scrambled_med: p.scrambled_med || "Vtyvshasv",
        }));

        if (data.length < 20) setHasMore(false);

        setPatients((prev) => {
          const existingIds = new Set(prev.map((p) => p.ghost_id));
          const uniqueNewPatients = formatted.filter(
            (p) => !existingIds.has(p.ghost_id),
          );
          return [...prev, ...uniqueNewPatients];
        });
      } catch (error) {
        console.error("Forensic Retrieval Error:", error);
      } finally {
        fetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [hasMore],
  );

  useEffect(() => {
    if (patients.length === 0) fetchPatients(0);
  }, []);

  const lastPatientElementRef = useCallback(
    (node) => {
      if (fetchingRef.current) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => {
            const next = prev + 1;
            fetchPatients(next);
            return next;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore, fetchPatients],
  );

  const getAlertDetails = () => {
    if (!selectedPatient) return null;
    const severity = selectedPatient.ward;

    if (severity === "Critical") {
      return {
        wrapper: "bg-red-500/10 border-red-500/30",
        text: "text-red-500",
        icon: <AlertTriangle className="h-4 w-4" />,
        label: "CRITICAL",
        desc: "Vitals exceed safety thresholds. Immediate review required.",
      };
    }
    if (severity === "Warning") {
      return {
        wrapper: "bg-amber-500/10 border-amber-500/30",
        text: "text-amber-500",
        icon: <AlertCircle className="h-4 w-4" />,
        label: "WARNING",
        desc: "Unstable biometric sequence detected. Monitor closely.",
      };
    }
    return null;
  };

  const alert = getAlertDetails();

  useEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPatient?.ghost_id]);

  useEffect(() => {
    if (!selectedPatient) return;
    const newData = {
      timestamp: new Date().toLocaleTimeString(),
      bpm: selectedPatient.bpm,
      spo2: selectedPatient.spo2,
    };
    setTelemetry((prev) => [...prev.slice(-30), newData]);
  }, [selectedPatient]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <Sidebar
          patients={filteredPatients}
          onSelect={(p) => {
            setSelectedPatient(p);
            setInputValue("");
          }}
          selectedId={selectedPatient?.ghost_id}
          searchQuery={inputValue}
          setSearchQuery={setInputValue}
          lastElementRef={lastPatientElementRef}
        />
      </div>

      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative"
      >
        <div className="sticky top-0 z-[60] bg-background border-b px-4 md:px-8 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative z-[70]"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <Sidebar
                      patients={filteredPatients}
                      onSelect={(p) => {
                        setSelectedPatient(p);
                        setIsMobileMenuOpen(false);
                        setInputValue("");
                      }}
                      selectedId={selectedPatient?.ghost_id}
                      searchQuery={inputValue}
                      setSearchQuery={setInputValue}
                      lastElementRef={lastPatientElementRef}
                    />
                  </SheetContent>
                </Sheet>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase">
                Project <span className="text-primary italic">Lazarus</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {alert && (
          <div
            className={`w-full border-b px-4 md:px-8 py-2.5 ${alert.wrapper}`}
          >
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <div className={`${alert.text} flex items-center gap-2`}>
                {alert.icon}
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
                  {alert.label}
                </span>
              </div>
              <span className="text-muted-foreground hidden sm:inline opacity-50">
                |
              </span>
              <span className="text-xs font-medium text-foreground/80">
                {alert.desc}
              </span>
            </div>
          </div>
        )}

        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-6xl">
          {selectedPatient ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <IdentityCard patient={selectedPatient} />
              <VitalsChart data={telemetry} />
              <PharmacyPortal patient={selectedPatient} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
              <Database className="h-12 w-12 text-primary opacity-30" />
              <div className="max-w-md w-full relative">
                <Input
                  placeholder="Search Reconstructed Identities..."
                  className="pl-10 h-12 bg-muted/30"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
