import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  Heart,
  Info,
  ShieldAlert,
  FileText,
  Layers,
  Activity,
  Baby,
  HelpCircle,
  RefreshCw,
  Gauge,
  BookOpen,
  ArrowRight,
  ClipboardCheck,
  ChevronRight,
  FileSpreadsheet,
  BarChart2,
  MessageSquare
} from "lucide-react";

import { DiagnosticReport, ClinicalSample } from "./types";
import { CLINICAL_SAMPLES } from "./data/samples";
import { ClinicalVisualizer } from "./components/ClinicalVisualizer";
import { SampleScansList } from "./components/SampleScansList";
import { TopicDiagnosticGrid } from "./components/TopicDiagnosticGrid";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { FeedbackPortal } from "./components/FeedbackPortal";

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [selectedTopicKey, setSelectedTopicKey] = useState<string>("diabeticRetinopathy");
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [showUploadView, setShowUploadView] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"screening" | "analytics" | "feedback">("screening");

  const handleSelectPatientFromAnalytics = async (patientId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/diagnostics");
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data: DiagnosticReport[] = await response.json();
        const record = data.find(r => r.patientProfile.id === patientId);
        if (record) {
          setReport(record);
          setIsSimulated(false);
          setSelectedSampleId(null);
          setUserImage(null);
          setActiveTab("screening");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("Error loading patient from analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger initial screening using the first baseline healthy case study
  useEffect(() => {
    handleTriggerDiagnosis("normal_healthy", null, null);
  }, []);

  const handleTriggerDiagnosis = async (
    sampleId: string | null,
    customBase64: string | null,
    fileName: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: customBase64,
          sampleId,
          fileName,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The clinical analysis server is still initializing. Please wait a moment and try again.");
      }

      const data = await response.json();
      if (!response.ok) {
        if (data.report) {
          // If the backend had an API timeout or rate limit, it fell back gracefully and generated a high-fidelity simulated report.
          // Display the simulated report so clinical flow is not broken, and alert the clinician via a banner.
          setReport(data.report);
          setIsSimulated(true);
          setSelectedSampleId(sampleId);
          setError(data.message || data.error || "Showing simulated fallback report due to a server-side AI connection timeout.");
          return;
        }
        throw new Error(data.error || "Failed to process diagnostics.");
      }

      setReport(data.report);
      setIsSimulated(!!data.simulated);
      setSelectedSampleId(sampleId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: ClinicalSample) => {
    setUserImage(null);
    handleTriggerDiagnosis(sample.id, null, sample.name + ".jpg");
  };

  // Convert uploaded image file to Base64 and trigger diagnostics
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Unsupported file format. Please upload a standard ophthalmic JPG or PNG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUserImage(base64);
      setSelectedSampleId(null);
      handleTriggerDiagnosis(null, base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Diagnostic rating color classes
  const getVerdictBadgeClass = (verdict: string) => {
    switch (verdict) {
      case "Urgent Referral":
        return "bg-red-50 text-red-700 border-red-200 shadow-sm";
      case "Routine Referral":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Borderline":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  // Get matching icons for clinical report summary
  const getTopicMeta = (key: string) => {
    const topicDetails = report?.topics[key as keyof typeof report.topics];
    if (!topicDetails) return null;

    switch (key) {
      case "diabeticRetinopathy":
        return { name: "Diabetic Retinopathy", topicNo: 1, detail: topicDetails };
      case "portableOCT":
        return { name: "Handheld Portable OCT", topicNo: 2, detail: topicDetails };
      case "pediatricRetinalImaging":
        return { name: "Pediatric Retinal Imaging", topicNo: 3, detail: topicDetails };
      case "ocularUltrasound3D":
        return { name: "3D Ocular Ultrasound", topicNo: 4, detail: topicDetails };
      case "portableFFA":
        return { name: "Portable FFA Imaging", topicNo: 5, detail: topicDetails };
      case "portableAutoRefractometer":
        return { name: "Portable Auto-refractometer", topicNo: 6, detail: topicDetails };
      case "portableTonometer":
        return { name: "Portable Tonometer", topicNo: 7, detail: topicDetails };
      case "opticNerveDisease":
        return { name: "AI Optic Nerve Disease", topicNo: 8, detail: topicDetails };
      case "amblyopiaTechnology":
        return { name: "AI-Based Amblyopia", topicNo: 9, detail: topicDetails };
      case "universalScreening":
        return { name: "Universal Eye Screening", topicNo: 10, detail: topicDetails };
      default:
        return null;
    }
  };

  const activeTopicMeta = getTopicMeta(selectedTopicKey);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Clinical Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm z-40 sticky top-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900">ICMR Special Eye Care Project</h1>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded border border-blue-200">
                  ICMR Hub
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Unified AI-Powered Diagnostic Agent v2.4</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* API Status Badge */}
            <div className={`text-xs px-3 py-1 bg-green-50 rounded-full border flex items-center gap-2 font-mono ${
              isSimulated 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : "bg-green-50 border-green-200 text-green-700"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSimulated ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}></span>
              {isSimulated ? "SIMULATION MODE" : "LIVE AI AGENT"}
            </div>

            <button
              onClick={handlePrint}
              disabled={!report}
              className="px-4 py-1.5 border-2 border-slate-900 text-slate-900 font-bold rounded-full text-xs hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="btn-print-report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shrink-0 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("screening")}
              className={`py-4 px-1 border-b-2 font-semibold text-xs tracking-wide uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "screening"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Eye className="w-4 h-4" />
              Integrated Diagnostics Specialization
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-1 border-b-2 font-semibold text-xs tracking-wide uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "analytics"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Interactive Analytics Dashboard
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`py-4 px-1 border-b-2 font-semibold text-xs tracking-wide uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "feedback"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Clinical Feedback Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {activeTab === "screening" && (
          <>
            {/* API Warning Banner */}
        {isSimulated && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 shadow-sm"
            id="banner-simulated-warning"
          >
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold text-amber-900">No Custom Gemini API Key Detected:</span> The applet is currently operating in high-fidelity clinical simulation mode using predefined medical cases. To unlock live, dynamic diagnostic analysis for any eye-care photo you upload, navigate to the <span className="text-amber-950 font-bold font-mono">Settings &gt; Secrets</span> panel in the AI Studio sidebar and enter your <span className="font-mono font-bold">GEMINI_API_KEY</span>.
            </div>
          </motion.div>
        )}

        {/* Input Screening Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Ocular Scan Ingestion Portal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Choose a pre-filled case study or drag-and-drop a new retinal imaging file</p>
            </div>

            {/* Toggle tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto">
              <button
                onClick={() => setShowUploadView(false)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !showUploadView ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                id="toggle-case-studies"
              >
                Integrated Diagnostics Specialization Case Studies
              </button>
              <button
                onClick={() => setShowUploadView(true)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  showUploadView ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                id="toggle-upload-custom"
              >
                Upload Patient Scan
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!showUploadView ? (
              <motion.div
                key="case-studies"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                <SampleScansList
                  onSelectSample={handleSelectSample}
                  selectedSampleId={selectedSampleId}
                  isLoading={isLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upload-portal"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col md:flex-row gap-5 items-stretch"
              >
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`flex-1 rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:border-blue-300 bg-slate-50/50"
                  }`}
                >
                  <input
                    type="file"
                    id="eye-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="eye-image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3 w-full"
                  >
                    <div className="p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                      <UploadCloud className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag &amp; drop file here, or <span className="text-blue-600 hover:underline">browse files</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Supports Retinal Fundus, OCT scans, Ultrasound, or Anterior photographs (PNG, JPG)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Upload Preview or Status */}
                <div className="w-full md:w-80 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Ingested Media Status</h3>
                    {userImage ? (
                      <div className="mt-3 flex flex-col items-center gap-3">
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                          <img
                            src={userImage}
                            alt="Ingested clinical scan"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-full">Custom Patient Image Ingested</span>
                      </div>
                    ) : (
                      <div className="mt-8 text-center text-xs text-slate-400 py-4 font-mono">
                        No custom image active.<br />Upload a scan to initiate AI pipeline.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">DIAGNOSTIC PIPELINE STATUS:</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${userImage ? "bg-blue-600 animate-pulse" : "bg-slate-300"}`}></span>
                      <span className="text-xs font-bold font-mono text-slate-700">
                        {userImage ? "Ready for Analysis" : "Awaiting Image"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Diagnostic Loading Screen */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl gap-4 shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Processing Ophthalmic Ingestion Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed font-mono">
                Running parallel computer vision analysis across all integrated diagnostics specialization fields (Diabetic Retinopathy, OCT, FFA, Pediatric Sweep, Ultrasound, and Refractive sensors)...
              </p>
            </div>
          </div>
        )}

        {/* Diagnostic Results Dashboard */}
        {!isLoading && report && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="diagnostic-results-workspace">
            
            {/* LEFT COLUMN: Executive Profile & Composite Verdict */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Patient Profile Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Patient Clinical Record
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">SEC-ID: {report.patientProfile.id}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono py-1">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                    <div className="text-[9px] text-slate-400">AGE</div>
                    <div className="text-slate-800 font-extrabold mt-1 text-sm">{report.patientProfile.age} Yrs</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                    <div className="text-[9px] text-slate-400">GENDER</div>
                    <div className="text-slate-800 font-extrabold mt-1 text-sm">{report.patientProfile.gender}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                    <div className="text-[9px] text-slate-400">QUALITY INDEX</div>
                    <div className="text-emerald-600 font-extrabold mt-1 text-sm">98.2%</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex justify-between mt-1">
                  <span>SCREENING DATE:</span>
                  <span>{report.patientProfile.scanTimestamp}</span>
                </div>
              </div>

              {/* Composite Health Dial & Verdict */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Triage Score</span>
                </div>

                {/* Composite Health Gauge Ring */}
                <div className="relative flex items-center justify-center w-36 h-36 mt-2">
                  {/* Background track */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-slate-100"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-blue-600"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60 * (1 - report.overallHealthIndex / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {report.overallHealthIndex}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">Health Index</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-center w-full">
                  <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getVerdictBadgeClass(report.overallVerdict)}`}>
                    {report.overallVerdict}
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed text-justify px-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {report.summary}
                  </p>
                </div>
              </div>

              {/* Patient Intervention & Action Plan */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Clinician Action Plan & recommendations
                </h3>
                
                <ul className="flex flex-col gap-2.5 mt-1">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* RIGHT COLUMN: 10 ICMR Topic Grid & Active Lab Visualizer */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Topics Selection Grid */}
              <TopicDiagnosticGrid
                topics={report.topics}
                selectedTopicKey={selectedTopicKey}
                onSelectTopic={(key) => setSelectedTopicKey(key)}
              />

              {/* Lab Visualizer Detailed View */}
              {activeTopicMeta && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold font-mono rounded border border-blue-200">
                        ICMR TOPIC {activeTopicMeta.topicNo}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{activeTopicMeta.name} Analytics</h3>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>CONFIDENCE INDEX:</span>
                      <span className="text-emerald-600 font-extrabold">{(activeTopicMeta.detail.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Visualizer split: SVG on left/top, findings on right/bottom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    
                    {/* SVG Graphic block */}
                    <ClinicalVisualizer
                      topicKey={selectedTopicKey}
                      data={activeTopicMeta.detail}
                    />

                    {/* Detailed textual clinical findings */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Diagnostic Assessment</h4>
                        <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          {activeTopicMeta.detail.findings}
                        </p>
                      </div>

                      {/* Topic-specific numeric table */}
                      <div className="text-[11px] font-mono">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sensor Telemetry Output</h4>
                        
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                          {selectedTopicKey === "diabeticRetinopathy" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Microaneurysms Detected</span>
                                <span className="text-amber-600 font-bold">{activeTopicMeta.detail.microaneurysms} count</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Retinal Hemorrhages</span>
                                <span className={activeTopicMeta.detail.hemorrhages ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                  {activeTopicMeta.detail.hemorrhages ? "PRESENT" : "ABSENT"}
                                </span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Hard Lipid Exudates</span>
                                <span className={activeTopicMeta.detail.exudates ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                  {activeTopicMeta.detail.exudates ? "PRESENT" : "ABSENT"}
                                </span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Macular Edema Risk</span>
                                <span className={activeTopicMeta.detail.macularEdema ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                  {activeTopicMeta.detail.macularEdema ? "HIGH" : "NORMAL"}
                                </span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "portableOCT" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Macular thickness</span>
                                <span className="text-blue-600 font-bold">{activeTopicMeta.detail.macularThickness} µm</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Retinal Fluid volume</span>
                                <span className="text-blue-600 font-bold">{activeTopicMeta.detail.fluidVolume} nl</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">RNFL Average Thickness</span>
                                <span className="text-green-600 font-bold">{activeTopicMeta.detail.rnflAverageThickness} µm</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "pediatricRetinalImaging" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">ROP Zone Classification</span>
                                <span className="text-red-600 font-bold">Zone {activeTopicMeta.detail.zone}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Plus Disease Status</span>
                                <span className="text-red-600 font-bold">{activeTopicMeta.detail.plusDisease}</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "ocularUltrasound3D" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Acoustic Echo Density</span>
                                <span className="text-indigo-600 font-bold">{activeTopicMeta.detail.acousticDensity}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Retinal Attachment</span>
                                <span className="text-indigo-600 font-bold">{activeTopicMeta.detail.retinalAttachment}</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "portableFFA" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Arm-to-Retina Circulation Time</span>
                                <span className="text-green-600 font-bold">{activeTopicMeta.detail.armToRetinaTime} seconds</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Vascular Dye Leakage</span>
                                <span className="text-green-600 font-bold">{activeTopicMeta.detail.leakageSeverity}</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "portableAutoRefractometer" && (
                            <>
                              <div className="flex justify-between p-2 font-bold text-[10px] bg-slate-100 text-slate-500">
                                <span>EYE / FIELD</span>
                                <span>SPHERE / CYLINDER / AXIS</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Right Eye (OD)</span>
                                <span className="text-purple-600 font-bold">
                                  {activeTopicMeta.detail.sphOD >= 0 ? "+" : ""}{activeTopicMeta.detail.sphOD.toFixed(2)} / {activeTopicMeta.detail.cylOD.toFixed(2)} x {activeTopicMeta.detail.axisOD}°
                                </span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Left Eye (OS)</span>
                                <span className="text-purple-600 font-bold">
                                  {activeTopicMeta.detail.sphOS >= 0 ? "+" : ""}{activeTopicMeta.detail.sphOS.toFixed(2)} / {activeTopicMeta.detail.cylOS.toFixed(2)} x {activeTopicMeta.detail.axisOS}°
                                </span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "portableTonometer" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Right Eye Tension (OD)</span>
                                <span className="text-blue-600 font-bold">{activeTopicMeta.detail.iopOD} mmHg</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Left Eye Tension (OS)</span>
                                <span className="text-blue-600 font-bold">{activeTopicMeta.detail.iopOS} mmHg</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "opticNerveDisease" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Cup-to-Disc Ratio OD</span>
                                <span className="text-green-700 font-bold">{activeTopicMeta.detail.cupToDiscRatioOD.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Cup-to-Disc Ratio OS</span>
                                <span className="text-green-700 font-bold">{activeTopicMeta.detail.cupToDiscRatioOS.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Neuroretinal Rim Thinning</span>
                                <span className="text-green-700 font-bold">{activeTopicMeta.detail.rimThinning}</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "amblyopiaTechnology" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Strabismus Squint Angle</span>
                                <span className="text-pink-600 font-bold">{activeTopicMeta.detail.strabismusAngle}° deviation</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Fixation Integrity</span>
                                <span className="text-pink-600 font-bold">{activeTopicMeta.detail.fixationPattern}</span>
                              </div>
                            </>
                          )}

                          {selectedTopicKey === "universalScreening" && (
                            <>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Visual Acuity OD</span>
                                <span className="text-teal-600 font-bold">{activeTopicMeta.detail.visualAcuityOD}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Visual Acuity OS</span>
                                <span className="text-teal-600 font-bold">{activeTopicMeta.detail.visualAcuityOS}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Color Vision (Ishihara)</span>
                                <span className="text-teal-600 font-bold">{activeTopicMeta.detail.colorVision}</span>
                              </div>
                              <div className="flex justify-between p-2">
                                <span className="text-slate-500">Contrast Sensitivity Threshold</span>
                                <span className="text-teal-600 font-bold">{activeTopicMeta.detail.contrastSensitivity}</span>
                              </div>
                            </>
                          )}

                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

          </>
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard 
            currentReportId={report?.patientProfile.id} 
            onSelectPatient={handleSelectPatientFromAnalytics} 
          />
        )}

        {activeTab === "feedback" && (
          <FeedbackPortal 
            currentPatientId={report?.patientProfile.id || null} 
          />
        )}

      </main>

      {/* Footer Info section detailing the Integrated Diagnostics Specializations */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-2.5">
              <span className="font-bold text-slate-900 text-sm tracking-wide">SEC Project Reference</span>
              <p className="leading-relaxed text-slate-500">
                The Special Eye Care (SEC) Project is a unified diagnostic framework designed to implement the Indian Council of Medical Research (ICMR) priority clinical eye-care strategies into modular, portable digital systems.
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-slate-400">
                <span>© {new Date().getFullYear()} Special Eye Care Project</span>
                <span>•</span>
                <span>ICMR Ophthalmic AI Consortium</span>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-3">
              <span className="font-bold text-slate-900 text-sm tracking-wide">The Integrated Diagnostics Specialization Eye-Care Directives:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono leading-relaxed text-slate-600">
                <div>1. AI for Diabetic Retinopathy (DR)</div>
                <div>2. Handheld Portable OCT Layering</div>
                <div>3. Wide-Field Pediatric Retinal Device</div>
                <div>4. Posterior Segment 3D Ultrasound</div>
                <div>5. Field-Deployable Fluorescein FFA</div>
                <div>6. Portable Auto-Refractometer Wavefront</div>
                <div>7. Portable Non-Invasive Rebound Tonometer</div>
                <div>8. AI Optic Nerve (Glaucoma/ONH) Classifier</div>
                <div>9. AI Amblyopia Squint Screening Module</div>
                <div>10. Universal Snellen/LogMAR Eye Screening</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
