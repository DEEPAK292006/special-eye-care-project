import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  User, 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2
} from "lucide-react";

interface FeedbackItem {
  id: string;
  reporterName: string;
  reporterRole: string;
  reportAccuracyRating: number;
  feedbackType: string;
  moduleAffected: string;
  comments: string;
  patientId: string | null;
  timestamp: string;
  status: "Pending" | "Reviewed" | "Resolved";
}

interface FeedbackPortalProps {
  currentPatientId: string | null;
}

const TOPIC_NAMES: Record<string, string> = {
  diabeticRetinopathy: "Diabetic Retinopathy",
  portableOCT: "Handheld Portable OCT",
  pediatricRetinalImaging: "Pediatric Retinal Imaging",
  ocularUltrasound3D: "3D Ocular Ultrasound",
  portableFFA: "Portable FFA Imaging",
  portableAutoRefractometer: "Portable Auto-refractometer",
  portableTonometer: "Portable Tonometer",
  opticNerveDisease: "AI Optic Nerve Disease",
  amblyopiaTechnology: "AI-Based Amblyopia",
  universalScreening: "Universal Eye Screening"
};

export function FeedbackPortal({ currentPatientId }: FeedbackPortalProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [reporterName, setReporterName] = useState<string>("");
  const [reporterRole, setReporterRole] = useState<string>("Ophthalmologist");
  const [feedbackType, setFeedbackType] = useState<string>("Accuracy");
  const [moduleAffected, setModuleAffected] = useState<string>("General / App-wide");
  const [reportAccuracyRating, setReportAccuracyRating] = useState<number>(5);
  const [comments, setComments] = useState<string>("");
  const [patientIdInput, setPatientIdInput] = useState<string>("");
  
  // Status states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  
  // Search and filters for existing logs
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const loadFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback");
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Failed to sync clinical feedbacks database. The clinical server is still initializing. Please reload in a moment.");
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred fetching feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
    // Pre-fill active patient ID if available
    if (currentPatientId) {
      setPatientIdInput(currentPatientId);
    }
  }, [currentPatientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !comments.trim()) {
      alert("Please provide your name and your feedback comments.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName,
          reporterRole,
          feedbackType,
          moduleAffected,
          reportAccuracyRating,
          comments,
          patientId: patientIdInput.trim() !== "" ? patientIdInput.trim() : null
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Failed to submit feedback. The server returned a non-JSON response. Please try again.");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setSuccessMessage(true);
      // reset form, but keep name and role for convenience
      setComments("");
      setReportAccuracyRating(5);
      
      // refresh feed
      loadFeedbacks();

      // clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage(false);
      }, 4000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not submit feedback to database.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter feedbacks in memory
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (typeFilter !== "all" && fb.feedbackType !== typeFilter) return false;
    if (moduleFilter !== "all" && fb.moduleAffected !== moduleFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8" id="feedback-portal-section">
      
      {/* Portal Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> Clinical Quality Assessment Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1.5">
          Submit & Audit Diagnostic Feedback
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Facilitating continuous diagnostic alignment. Report module discrepancies, suggest UI enhancements, or log clinical audits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SUBMISSION FORM (7 COLS ON LARGE SCREEN) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">New Clinical Alignment Feedback</h2>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block">Feedback Recorded Successfully</span>
                The report was safely logged in our review database for medical auditing. Thank you!
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block">Submission Error</span>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            
            {/* Reporter Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Reporter Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Kavitha Sen"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Reporter Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Clinical or User Role
              </label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ophthalmologist">Ophthalmologist (Retina / Glaucoma Specialist)</option>
                <option value="General Practitioner">General Practitioner / Resident MD</option>
                <option value="Asha Worker">ASHA Community Healthcare Worker</option>
                <option value="Patient">Patient / Vision Center Client</option>
              </select>
            </div>

            {/* Diagnostic ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Associated Case ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ICMR-100015 (Pre-filled from screen)"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Associates feedback with a specific patient diagnostic report.
              </p>
            </div>

            {/* Feedback Type & Module Affected (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Feedback Type
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Accuracy">Accuracy Discrepancy</option>
                  <option value="Module Improvement">Suggest Module Improvement</option>
                  <option value="Usability Issue">Usability / Interface Issue</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Module Affected
                </label>
                <select
                  value={moduleAffected}
                  onChange={(e) => setModuleAffected(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General / App-wide">General / App-wide</option>
                  {Object.entries(TOPIC_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accuracy Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> Diagnostic Report Accuracy Rating
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReportAccuracyRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 ${star <= reportAccuracyRating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} 
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-500 ml-2">
                  {reportAccuracyRating === 5 ? "Highly Accurate (5/5)" :
                   reportAccuracyRating === 4 ? "Accurate (4/5)" :
                   reportAccuracyRating === 3 ? "Minor Discrepancies (3/5)" :
                   reportAccuracyRating === 2 ? "Inaccurate (2/5)" : "Very Faulty (1/5)"}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Clinical Comments & Explanation
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detail any diagnostic misalignment, clinical grading observations, or usability bug descriptions..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              ></textarea>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 active:bg-slate-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Submitting to database...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Log Feedback Report
              </>
            )}
          </button>
        </form>

        {/* FEEDBACK FEED & AUDIT LOGS (7 COLS ON LARGE SCREEN) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Clinical Audit Logs Feed</h2>
                <p className="text-[10px] text-slate-400">Review historical feedback logged by ocular specialists.</p>
              </div>
            </div>
            
            <button 
              onClick={loadFeedbacks}
              className="px-2.5 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh Feed
            </button>
          </div>

          {/* Sidebar Filter Row */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Filter Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-[10px] bg-white border border-slate-200 rounded p-1 text-slate-600 font-medium outline-none"
              >
                <option value="all">All Types</option>
                <option value="Accuracy">Accuracy Report</option>
                <option value="Module Improvement">Module Improvement</option>
                <option value="Usability Issue">Usability Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Filter Module</label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full text-[10px] bg-white border border-slate-200 rounded p-1 text-slate-600 font-medium outline-none"
              >
                <option value="all">All Modules</option>
                <option value="General / App-wide">General / App-wide</option>
                {Object.entries(TOPIC_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-400">Synching database logs...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="h-48 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
              No matching clinical feedback logs found.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredFeedbacks.map((fb) => {
                let ratingColor = "text-amber-400";
                let typeBadge = "bg-blue-50 text-blue-700 border-blue-200";
                if (fb.feedbackType === "Accuracy") {
                  typeBadge = "bg-red-50 text-red-700 border-red-200";
                } else if (fb.feedbackType === "Usability Issue") {
                  typeBadge = "bg-orange-50 text-orange-700 border-orange-200";
                } else if (fb.feedbackType === "Module Improvement") {
                  typeBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                }

                return (
                  <div key={fb.id} className="p-4 border border-slate-100 rounded-xl space-y-3 hover:shadow-sm transition-shadow">
                    
                    {/* Feedback Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 border-b border-slate-50 pb-2">
                      <div>
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          {fb.reporterName}
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {fb.reporterRole}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(fb.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[9px] rounded-full border font-semibold uppercase ${typeBadge}`}>
                          {fb.feedbackType}
                        </span>
                        
                        {/* Status tag */}
                        <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${fb.status === "Resolved" ? "bg-green-100 text-green-800" : fb.status === "Reviewed" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                          {fb.status}
                        </span>
                      </div>
                    </div>

                    {/* Metadata affected row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded">
                      <div>
                        <span className="font-semibold block text-slate-400 uppercase text-[8px]">Module Affected</span>
                        <span className="text-slate-700 font-medium">
                          {fb.moduleAffected === "General / App-wide" ? "General / App-wide" : TOPIC_NAMES[fb.moduleAffected] || fb.moduleAffected}
                        </span>
                      </div>

                      {fb.patientId && (
                        <div>
                          <span className="font-semibold block text-slate-400 uppercase text-[8px]">Associated Patient ID</span>
                          <span className="text-slate-800 font-mono font-bold block mt-0.5">
                            {fb.patientId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Feedback comments */}
                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/40 p-2.5 rounded-lg border border-slate-50/60">
                      "{fb.comments}"
                    </p>

                    {/* Ratings stars display */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="font-medium">Accuracy Rating:</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${star <= fb.reportAccuracyRating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
