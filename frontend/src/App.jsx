import DecryptionTerminal from './components/DecryptionTerminal';
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import IdentityCard from "./components/IdentityCard";
import VitalsChart from "./components/VitalsChart";
import PharmacyPortal from "./components/PharmacyPortal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Menu,
  Search,
  Database,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Network,
  FlaskConical,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
  ArrowLeftRight,
  Pill,
  User,
  Heart,
  FileText,
  ClipboardCheck,
  TrendingUp,
  AlertOctagonIcon,
} from "lucide-react";

const App = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [triageView, setTriageView] = useState("conflicts");

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);
  const observer = useRef();
  const scrollContainerRef = useRef(null);
  const searchCache = useRef(new Map());

  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filteredPatients = useMemo(() => {
    if (!deferredQuery) return patients;
    const lowerQuery = deferredQuery.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.decoded_name.toLowerCase().includes(lowerQuery) ||
        p.ghost_id.toLowerCase().includes(lowerQuery),
    );
  }, [patients, deferredQuery]);

  useEffect(() => {
    const fetchFromBackend = async () => {
      const query = deferredQuery.trim().toLowerCase();
      if (!query || filteredPatients.length > 0) return;

      if (searchCache.current.has(query)) {
        setPatients((prev) => {
          const cachedData = searchCache.current.get(query);
          const existingIds = new Set(prev.map((p) => p.ghost_id));
          return [
            ...prev,
            ...cachedData.filter((p) => !existingIds.has(p.ghost_id)),
          ];
        });
        return;
      }

      setIsSearchLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/patients/${encodeURIComponent(query)}/filter`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            const formatted = data.map((p) => ({
              ghost_id: p.patient_id,
              decoded_name: p.patient_name || "Unknown Identity",
              age: p.age,
              ward: p.status || "Unassigned",
              bpm: p.hr_adjusted,
              spo2: p.spo2_adjusted,
              scrambled_med: p.scrambled_med || "Vtyvshasv",
            }));
            searchCache.current.set(query, formatted);
            setPatients((prev) => {
              const existingIds = new Set(prev.map((p) => p.ghost_id));
              return [
                ...prev,
                ...formatted.filter((p) => !existingIds.has(p.ghost_id)),
              ];
            });
          }
        }
      } catch (error) {
        console.error("Deep Search Error:", error);
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchFromBackend();
  }, [deferredQuery, filteredPatients.length, API_BASE_URL]);

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
          return [
            ...prev,
            ...formatted.filter((p) => !existingIds.has(p.ghost_id)),
          ];
        });
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        fetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [hasMore, API_BASE_URL],
  );

  useEffect(() => {
    if (patients.length === 0) fetchPatients(0);
  }, []);

  const lastPatientElementRef = useCallback(
    (node) => {
      if (fetchingRef.current) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !deferredQuery) {
          setPage((prev) => {
            const next = prev + 1;
            fetchPatients(next);
            return next;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, fetchPatients, deferredQuery],
  );

  const alert = useMemo(() => {
    if (!selectedPatient) return null;
    const severity = selectedPatient.ward;
    if (severity === "Critical") {
      return {
        wrapper: "bg-red-500/10 border-red-500/30",
        text: "text-red-500",
        icon: <AlertTriangle className="h-4 w-4" />,
        label: "HIGH-RISK CONFLICT",
        desc: "Lethal interaction detected. Immediate review required.",
      };
    }
    if (severity === "Warning") {
      return {
        wrapper: "bg-amber-500/10 border-amber-500/30",
        text: "text-amber-500",
        icon: <AlertCircle className="h-4 w-4" />,
        label: "WARNING",
        desc: "Moderate drug interference possible. Monitor closely.",
      };
    }
    return null;
  }, [selectedPatient?.ward]);

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
  }, [selectedPatient?.ghost_id, selectedPatient?.bpm, selectedPatient?.spo2]);

  const engineData = useMemo(() => {
    if (!selectedPatient) return { conflicts: [], recommendations: [] };

    const isHighRisk =
      selectedPatient.age > 50 || selectedPatient.ward === "Critical";

    return {
      conflicts: isHighRisk
        ? [
            {
              id: "c1",
              d1: "WARFARIN",
              d2: "ASPIRIN",
              severity: "high",
              reason: "Synergistic effect drastically increases bleeding risk",
            },
            {
              id: "c2",
              d1: "LITHIUM",
              d2: "IBUPROFEN",
              severity: "high",
              reason:
                "Decreases renal clearance of lithium, leading to toxicity",
            },
            {
              id: "c3",
              d1: "ASPIRIN",
              d2: "IBUPROFEN",
              severity: "medium",
              reason:
                "Competitive binding reduces cardioprotective effectiveness",
            },
          ]
        : [
            {
              id: "c4",
              d1: "PARACETAMOL",
              d2: "ALCOHOL",
              severity: "medium",
              reason: "Increased risk of hepatotoxicity (liver damage)",
            },
          ],
      recommendations: isHighRisk
        ? [
            {
              id: "r1",
              original: "ASPIRIN",
              alternative: "CLOPIDOGREL",
              reason: "Safer antiplatelet profile for high-risk age bracket.",
            },
            {
              id: "r2",
              original: "IBUPROFEN",
              alternative: "ACETAMINOPHEN",
              reason: "Does not interfere with Lithium renal clearance.",
            },
          ]
        : [
            {
              id: "r3",
              original: "ALCOHOL",
              alternative: "ABSTINENCE",
              reason:
                "Strict avoidance of hepatotoxins required during course.",
            },
          ],
    };
  }, [selectedPatient]);

  const graphData = useMemo(() => {
    if (!selectedPatient || engineData.conflicts.length === 0) return null;

    const uniqueDrugs = Array.from(
      new Set(engineData.conflicts.flatMap((c) => [c.d1, c.d2])),
    );

    const width = 500;
    const height = 280;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;

    //Map medicines around a circle for organic DSA-style layout
    const nodes = uniqueDrugs.map((drug, i) => {
      const angle = (i / uniqueDrugs.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: drug,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Build adjacency list for conflict edges
    const edges = engineData.conflicts.map((conflict) => ({
      source: conflict.d1,
      target: conflict.d2,
      severity: conflict.severity,
      reason: conflict.reason,
    }));

    return { nodes, edges, centerX, centerY, width, height };
  }, [selectedPatient, engineData.conflicts]);

  const severityColors = {
    high: "border-red-500/40 bg-red-500/10 text-red-500",
    lethal: "border-red-600/50 bg-red-600/20 text-red-600",
    medium: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar
          patients={filteredPatients}
          onSelect={(p) => {
            setSelectedPatient(p);
            setInputValue("");
            setTriageView("conflicts");
          }}
          selectedId={selectedPatient?.ghost_id}
          searchQuery={inputValue}
          setSearchQuery={setInputValue}
          lastElementRef={lastPatientElementRef}
          isSearchLoading={isSearchLoading}
        />
      </div>

      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative"
      >
        <div className="sticky top-0 z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b px-4 md:px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
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
                        setTriageView("conflicts");
                      }}
                      selectedId={selectedPatient?.ghost_id}
                      searchQuery={inputValue}
                      setSearchQuery={setInputValue}
                      lastElementRef={lastPatientElementRef}
                      isSearchLoading={isSearchLoading}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Project <span className="font-bold">Lazarus</span>
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {(isLoading || isSearchLoading) && (
                <div className="flex items-center gap-2 text-primary/80">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-[16px] font-mono font-bold uppercase tracking-widest hidden sm:block animate-pulse">
                    Loading...
                  </span>
                </div>
              )}
              <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-20"></div>
              </div>
            </div>
          </div>
        </div>

        {alert && (
          <div
            className={`w-full border-b px-4 md:px-8 py-2.5 ${alert.wrapper}`}
          >
            <div className="max-w-7xl mx-auto flex items-center gap-3">
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

        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-7xl">
          {selectedPatient ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* LIVE DECRYPTION TERMINAL PLACEMENT */}
              <DecryptionTerminal 
                  corruptedText="VLOGHQDILO" 
                  finalText="SILDENAFIL" 
              />
              
              <IdentityCard patient={selectedPatient} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VitalsChart data={telemetry} />
                <PharmacyPortal patient={selectedPatient} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Enhanced DSA-Style Interactive Node Graph */}
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2 border-b ">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <Network className="h-5 w-5" />
                      Drug Interaction Graph
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 relative">
                    <div className="h-[280px] w-full flex items-center justify-center relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                      {graphData ? (
                        <svg
                          viewBox={`0 0 ${graphData.width} ${graphData.height}`}
                          className="w-full h-full drop-shadow-lg overflow-visible"
                          style={{ background: "transparent" }}
                        >
                          <defs>
                            <pattern
                              id="grid"
                              width="20"
                              height="20"
                              patternUnits="userSpaceOnUse"
                            >
                              <circle
                                cx="2"
                                cy="2"
                                r="1"
                                fill="currentColor"
                                className="text-muted-foreground/10"
                              />
                            </pattern>
                            <marker
                              id="arrowhead"
                              markerWidth="6"
                              markerHeight="4"
                              refX="3"
                              refY="2"
                              orient="auto"
                            >
                              <polygon
                                points="0 0, 6 2, 0 4"
                                className="fill-red-500/60"
                              />
                            </marker>
                            <filter
                              id="glow"
                              x="-20%"
                              y="-20%"
                              width="140%"
                              height="140%"
                            >
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite
                                in="SourceGraphic"
                                in2="blur"
                                operator="over"
                              />
                            </filter>
                          </defs>

                          <rect width="100%" height="100%" fill="url(#grid)" />

                          {/* Conflict Edges with Animation */}
                          {graphData.edges.map((edge, i) => {
                            const sourceNode = graphData.nodes.find(
                              (n) => n.id === edge.source,
                            );
                            const targetNode = graphData.nodes.find(
                              (n) => n.id === edge.target,
                            );
                            if (!sourceNode || !targetNode) return null;

                            const isHighRisk = edge.severity === "high";
                            const strokeColor = isHighRisk
                              ? "#ef4444"
                              : "#f59e0b";

                            return (
                              <g key={`edge-${i}`}>
                                <line
                                  x1={sourceNode.x}
                                  y1={sourceNode.y}
                                  x2={targetNode.x}
                                  y2={targetNode.y}
                                  stroke={strokeColor}
                                  strokeWidth="2.5"
                                  strokeDasharray="6 4"
                                  className="animate-pulse"
                                  opacity="0.8"
                                />
                                {/* Animated gradient overlay for DSA effect */}
                                <line
                                  x1={sourceNode.x}
                                  y1={sourceNode.y}
                                  x2={targetNode.x}
                                  y2={targetNode.y}
                                  stroke={strokeColor}
                                  strokeWidth="1"
                                  strokeDasharray="2 8"
                                  opacity="0.4"
                                >
                                  <animate
                                    attributeName="stroke-dashoffset"
                                    from="10"
                                    to="0"
                                    dur="0.5s"
                                    repeatCount="indefinite"
                                  />
                                </line>
                              </g>
                            );
                          })}

                          {/* Medicine Nodes with DSA-Style Badges */}
                          {graphData.nodes.map((node) => (
                            <g key={`node-${node.id}`}>
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r="18"
                                fill="white"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-indigo-500 shadow-lg"
                                filter="url(#glow)"
                              />
                              <foreignObject
                                x={node.x - 45}
                                y={node.y - 10}
                                width="90"
                                height="20"
                                className="overflow-visible"
                              >
                                <div className="flex items-center justify-center h-full w-full">
                                  <div className="bg-indigo-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                    <Pill className="h-2.5 w-2.5" />
                                    <span className="truncate max-w-[60px]">
                                      {node.id}
                                    </span>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          ))}

                          <g>
                            <circle
                              cx={graphData.centerX}
                              cy={graphData.centerY}
                              r="28"
                              fill="url(#patientGrad)"
                              stroke="white"
                              strokeWidth="3"
                              filter="url(#glow)"
                            />
                            <defs>
                              <linearGradient
                                id="patientGrad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                            <foreignObject
                              x={graphData.centerX - 50}
                              y={graphData.centerY - 12}
                              width="100"
                              height="24"
                              className="overflow-visible"
                            >
                              <div className="flex items-center justify-center h-full w-full">
                                <div className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800">
                                  <User className="h-3 w-3" />
                                  {selectedPatient.decoded_name.split(" ")[0]}
                                </div>
                              </div>
                            </foreignObject>
                          </g>
                        </svg>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-emerald-500/80 p-8">
                          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                          </div>
                          <span className="text-sm font-mono uppercase tracking-widest text-center">
                            Zero Conflicts Detected
                            <br />
                            <span className="text-xs text-muted-foreground">
                              Prescription Validated
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/*  API & Recommendation Triage */}
                <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col overflow-hidden">
                  <CardHeader className="pb-0 border-b bg-gradient-to-r from-primary/5 to-emerald-500/5">
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <FlaskConical className="h-5 w-5 text-primary" />
                        Clinical Decision Support
                      </CardTitle>
                    </div>

                    <div className="flex w-full mb-[-2px] gap-1">
                      <button
                        onClick={() => setTriageView("conflicts")}
                        className={`flex-1 py-3 text-sm font-bold rounded-t-lg transition-all ${
                          triageView === "conflicts"
                            ? "bg-red-500/10 text-red-500 border-b-2 border-red-500"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <AlertOctagon className="h-4 w-4" />
                          Conflicts ({engineData.conflicts.length})
                        </div>
                      </button>
                      <button
                        onClick={() => setTriageView("recommendations")}
                        className={`flex-1 py-3 text-sm font-bold rounded-t-lg transition-all ${
                          triageView === "recommendations"
                            ? "bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Safe Swaps ({engineData.recommendations.length})
                        </div>
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 flex-1 bg-gradient-to-b from-muted/20 to-transparent">
                    <div className="h-full max-h-[250px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {triageView === "conflicts" &&
                        engineData.conflicts.map((conflict, idx) => (
                          <div
                            key={conflict.id}
                            className={`p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${
                              conflict.severity === "high"
                                ? "border-l-red-500 bg-red-500/5"
                                : "border-l-amber-500 bg-amber-500/5"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`shrink-0 ${
                                  conflict.severity === "high"
                                    ? "text-red-500"
                                    : "text-amber-500"
                                }`}
                              >
                                <ShieldAlert className="h-5 w-5" />
                              </div>
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm">
                                      {conflict.d1}
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-mono font-bold text-sm">
                                      {conflict.d2}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] uppercase ${
                                      conflict.severity === "high"
                                        ? "border-red-500/50 text-red-500"
                                        : "border-amber-500/50 text-amber-500"
                                    }`}
                                  >
                                    {conflict.severity} Risk
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {conflict.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {triageView === "recommendations" &&
                        engineData.recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-4 rounded-xl border-l-4 border-l-emerald-500 bg-emerald-500/5 shadow-sm transition-all hover:shadow-md"
                          >
                            <div className="flex gap-3">
                              <div className="shrink-0 text-emerald-500">
                                <ArrowLeftRight className="h-5 w-5" />
                              </div>
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="font-bold text-sm uppercase tracking-wider">
                                    Suggested Therapeutic Swap
                                  </span>
                                  <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase">
                                    Cleared
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-emerald-500/20">
                                  <span className="text-xs font-mono line-through opacity-60">
                                    {rec.original}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-emerald-500" />
                                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {rec.alternative}
                                  </span>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {rec.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
              {isLoading ? (
                <div className="w-full max-w-md space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="h-8 w-8 text-primary opacity-60" />
                  </div>
                  <div className="max-w-md w-full relative">
                    <Input
                      placeholder="Search Corrupted Prescriptions & Identities..."
                      className="pl-10 h-12 bg-white dark:bg-slate-900 shadow-sm"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter a patient name or ID to begin analysis
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
};

export default App;