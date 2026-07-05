import React from "react";

interface ClinicalVisualizerProps {
  topicKey: string;
  data: any;
}

export const ClinicalVisualizer: React.FC<ClinicalVisualizerProps> = ({ topicKey, data }) => {
  if (!data) return null;

  switch (topicKey) {
    case "diabeticRetinopathy": {
      const severity = data.severityLevel || 0;
      const maCount = data.microaneurysms || 0;
      const hasHemorrhage = data.hemorrhages;
      const hasExudates = data.exudates;

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Retinal Fundus Abnormality Map</span>
          <svg viewBox="0 0 200 200" className="w-40 h-40">
            {/* Retinal fundus circle */}
            <circle cx="100" cy="100" r="80" fill="#2d120a" stroke="#d97706" strokeWidth="2" />
            <circle cx="100" cy="100" r="79" fill="url(#fundusGrad)" />
            
            {/* Optic Disc */}
            <ellipse cx="60" cy="100" rx="14" ry="18" fill="#fef3c7" opacity="0.85" filter="blur(1px)" />
            <ellipse cx="60" cy="100" rx="8" ry="11" fill="#fef08a" opacity="0.9" />

            {/* Blood vessels */}
            <path d="M 60,90 Q 80,60 130,50 Q 150,45 170,55" fill="none" stroke="#dc2626" strokeWidth="2.5" opacity="0.85" />
            <path d="M 60,110 Q 85,140 140,145 Q 160,148 175,135" fill="none" stroke="#b91c1c" strokeWidth="2" opacity="0.85" />
            <path d="M 60,100 Q 100,105 130,100 Q 150,95 165,102" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.75" />
            <path d="M 130,50 Q 110,35 100,20" fill="none" stroke="#b91c1c" strokeWidth="1.2" opacity="0.8" />
            <path d="M 140,145 Q 120,165 110,175" fill="none" stroke="#991b1b" strokeWidth="1.2" opacity="0.8" />

            {/* Macula */}
            <circle cx="130" cy="100" r="15" fill="#1e1b4b" opacity="0.35" />
            <circle cx="130" cy="100" r="3" fill="#1e1b4b" opacity="0.6" />

            {/* Simulated lesions based on DR severity */}
            {severity > 0 && (
              <>
                {/* Microaneurysms - Red dots */}
                {Array.from({ length: Math.min(maCount, 12) }).map((_, i) => {
                  const angle = (i * 360) / 12 + 15;
                  const rad = 30 + (i % 3) * 12;
                  const cx = 100 + Math.cos((angle * Math.PI) / 180) * rad;
                  const cy = 100 + Math.sin((angle * Math.PI) / 180) * rad;
                  return (
                    <circle key={`ma-${i}`} cx={cx} cy={cy} r="1.5" fill="#f43f5e" className="animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  );
                })}
              </>
            )}

            {hasHemorrhage && (
              <>
                {/* Hemorrhages - dark red blotches */}
                <path d="M 110,75 Q 115,70 118,78 Z" fill="#991b1b" opacity="0.9" />
                <path d="M 150,115 Q 154,110 156,120 Z" fill="#7f1d1d" opacity="0.95" />
                <circle cx="145" cy="80" r="4" fill="#991b1b" opacity="0.8" />
              </>
            )}

            {hasExudates && (
              <>
                {/* Hard exudates - yellow waxy flecks */}
                <polygon points="120,110 123,108 122,112" fill="#fef08a" opacity="0.95" />
                <polygon points="125,115 128,114 127,117" fill="#fef3c7" opacity="0.9" />
                <polygon points="135,118 139,119 137,121" fill="#fef08a" opacity="0.95" />
                <polygon points="115,92 118,90 117,94" fill="#fef08a" opacity="0.9" />
              </>
            )}

            {/* Macular Edema indication */}
            {data.macularEdema && (
              <circle cx="130" cy="100" r="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" className="animate-spin" style={{ animationDuration: "12s" }} />
            )}

            <defs>
              <radialGradient id="fundusGrad" cx="50%" cy="50%" r="50%" fx="60%" fy="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            DR Severity: <span className="text-amber-500 font-bold">{severity}/4</span> • MA: <span className="text-rose-400 font-bold">{maCount}</span>
          </div>
        </div>
      );
    }

    case "portableOCT": {
      const isFluid = data.status === "Subretinal Fluid" || data.status === "Intraretinal Cystoid Spaces";
      const thickness = data.macularThickness || 240;

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center w-full">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">OCT Cross-Sectional Retinal B-Scan</span>
          <svg viewBox="0 0 300 120" className="w-full h-24">
            {/* Background grid lines */}
            <line x1="10" y1="20" x2="290" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="10" y1="60" x2="290" y2="60" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="10" y1="100" x2="290" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Inner Retinal Boundary */}
            <path d={isFluid 
              ? "M 10,25 Q 80,24 120,20 Q 150,45 180,20 Q 220,24 290,25" 
              : "M 10,25 Q 110,24 150,55 Q 190,24 290,25"} 
              fill="none" stroke="#22d3ee" strokeWidth="2.5" />

            {/* Outer Retinal / RPE Boundary */}
            <path d={isFluid
              ? "M 10,40 Q 80,41 120,40 Q 150,85 180,40 Q 220,41 290,40"
              : "M 10,40 Q 110,41 150,65 Q 190,41 290,40"}
              fill="none" stroke="#34d399" strokeWidth="2" />

            {/* Fluid Pocket or Drusen Layer */}
            {isFluid && (
              <path d="M 120,40 Q 150,83 180,40 Z" fill="#22d3ee" fillOpacity="0.25" className="animate-pulse" />
            )}

            {/* Bruch's membrane / Choroid base */}
            <line x1="10" y1="110" x2="290" y2="110" stroke="#f43f5e" strokeWidth="1.5" />

            {/* Caliper lines at Fovea */}
            <line x1="150" y1="22" x2="150" y2="110" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx="150" cy="110" r="2" fill="#e2e8f0" />
            <circle cx="150" cy={isFluid ? 61 : 55} r="2" fill="#e2e8f0" />
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Foveal Thickness: <span className="text-cyan-400 font-bold">{thickness} µm</span> • Fluid: <span className="text-emerald-400 font-bold">{data.fluidVolume} nl</span>
          </div>
        </div>
      );
    }

    case "pediatricRetinalImaging": {
      const isRop = data.status.includes("ROP");
      const plusDisease = data.plusDisease !== "N/A" && data.plusDisease !== "Absent";

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Pediatric Wide-field Retinal Sweep</span>
          <svg viewBox="0 0 200 200" className="w-40 h-40">
            <circle cx="100" cy="100" r="80" fill="#2d120a" stroke="#fb7185" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="79" fill="url(#pediaGrad)" />

            {/* Central optic nerve */}
            <circle cx="100" cy="100" r="12" fill="#fed7aa" opacity="0.8" />

            {/* Infantile blood vessels */}
            <path d="M 100,100 C 110,80 130,70 145,72" fill="none" stroke={plusDisease ? "#f43f5e" : "#e11d48"} strokeWidth={plusDisease ? 3 : 1.5} />
            <path d="M 100,100 C 90,80 70,70 55,75" fill="none" stroke={plusDisease ? "#f43f5e" : "#e11d48"} strokeWidth={plusDisease ? 3 : 1.5} />
            <path d="M 100,100 C 110,120 130,130 140,125" fill="none" stroke="#e11d48" strokeWidth="1.5" />
            <path d="M 100,100 C 90,120 70,130 60,128" fill="none" stroke="#e11d48" strokeWidth="1.5" />

            {/* ROP Demarcation line / Ridge */}
            {isRop && (
              <path d="M 40,60 Q 100,45 160,60" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            )}

            {/* Plus disease tortuosity circles */}
            {plusDisease && (
              <>
                <circle cx="130" cy="71" r="5" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx="70" cy="74" r="5" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" />
              </>
            )}

            {/* Retinoblastoma / Congenital Mass mock */}
            {data.status.includes("Congenital") && (
              <circle cx="140" cy="140" r="10" fill="#f1f5f9" opacity="0.9" filter="blur(1px)" />
            )}

            <defs>
              <radialGradient id="pediaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#e11d48" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Zone: <span className="text-rose-400 font-bold">{data.zone || "N/A"}</span> • Plus: <span className="text-amber-400 font-bold">{data.plusDisease || "N/A"}</span>
          </div>
        </div>
      );
    }

    case "ocularUltrasound3D": {
      const isDetached = data.status === "Retinal Detachment";
      const isVitreousHemorrhage = data.status === "Vitreous Hemorrhage";

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">3D Ocular B-Scan Ultrasound</span>
          <svg viewBox="0 0 200 200" className="w-40 h-40">
            {/* Ultrasonic Radar Sweep shape */}
            <path d="M 100,180 L 40,40 A 80,80 0 0,1 160,40 Z" fill="#0c1d24" stroke="#0891b2" strokeWidth="1.5" />
            
            {/* Ultrasound grid arcs */}
            <path d="M 55,75 A 60,60 0 0,1 145,75" fill="none" stroke="#155e75" strokeWidth="0.5" strokeDasharray="3,3" />
            <path d="M 70,110 A 40,40 0 0,1 130,110" fill="none" stroke="#155e75" strokeWidth="0.5" strokeDasharray="3,3" />

            {/* Lens contour */}
            <ellipse cx="100" cy="55" rx="15" ry="6" fill="none" stroke="#0891b2" strokeWidth="1.5" />

            {/* Posterior Globe Boundary (Attached retina) */}
            <path d="M 50,62 A 70,70 0 0,0 150,62" fill="none" stroke="#0284c7" strokeWidth="3" />

            {/* Detached Retinal Membrane (High acoustic band) */}
            {isDetached && (
              <path d="M 60,70 Q 100,120 150,72" fill="none" stroke="#f43f5e" strokeWidth="2.5" className="animate-pulse" />
            )}

            {/* Vitreous hemorrhage echo specs */}
            {isVitreousHemorrhage && (
              <>
                <circle cx="100" cy="110" r="1.5" fill="#a1a1aa" opacity="0.6" />
                <circle cx="85" cy="100" r="1" fill="#a1a1aa" opacity="0.4" />
                <circle cx="115" cy="120" r="1" fill="#a1a1aa" opacity="0.4" />
                <circle cx="105" cy="90" r="1.5" fill="#a1a1aa" opacity="0.5" />
                <circle cx="125" cy="105" r="1" fill="#a1a1aa" opacity="0.3" />
              </>
            )}

            <line x1="100" y1="180" x2="100" y2="40" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.4" />
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Acoustic: <span className="text-cyan-400 font-bold">{data.acousticDensity}</span> • Retina: <span className="text-rose-400 font-bold">{data.retinalAttachment}</span>
          </div>
        </div>
      );
    }

    case "portableFFA": {
      const hasLeakage = data.leakageSeverity !== "None";

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Angiographic Transit Analysis</span>
          <svg viewBox="0 0 200 200" className="w-40 h-40">
            {/* Dark background representing dye contrast */}
            <circle cx="100" cy="100" r="80" fill="#090d16" stroke="#22c55e" strokeWidth="1.5" />

            {/* Fluorescein-glowing vessel structures */}
            <path d="M 60,100 C 80,70 120,60 160,70" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray={hasLeakage ? "none" : "none"} />
            <path d="M 60,100 C 85,130 130,135 165,120" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            <path d="M 60,100 C 100,105 140,100 165,100" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />

            {/* Glowing leak points */}
            {hasLeakage && (
              <>
                <circle cx="120" cy="80" r="6" fill="#4ade80" fillOpacity="0.4" className="animate-ping" style={{ animationDuration: "3s" }} />
                <circle cx="120" cy="80" r="4" fill="#86efac" />
                
                <circle cx="140" cy="115" r="7" fill="#4ade80" fillOpacity="0.3" className="animate-ping" style={{ animationDuration: "2.5s" }} />
                <circle cx="140" cy="115" r="5" fill="#86efac" />
              </>
            )}

            {/* FAZ foveal center black avascular zone */}
            <circle cx="130" cy="98" r="10" fill="#000000" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2" />

            <circle cx="60" cy="100" r="11" fill="#86efac" opacity="0.75" />
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Transit: <span className="text-emerald-400 font-bold">{data.armToRetinaTime}s</span> • Leakage: <span className="text-lime-400 font-bold">{data.leakageSeverity}</span>
          </div>
        </div>
      );
    }

    case "portableAutoRefractometer": {
      const isMyopic = data.sphOD < 0 || data.sphOS < 0;

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center w-full">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Wavefront Diopter Mapping</span>
          <div className="flex gap-4 items-center w-full justify-around py-1">
            {/* Left Frame (OD) */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-mono">RIGHT EYE (OD)</span>
              <svg viewBox="0 0 80 80" className="w-16 h-16 mt-1">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#475569" strokeWidth="1.5" />
                {/* Visual axis align target */}
                <circle cx="40" cy="40" r="3" fill="#ef4444" />
                <line x1="40" y1="5" x2="40" y2="75" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="5" y1="40" x2="75" y2="40" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Cylindrical Axis Angle indicator */}
                {data.axisOD > 0 && (
                  <line 
                    x1="40" 
                    y1="40" 
                    x2={40 + 30 * Math.cos((data.axisOD * Math.PI) / 180)} 
                    y2={40 - 30 * Math.sin((data.axisOD * Math.PI) / 180)} 
                    stroke="#a855f7" 
                    strokeWidth="2" 
                    className="animate-pulse"
                  />
                )}
                {/* Wavefront concentric ring deformation */}
                <circle cx="40" cy="40" r={isMyopic ? 18 : 25} fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" strokeDasharray="4,2" />
              </svg>
              <div className="text-[10px] font-mono text-slate-300 mt-1">
                {data.sphOD >= 0 ? "+" : ""}{data.sphOD.toFixed(2)} D
              </div>
            </div>

            {/* Left-Right Bridge visual divider */}
            <div className="h-10 w-0.5 bg-slate-800"></div>

            {/* Right Frame (OS) */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-mono">LEFT EYE (OS)</span>
              <svg viewBox="0 0 80 80" className="w-16 h-16 mt-1">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#475569" strokeWidth="1.5" />
                <circle cx="40" cy="40" r="3" fill="#ef4444" />
                <line x1="40" y1="5" x2="40" y2="75" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="5" y1="40" x2="75" y2="40" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Cylindrical Axis Angle */}
                {data.axisOS > 0 && (
                  <line 
                    x1="40" 
                    y1="40" 
                    x2={40 + 30 * Math.cos((data.axisOS * Math.PI) / 180)} 
                    y2={40 - 30 * Math.sin((data.axisOS * Math.PI) / 180)} 
                    stroke="#a855f7" 
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}
                <circle cx="40" cy="40" r={isMyopic ? 18 : 25} fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" strokeDasharray="4,2" />
              </svg>
              <div className="text-[10px] font-mono text-slate-300 mt-1">
                {data.sphOS >= 0 ? "+" : ""}{data.sphOS.toFixed(2)} D
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "portableTonometer": {
      const od = data.iopOD || 15;
      const os = data.iopOS || 15;
      const averageIop = (od + os) / 2;
      
      // Calculate rotation for dial needle: 0 to 40 mmHg translates to -90 to +90 deg
      const calcRotation = (val: number) => {
        const percentage = Math.min(Math.max(val / 40, 0), 1);
        return -90 + percentage * 180;
      };

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Applanation / Rebound Pressure Gauge</span>
          <svg viewBox="0 0 200 120" className="w-40 h-24">
            {/* Circular Gauge Border */}
            <path d="M 30,100 A 70,70 0 0,1 170,100" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
            
            {/* Colored Zones: Green (10-21), Red (>21) */}
            {/* Hypotony zone (blue) */}
            <path d="M 32,100 A 68,68 0 0,1 60,70" fill="none" stroke="#3b82f6" strokeWidth="6" />
            {/* Healthy zone (green) */}
            <path d="M 60,70 A 68,68 0 0,1 130,50" fill="none" stroke="#10b981" strokeWidth="6" />
            {/* Hypertension zone (red) */}
            <path d="M 130,50 A 68,68 0 0,1 168,100" fill="none" stroke="#ef4444" strokeWidth="6" />

            {/* Central Pivot pin */}
            <circle cx="100" cy="100" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />

            {/* Needle representing average IOP */}
            <line 
              x1="100" 
              y1="100" 
              x2={100 + 60 * Math.cos(((calcRotation(averageIop) - 90) * Math.PI) / 180)} 
              y2={100 + 60 * Math.sin(((calcRotation(averageIop) - 90) * Math.PI) / 180)} 
              stroke="#f59e0b" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            <circle cx={100 + 60 * Math.cos(((calcRotation(averageIop) - 90) * Math.PI) / 180)} cy={100 + 60 * Math.sin(((calcRotation(averageIop) - 90) * Math.PI) / 180)} r="2" fill="#f59e0b" />

            {/* Labels */}
            <text x="35" y="115" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">0</text>
            <text x="100" y="38" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">NORMAL</text>
            <text x="165" y="115" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">40</text>
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            OD Pressure: <span className={od > 21 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>{od} mmHg</span> • OS: <span className={os > 21 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>{os} mmHg</span>
          </div>
        </div>
      );
    }

    case "opticNerveDisease": {
      const cdrOD = data.cupToDiscRatioOD || 0.35;
      const isGlaucomatous = cdrOD > 0.5;

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Optic Nerve Head (ONH) Contour Map</span>
          <svg viewBox="0 0 200 200" className="w-40 h-40">
            {/* Background fundus sweep */}
            <circle cx="100" cy="100" r="80" fill="#20100a" />

            {/* Optic Disc boundary - Outer Ring (Yellow/Pink) */}
            <ellipse cx="100" cy="100" rx="45" ry="50" fill="#fed7aa" opacity="0.6" stroke="#fb923c" strokeWidth="2" />

            {/* Optic Cup boundary - Inner Ring (Light Yellow - sized dynamically by CDR!) */}
            <ellipse 
              cx="100" 
              cy="100" 
              rx={45 * cdrOD} 
              ry={50 * cdrOD} 
              fill="#fef08a" 
              stroke={isGlaucomatous ? "#f43f5e" : "#eab308"} 
              strokeWidth="2.5" 
              className={isGlaucomatous ? "animate-pulse" : ""}
            />

            {/* Retinal vessels crossing the rim and folding at the cup border */}
            {/* Vessel 1 */}
            <path d="M 100,100 C 105,95 102,80 110,40" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            {/* Vessel 2 */}
            <path d="M 100,100 C 95,105 92,120 80,160" fill="none" stroke="#991b1b" strokeWidth="1.5" />
            {/* Vessel 3 */}
            <path d="M 100,100 C 110,105 125,110 155,115" fill="none" stroke="#dc2626" strokeWidth="1.2" />

            {/* Margin Indicators */}
            <line x1="55" y1="100" x2="145" y2="100" stroke="#f8fafc" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Cup-to-Disc Ratio (OD): <span className={isGlaucomatous ? "text-rose-400 font-bold" : "text-emerald-400"}>{cdrOD.toFixed(2)}</span>
          </div>
        </div>
      );
    }

    case "amblyopiaTechnology": {
      const angle = data.strabismusAngle || 0;
      const isStrabismic = angle > 0;

      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">Binocular Gazing Alignment</span>
          <svg viewBox="0 0 200 100" className="w-40 h-20">
            {/* Left Eye */}
            <circle cx="55" cy="50" r="22" fill="#020617" stroke="#475569" strokeWidth="1.5" />
            <circle cx="55" cy="50" r="12" fill="#0891b2" />
            <circle cx="55" cy="50" r="5" fill="#000000" />
            <circle cx="52" cy="47" r="2" fill="#ffffff" /> {/* corneal reflection */}

            {/* Right Eye (showing strabismus shift based on angle!) */}
            <circle cx="145" cy="50" r="22" fill="#020617" stroke="#475569" strokeWidth="1.5" />
            <circle cx={145 + Math.min(angle * 0.8, 12)} cy="50" r="12" fill="#0891b2" />
            <circle cx={145 + Math.min(angle * 0.8, 12)} cy="50" r="5" fill="#000000" />
            <circle cx={142 + Math.min(angle * 0.8, 12)} cy="47" r="2" fill="#ffffff" />

            {/* Diagnostic target crosshair on aligned target */}
            {isStrabismic && (
              <circle cx="145" cy="50" r="18" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3,3" />
            )}
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-300">
            Deviation: <span className={isStrabismic ? "text-rose-400 font-bold" : "text-emerald-400"}>{angle}° ({data.fixationPattern})</span>
          </div>
        </div>
      );
    }

    case "universalScreening": {
      return (
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center w-full">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-mono">LogMAR Optotype & Acuity Screening</span>
          <div className="flex justify-around items-center w-full bg-slate-900/50 rounded-lg p-2 border border-slate-800">
            <div className="text-left font-mono">
              <div className="text-[11px] text-slate-400">VISUAL ACUITY</div>
              <div className="text-xs text-slate-200 mt-1">OD: <span className="text-cyan-400 font-bold">{data.visualAcuityOD}</span></div>
              <div className="text-xs text-slate-200">OS: <span className="text-cyan-400 font-bold">{data.visualAcuityOS}</span></div>
            </div>
            
            {/* Mock Snellen Chart graphics */}
            <div className="flex flex-col items-center font-bold text-slate-100 font-sans leading-none border-l border-slate-800 pl-4">
              <span className="text-lg">E</span>
              <span className="text-xs tracking-widest mt-1">F P</span>
              <span className="text-[9px] tracking-widest text-slate-400">T O Z</span>
              <span className="text-[6px] tracking-widest text-slate-500">L P E D</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-300">
            Color: <span className="text-emerald-400 font-bold">{data.colorVision}</span> • Contrast: <span className="text-emerald-400 font-bold">{data.contrastSensitivity}</span>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
