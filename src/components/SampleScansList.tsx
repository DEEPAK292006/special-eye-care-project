import React from "react";
import { CLINICAL_SAMPLES } from "../data/samples";
import { ClinicalSample } from "../types";
import { Eye, HelpCircle, Activity, ShieldAlert, Baby, Layers, Radio, Sparkles } from "lucide-react";

interface SampleScansListProps {
  onSelectSample: (sample: ClinicalSample) => void;
  selectedSampleId: string | null;
  isLoading: boolean;
}

export const SampleScansList: React.FC<SampleScansListProps> = ({
  onSelectSample,
  selectedSampleId,
  isLoading
}) => {
  // Helper to assign a relevant icon to each sample card
  const getTopicIcon = (index: number) => {
    switch (index) {
      case 1:
        return <Activity className="w-5 h-5 text-amber-600" />;
      case 2:
        return <Layers className="w-5 h-5 text-blue-600" />;
      case 3:
        return <Baby className="w-5 h-5 text-rose-600" />;
      case 4:
        return <Radio className="w-5 h-5 text-indigo-600" />;
      case 8:
        return <ShieldAlert className="w-5 h-5 text-emerald-600" />;
      default:
        return <Eye className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Interactive Clinical Training Scenarios
        </h3>
        <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2.5 py-0.5 rounded-full border border-blue-200">
          6 Test Sets
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Select a verified ICMR priority clinical scenario to instantly load its high-fidelity imagery and evaluate the diagnostic pipeline across all integrated diagnostics specialization areas:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {CLINICAL_SAMPLES.map((sample) => {
          const isSelected = selectedSampleId === sample.id;
          return (
            <button
              key={sample.id}
              disabled={isLoading}
              onClick={() => onSelectSample(sample)}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 relative overflow-hidden group ${
                isSelected
                  ? "bg-blue-50/70 border-blue-500 shadow-[0_4px_20px_rgba(37,99,235,0.1)]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              id={`sample-card-${sample.id}`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors">
                  {getTopicIcon(sample.topicIndex)}
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  {sample.deviceType.split(":")[0]}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 mt-1">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[130px]">{sample.patientInfo.split(".")[0]}</span>
                {isSelected && (
                  <span className="text-blue-600 font-bold animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    ACTIVE
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
