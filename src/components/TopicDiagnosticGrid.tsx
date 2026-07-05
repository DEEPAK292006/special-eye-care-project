import React from "react";
import { ClinicalTopics } from "../types";
import {
  Activity,
  Layers,
  Baby,
  Radio,
  Zap,
  Glasses,
  Gauge,
  ShieldAlert,
  Target,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowUpRight
} from "lucide-react";

interface TopicDiagnosticGridProps {
  topics: ClinicalTopics;
  selectedTopicKey: string;
  onSelectTopic: (key: string) => void;
}

export const TopicDiagnosticGrid: React.FC<TopicDiagnosticGridProps> = ({
  topics,
  selectedTopicKey,
  onSelectTopic
}) => {
  // Config definition mapping the 10 ICMR priority topics
  const TOPIC_CONFIGS = [
    {
      key: "diabeticRetinopathy",
      id: 1,
      name: "Diabetic Retinopathy AI",
      device: "Fundus Camera Analyzer",
      icon: <Activity className="w-4 h-4 text-amber-500" />,
      getSummaryMetrics: (data: any) => `Grade: ${data.status} (Sev: ${data.severityLevel}/4)`
    },
    {
      key: "portableOCT",
      id: 2,
      name: "Handheld Portable OCT",
      device: "Optical Coherence Tomography",
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      getSummaryMetrics: (data: any) => `Thick: ${data.macularThickness}µm • RNFL: ${data.rnflAverageThickness}µm`
    },
    {
      key: "pediatricRetinalImaging",
      id: 3,
      name: "Pediatric Retinal Imaging",
      device: "Wide-Field Neonatal Sweep",
      icon: <Baby className="w-4 h-4 text-rose-400" />,
      getSummaryMetrics: (data: any) => `ROP: ${data.status} • Zone ${data.zone}`
    },
    {
      key: "ocularUltrasound3D",
      id: 4,
      name: "3D Ocular Ultrasound",
      device: "Posterior Segment B-Scan",
      icon: <Radio className="w-4 h-4 text-indigo-400" />,
      getSummaryMetrics: (data: any) => `Retina: ${data.retinalAttachment}`
    },
    {
      key: "portableFFA",
      id: 5,
      name: "Portable FFA Imaging",
      device: "Fundus Fluorescein Angiography",
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      getSummaryMetrics: (data: any) => `Transit: ${data.armToRetinaTime}s • Leak: ${data.leakageSeverity}`
    },
    {
      key: "portableAutoRefractometer",
      id: 6,
      name: "Portable Auto-refractometer",
      device: "Objective Wavefront Diopter",
      icon: <Glasses className="w-4 h-4 text-purple-400" />,
      getSummaryMetrics: (data: any) => `OD: ${data.sphOD >= 0 ? "+" : ""}${data.sphOD.toFixed(2)}D • OS: ${data.sphOS >= 0 ? "+" : ""}${data.sphOS.toFixed(2)}D`
    },
    {
      key: "portableTonometer",
      id: 7,
      name: "Portable Tonometer",
      device: "Non-Invasive Rebound Tension",
      icon: <Gauge className="w-4 h-4 text-blue-400" />,
      getSummaryMetrics: (data: any) => `IOP: OD ${data.iopOD} mmHg • OS ${data.iopOS} mmHg`
    },
    {
      key: "opticNerveDisease",
      id: 8,
      name: "AI Optic Nerve Disease",
      device: "ONH Contour Classifier",
      icon: <ShieldAlert className="w-4 h-4 text-lime-400" />,
      getSummaryMetrics: (data: any) => `CDR: OD ${data.cupToDiscRatioOD.toFixed(2)} • OS ${data.cupToDiscRatioOS.toFixed(2)}`
    },
    {
      key: "amblyopiaTechnology",
      id: 9,
      name: "AI-Based Amblyopia",
      device: "Binocular Alignment Screener",
      icon: <Target className="w-4 h-4 text-pink-400" />,
      getSummaryMetrics: (data: any) => `Angle: ${data.strabismusAngle}° • Fixation: ${data.fixationPattern}`
    },
    {
      key: "universalScreening",
      id: 10,
      name: "Universal Eye Screening",
      device: "Community Acuity Screener",
      icon: <ClipboardCheck className="w-4 h-4 text-teal-400" />,
      getSummaryMetrics: (data: any) => `Acuity OD: ${data.visualAcuityOD} • OS: ${data.visualAcuityOS}`
    }
  ];

  // Helper to determine status color codes
  const getStatusBadge = (key: string, data: any) => {
    const statusText = data.status.toLowerCase();
    
    // Default indicators based on normal/referral triggers
    let statusClass = "bg-green-50 text-green-700 border-green-200";
    let Icon = <CheckCircle2 className="w-3.5 h-3.5" />;

    if (
      statusText.includes("severe") || 
      statusText.includes("detachment") || 
      statusText.includes("hypertension") ||
      statusText.includes("stage 2") || 
      statusText.includes("stage 3") || 
      statusText.includes("plus") ||
      (key === "portableTonometer" && (data.iopOD > 21 || data.iopOS > 21)) ||
      (key === "opticNerveDisease" && (data.cupToDiscRatioOD > 0.6 || data.cupToDiscRatioOS > 0.6))
    ) {
      statusClass = "bg-red-50 text-red-700 border-red-200 animate-pulse";
      Icon = <XCircle className="w-3.5 h-3.5" />;
    } else if (
      statusText.includes("mild") || 
      statusText.includes("moderate") || 
      statusText.includes("suspect") || 
      statusText.includes("thinning") || 
      statusText.includes("fluid") || 
      statusText.includes("leakage") || 
      statusText.includes("astigmatism") || 
      statusText.includes("myopia") ||
      statusText.includes("hyperopia") ||
      statusText.includes("referral")
    ) {
      statusClass = "bg-amber-50 text-amber-700 border-amber-200";
      Icon = <AlertTriangle className="w-3.5 h-3.5" />;
    }

    return (
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${statusClass}`}>
        {Icon}
        {data.status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Integrated Diagnostics Specialization Suite (ICMR Priority Modules)
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">Click any module for clinical analytics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOPIC_CONFIGS.map((config) => {
          const data = (topics as any)[config.key];
          const isSelected = selectedTopicKey === config.key;

          if (!data) return null;

          return (
            <button
              key={config.key}
              onClick={() => onSelectTopic(config.key)}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? "bg-blue-50/40 border-blue-600 shadow-[0_4px_16px_rgba(37,99,235,0.08)]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
              id={`topic-grid-card-${config.key}`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl border transition-colors ${
                    isSelected ? "bg-blue-100 border-blue-300" : "bg-slate-50 border-slate-100 group-hover:border-slate-200"
                  }`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-blue-600 font-mono font-bold">TOPIC {config.id}</span>
                      <span className="text-[9px] text-slate-400 font-mono">• {config.device}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                      {config.name}
                    </h4>
                  </div>
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 text-slate-400 transition-all ${
                  isSelected ? "text-blue-600 translate-x-0.5 -translate-y-0.5" : "group-hover:text-slate-600"
                }`} />
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 w-full">
                <span className="text-[10px] text-slate-500 font-mono tracking-tight">
                  {config.getSummaryMetrics(data)}
                </span>
                {getStatusBadge(config.key, data)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
