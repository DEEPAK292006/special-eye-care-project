import React, { useState, useEffect } from "react";
import { 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart2, 
  Activity, 
  UserCheck, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import { DiagnosticReport } from "../types";

interface AnalyticsDashboardProps {
  currentReportId?: string;
  onSelectPatient?: (patientId: string) => void;
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

export function AnalyticsDashboard({ currentReportId, onSelectPatient }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allDiagnostics, setAllDiagnostics] = useState<DiagnosticReport[]>([]);
  
  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all"); // "all" | "7d" | "30d" | "90d"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; date: string; id: string } | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/diagnostics");
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Failed to load historical analytics database. The clinical server is still initializing. Please reload in a moment.");
      }
      const data = await response.json();
      setAllDiagnostics(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred fetching dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, [currentReportId]);

  // Apply filters in memory
  const filteredDiagnostics = allDiagnostics.filter((record) => {
    // Topic filter
    if (selectedTopic !== "all") {
      // If a specific topic is selected, let's verify if there is active severity/concern for it, 
      // or simply include the record as we showcase its specific topic outcome.
    }

    // Gender filter
    if (genderFilter !== "all" && record.patientProfile.gender !== genderFilter) {
      return false;
    }

    // Age filter
    const age = record.patientProfile.age;
    if (ageFilter === "pediatric" && age >= 18) return false;
    if (ageFilter === "adult" && (age < 18 || age > 55)) return false;
    if (ageFilter === "senior" && age <= 55) return false;

    // Date range filter
    if (dateRangeFilter !== "all") {
      const scanDate = new Date(record.patientProfile.scanTimestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - scanDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateRangeFilter === "7d" && diffDays > 7) return false;
      if (dateRangeFilter === "30d" && diffDays > 30) return false;
      if (dateRangeFilter === "90d" && diffDays > 90) return false;
    }

    // Search query (Anonymized Patient ID)
    if (searchQuery.trim() !== "") {
      if (!record.patientProfile.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Calculate Metrics
  const totalCount = filteredDiagnostics.length;
  const grandTotal = allDiagnostics.length;

  const averageHealthIndex = totalCount > 0
    ? Math.round(filteredDiagnostics.reduce((acc, curr) => acc + curr.overallHealthIndex, 0) / totalCount)
    : 0;

  const urgentReferrals = filteredDiagnostics.filter(r => r.overallVerdict === "Urgent Referral").length;
  const urgentPercentage = totalCount > 0 ? Math.round((urgentReferrals / totalCount) * 100) : 0;

  const routineReferrals = filteredDiagnostics.filter(r => r.overallVerdict === "Routine Referral").length;
  const borderlineCases = filteredDiagnostics.filter(r => r.overallVerdict === "Borderline").length;
  const normalCases = filteredDiagnostics.filter(r => r.overallVerdict === "Normal").length;

  // Age groupings counts
  const ageGroups = {
    "Pediatric (<18)": filteredDiagnostics.filter(r => r.patientProfile.age < 18).length,
    "Young Adult (18-35)": filteredDiagnostics.filter(r => r.patientProfile.age >= 18 && r.patientProfile.age <= 35).length,
    "Middle Aged (36-55)": filteredDiagnostics.filter(r => r.patientProfile.age >= 36 && r.patientProfile.age <= 55).length,
    "Elderly (56+)": filteredDiagnostics.filter(r => r.patientProfile.age >= 56).length,
  };

  // Gender counts
  const genderStats = {
    Male: filteredDiagnostics.filter(r => r.patientProfile.gender === "Male").length,
    Female: filteredDiagnostics.filter(r => r.patientProfile.gender === "Female").length,
  };

  // Topic specific metrics depending on filter
  // Let's summarize the state breakdown of the selected topic
  const getTopicOutcomeStats = () => {
    const topicKey = selectedTopic === "all" ? "diabeticRetinopathy" : selectedTopic;
    const distribution: Record<string, number> = {};
    
    filteredDiagnostics.forEach((record) => {
      const details = record.topics[topicKey as keyof typeof record.topics];
      if (details && details.status) {
        distribution[details.status] = (distribution[details.status] || 0) + 1;
      }
    });

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  };

  const topicOutcomes = getTopicOutcomeStats();

  // Average confidence per topic
  const getAverageTopicConfidences = () => {
    const results: { key: string; name: string; avgConfidence: number }[] = [];
    
    Object.keys(TOPIC_NAMES).forEach((key) => {
      let sum = 0;
      let count = 0;
      filteredDiagnostics.forEach((record) => {
        const details = record.topics[key as keyof typeof record.topics];
        if (details && typeof details.confidence === "number") {
          sum += details.confidence;
          count++;
        }
      });
      results.push({
        key,
        name: TOPIC_NAMES[key],
        avgConfidence: count > 0 ? Math.round((sum / count) * 100) : 0
      });
    });

    return results.sort((a, b) => b.avgConfidence - a.avgConfidence);
  };

  const topicConfidences = getAverageTopicConfidences();

  // Time series for Line Chart: Sort chronologically and take up to last 15 reports for trend
  const trendData = [...filteredDiagnostics]
    .sort((a, b) => new Date(a.patientProfile.scanTimestamp).getTime() - new Date(b.patientProfile.scanTimestamp).getTime())
    .slice(-15);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8" id="analytics-dashboard-section">
      
      {/* Dashboard Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Anonymized Public Health Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1.5">
            ICMR priority Eye-Care Diagnostics Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time diagnostic dashboards monitoring aggregated trends across the integrated diagnostics specialization.
          </p>
        </div>
        
        <button 
          onClick={fetchDiagnostics}
          className="self-start md:self-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Reload Database
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Dashboard Synchronisation Error</h3>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">Dynamic Screening Cohort Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Topic Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Focus ICMR Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Integrated Diagnostics Specializations (Aggregated)</option>
              {Object.entries(TOPIC_NAMES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Users className="w-3 h-3" /> Patient Gender
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male Only</option>
              <option value="Female">Female Only</option>
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Age Classification
            </label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Ages</option>
              <option value="pediatric">Pediatric (&lt;18 yrs)</option>
              <option value="adult">Adult (18-55 yrs)</option>
              <option value="senior">Senior Geriatric (56+ yrs)</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Screening Date Range
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">Full Historical Database (120 Days)</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Search className="w-3 h-3" /> Anonymized Patient ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search ICMR-ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 text-sm">Analyzing Diagnostics Database</h3>
            <p className="text-xs text-slate-500 mt-1">Aggregating demographic metrics and sorting clinical outcome nodes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Cohort Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Screening Cohort</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950">{totalCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Active filter sample of <span className="font-semibold text-slate-700">{grandTotal}</span> total records
                </div>
              </div>
            </div>

            {/* Average Health Index Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Avg Health Index</span>
                <span className={`p-2 rounded-lg ${averageHealthIndex >= 85 ? "bg-green-50 text-green-600" : averageHealthIndex >= 60 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950">{averageHealthIndex}<span className="text-xs font-normal text-slate-400"> / 100</span></div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${averageHealthIndex >= 85 ? "bg-green-500" : averageHealthIndex >= 60 ? "bg-amber-500" : "bg-red-500"}`}></span>
                  {averageHealthIndex >= 85 ? "Healthy Population Baseline" : averageHealthIndex >= 60 ? "Borderline Cohort Concern" : "Actionable Referral Group"}
                </div>
              </div>
            </div>

            {/* Urgent Referral Percentage Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Urgent Referrals</span>
                <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950">{urgentPercentage}%</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Requires urgent hospital retinal or glaucoma triage
                </div>
              </div>
            </div>

            {/* AI Diagnostics Confidence Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Clinical Certainty</span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950">
                  {totalCount > 0 
                    ? Math.round(filteredDiagnostics.reduce((acc, curr) => {
                        // Average clinical confidences across the integrated diagnostics specialization in this report
                        const topics = curr.topics;
                        const confs = Object.values(topics).map((t: any) => t.confidence || 0);
                        const avg = confs.reduce((a, b) => a + b, 0) / confs.length;
                        return acc + avg;
                      }, 0) / totalCount * 100)
                    : 96}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Average confidence validation across screening runs
                </div>
              </div>
            </div>

          </div>

          {/* MAIN GRAPH: SCANNING TRENDS & HEALTH PROGRESSION */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Continuous Ocular Health Progression Trend
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological plot of the overall ocular health indices and diagnostic referrals (shows up to last 15 filtered runs).
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Overall Health Score
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400"></span>
                  Urgent Cases
                </div>
              </div>
            </div>

            {trendData.length < 2 ? (
              <div className="h-48 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                Insufficient data points to plot trend. Select a wider date range or add more diagnoses.
              </div>
            ) : (
              <div className="relative pt-4">
                {/* SVG Line/Area Chart */}
                <div className="w-full overflow-x-auto">
                  <svg viewBox="0 0 800 240" className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[20, 40, 60, 80, 100].map((h) => {
                      const y = 220 - (h * 2);
                      return (
                        <g key={h}>
                          <line x1="40" y1={y} x2="780" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="15" y={y + 4} fill="#94a3b8" className="text-[8px] font-mono font-medium">{h}</text>
                        </g>
                      );
                    })}

                    {/* Chart Paths */}
                    {(() => {
                      const width = 740;
                      const height = 200;
                      const paddingX = 40;
                      const numPoints = trendData.length;
                      const stepX = width / (numPoints - 1);
                      
                      const points = trendData.map((d, index) => {
                        const x = paddingX + (index * stepX);
                        const y = 220 - (d.overallHealthIndex * 2);
                        return { x, y, val: d.overallHealthIndex, id: d.patientProfile.id, date: new Date(d.patientProfile.scanTimestamp).toLocaleDateString(), verdict: d.overallVerdict };
                      });

                      // Create smooth area and line path strings
                      const linePath = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
                      const areaPath = `${linePath} L ${points[points.length - 1].x} 220 L ${points[0].x} 220 Z`;

                      return (
                        <>
                          {/* Filled Area */}
                          <path d={areaPath} fill="url(#chartAreaGrad)" />
                          
                          {/* Stroke Line */}
                          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                          
                          {/* Individual dots with hover areas */}
                          {points.map((p, i) => {
                            const isUrgent = p.verdict === "Urgent Referral";
                            return (
                              <g key={i} className="group/dot cursor-pointer">
                                <circle 
                                  cx={p.x} 
                                  cy={p.y} 
                                  r={isUrgent ? "5" : "4"} 
                                  fill={isUrgent ? "#f87171" : "#ffffff"} 
                                  stroke={isUrgent ? "#ef4444" : "#3b82f6"} 
                                  strokeWidth="2"
                                  className="transition-all duration-150 group-hover/dot:r-6"
                                  onMouseEnter={(e) => {
                                    setHoveredPoint({ x: p.x, y: p.y, val: p.val, date: p.date, id: p.id });
                                  }}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                  onClick={() => onSelectPatient && onSelectPatient(p.id)}
                                />
                                <text 
                                  x={p.x} 
                                  y={p.y - 10} 
                                  fill="#1e293b" 
                                  textAnchor="middle" 
                                  className="text-[9px] font-bold font-mono opacity-0 group-hover/dot:opacity-100 bg-white transition-opacity duration-150 pointer-events-none"
                                >
                                  {p.val}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}

                    {/* Timeline labels at bottom */}
                    {trendData.map((d, index) => {
                      const width = 740;
                      const paddingX = 40;
                      const numPoints = trendData.length;
                      const stepX = width / (numPoints - 1);
                      const x = paddingX + (index * stepX);
                      
                      // Filter down timestamps labels so they don't overlap
                      if (numPoints > 8 && index % 2 !== 0) return null;
                      
                      const dateObj = new Date(d.patientProfile.scanTimestamp);
                      const formattedLabel = `${dateObj.getDate()} ${dateObj.toLocaleString('en-US', { month: 'short' })}`;

                      return (
                        <g key={index}>
                          <line x1={x} y1="220" x2={x} y2="225" stroke="#cbd5e1" strokeWidth="1" />
                          <text x={x} y="235" fill="#94a3b8" textAnchor="middle" className="text-[8px] font-mono font-medium">
                            {formattedLabel}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Simulated Tooltip */}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-xs space-y-1 pointer-events-none border border-slate-700 z-50 transition-all"
                    style={{ 
                      left: `${(hoveredPoint.x / 800) * 100}%`, 
                      top: `${(hoveredPoint.y / 240) * 100 - 32}%`, 
                      transform: 'translate(-50%, -100%)' 
                    }}
                  >
                    <div className="font-semibold flex items-center justify-between gap-4 text-[10px]">
                      <span>{hoveredPoint.id}</span>
                      <span className="text-slate-400">{hoveredPoint.date}</span>
                    </div>
                    <div className="font-bold text-sm text-blue-300">Health Index: {hoveredPoint.val}</div>
                    <div className="text-[9px] text-slate-300">Click dot to load full clinical report</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* DEMOGRAPHICS DIVISION - COLUMN 5 */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" /> Patient Demographics Split
              </h3>
              
              {/* Gender Split Visual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Gender Distribution</span>
                  <span>{genderStats.Male}M : {genderStats.Female}F</span>
                </div>
                
                {/* Visual horizontal stacked gauge */}
                <div className="h-6 w-full rounded-lg overflow-hidden flex text-xs font-bold text-white shadow-inner">
                  {totalCount > 0 ? (
                    <>
                      {genderStats.Male > 0 && (
                        <div 
                          className="bg-blue-500 flex items-center justify-center transition-all duration-300"
                          style={{ width: `${(genderStats.Male / totalCount) * 100}%` }}
                          title={`Male: ${genderStats.Male} cases`}
                        >
                          {Math.round((genderStats.Male / totalCount) * 100)}% M
                        </div>
                      )}
                      {genderStats.Female > 0 && (
                        <div 
                          className="bg-pink-400 flex items-center justify-center transition-all duration-300 border-l border-white/20"
                          style={{ width: `${(genderStats.Female / totalCount) * 100}%` }}
                          title={`Female: ${genderStats.Female} cases`}
                        >
                          {Math.round((genderStats.Female / totalCount) * 100)}% F
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-100 text-slate-400 w-full flex items-center justify-center text-[10px] font-medium">No Data Available</div>
                  )}
                </div>
              </div>

              {/* Age Groups Distribution Bar Chart */}
              <div className="space-y-4">
                <span className="block text-xs font-semibold text-slate-600">Age Bracket Triage Counts</span>
                
                <div className="space-y-3">
                  {Object.entries(ageGroups).map(([group, count]) => {
                    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                    return (
                      <div key={group} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">{group}</span>
                          <span className="font-mono text-slate-700 font-semibold">{count} <span className="text-slate-400 text-[10px]">({percentage}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-700 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referrals Verdict Split */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <span className="block text-xs font-semibold text-slate-600">Ophthalmic Triage Recommendations</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-[10px] font-bold text-green-700 uppercase">Normal</div>
                    <div className="text-xl font-bold text-green-950 mt-1">{normalCases}</div>
                    <div className="text-[9px] text-green-600 font-medium mt-0.5">Discharge with routine wellness</div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Borderline</div>
                    <div className="text-xl font-bold text-blue-950 mt-1">{borderlineCases}</div>
                    <div className="text-[9px] text-blue-600 font-medium mt-0.5">Observe & follow up (6-12m)</div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-[10px] font-bold text-amber-700 uppercase">Routine Referral</div>
                    <div className="text-xl font-bold text-amber-950 mt-1">{routineReferrals}</div>
                    <div className="text-[9px] text-amber-600 font-medium mt-0.5">Vision Center consultation</div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-[10px] font-bold text-red-700 uppercase">Urgent Referral</div>
                    <div className="text-xl font-bold text-red-950 mt-1">{urgentReferrals}</div>
                    <div className="text-[9px] text-red-600 font-medium mt-0.5">Vitreoretinal/Specialist emergency</div>
                  </div>
                </div>
              </div>

            </div>

            {/* FOCUS TOPIC ANALYSES - COLUMN 7 */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-blue-600" /> Focus Module: {selectedTopic === "all" ? "Aggregated Statuses" : TOPIC_NAMES[selectedTopic]}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status breakdown and referral severity classes matching your cohort.
                  </p>
                </div>
                {selectedTopic === "all" && (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium shrink-0 self-start">
                    Showing Diabetic Retinopathy baseline
                  </span>
                )}
              </div>

              {/* Status Outcome Percentages */}
              <div className="space-y-4">
                {topicOutcomes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No reports recorded matching the active filter.</div>
                ) : (
                  <div className="space-y-3.5">
                    {topicOutcomes.map(({ status, count, percentage }) => {
                      // pick color based on severity index
                      let color = "bg-blue-500";
                      let bg = "bg-blue-50";
                      let text = "text-blue-700";
                      if (status.includes("Severe") || status.includes("Stage 3") || status.includes("Detached") || status.includes("Hypertension")) {
                        color = "bg-red-500";
                        bg = "bg-red-50";
                        text = "text-red-700";
                      } else if (status.includes("Mild") || status.includes("Stage 1") || status.includes("Borderline") || status.includes("Myopia") || status.includes("Astigmatism")) {
                        color = "bg-amber-400";
                        bg = "bg-amber-50";
                        text = "text-amber-700";
                      } else if (status.includes("No ") || status.includes("Normal") || status.includes("Clear") || status.includes("Emmetropia") || status.includes("Complete")) {
                        color = "bg-green-500";
                        bg = "bg-green-50";
                        text = "text-green-700";
                      }

                      return (
                        <div key={status} className="p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-800 flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
                              {status}
                            </span>
                            <span className="font-mono text-slate-700">{count} cases ({percentage}%)</span>
                          </div>
                          
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${color} transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Comparative confidence ranking bar index */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">AI Model Diagnostic Validation Certainty</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Average validation certainty score achieved by the multimodal screening engine across all topics.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topicConfidences.slice(0, 6).map((topic) => (
                    <div key={topic.key} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                        <span className="truncate max-w-[150px]">{topic.name}</span>
                        <span className="font-mono font-bold text-slate-700">{topic.avgConfidence}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${topic.avgConfidence}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* HISTORICAL PATIENTS AUDIT GRID */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Anonymized Active Diagnostic Log
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anonymized patient profiles registered in the eye care clinic network database.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {filteredDiagnostics.length} Records Listed
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="p-3">Anonymized Patient ID</th>
                    <th className="p-3">Age</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Triage Verdict</th>
                    <th className="p-3">Composite Health Index</th>
                    <th className="p-3">Registered Timestamp</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDiagnostics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        No patient records match the applied filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDiagnostics.map((record) => {
                      let badge = "bg-green-50 text-green-700 border-green-200";
                      if (record.overallVerdict === "Urgent Referral") {
                        badge = "bg-red-50 text-red-700 border-red-200 font-semibold";
                      } else if (record.overallVerdict === "Routine Referral") {
                        badge = "bg-amber-50 text-amber-700 border-amber-200";
                      } else if (record.overallVerdict === "Borderline") {
                        badge = "bg-blue-50 text-blue-700 border-blue-200";
                      }

                      return (
                        <tr key={record.patientProfile.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            {record.patientProfile.id}
                          </td>
                          <td className="p-3">{record.patientProfile.age} yrs</td>
                          <td className="p-3">{record.patientProfile.gender}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full border ${badge}`}>
                              {record.overallVerdict}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span className={`text-xs ${record.overallHealthIndex >= 85 ? "text-green-600" : record.overallHealthIndex >= 60 ? "text-amber-600" : "text-red-600"}`}>
                              {record.overallHealthIndex} / 100
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">
                            {new Date(record.patientProfile.scanTimestamp).toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onSelectPatient && onSelectPatient(record.patientProfile.id)}
                              className="px-2.5 py-1 border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded font-medium transition-all"
                            >
                              Load Report
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
