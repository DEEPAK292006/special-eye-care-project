export interface PatientProfile {
  id: string;
  age: number;
  gender: string;
  scanTimestamp: string;
}

export interface DRDetails {
  status: string; // "No DR" | "Mild NPDR" | "Moderate NPDR" | "Severe NPDR" | "PDR"
  severityLevel: number; // 0-4
  microaneurysms: number;
  hemorrhages: boolean;
  exudates: boolean;
  macularEdema: boolean;
  findings: string;
  confidence: number;
}

export interface OCTDetails {
  status: string; // "Normal" | "Subretinal Fluid" | "Intraretinal Cystoid Spaces" | "RNFL Thinning"
  macularThickness: number; // in microns
  fluidVolume: number; // in nanoliters
  rnflAverageThickness: number; // in microns
  findings: string;
  confidence: number;
}

export interface PediatricDetails {
  status: string; // "No ROP" | "ROP Stage 1" | "ROP Stage 2" | "ROP Stage 3" | "Plus Disease" | "Congenital Anomalies"
  zone: string; // "I" | "II" | "III" | "N/A"
  plusDisease: "Present" | "Absent" | "Pre-Plus" | "N/A";
  findings: string;
  confidence: number;
}

export interface UltrasoundDetails {
  status: string; // "Clear Posterior Segment" | "Vitreous Hemorrhage" | "Retinal Detachment" | "Intraocular Mass"
  acousticDensity: "Low" | "Medium" | "High" | "None" | string;
  retinalAttachment: "Attached" | "Detached (Partial)" | "Detached (Total)" | string;
  findings: string;
  confidence: number;
}

export interface FFADetails {
  status: string; // "Normal Transit" | "Vascular Leakage" | "Capillary Non-Perfusion" | "Neovascularization"
  armToRetinaTime: number; // seconds
  leakageSeverity: "None" | "Mild" | "Moderate" | "Severe" | string;
  findings: string;
  confidence: number;
}

export interface RefractometerDetails {
  status: string; // "Emmetropia" | "Myopia" | "Hyperopia" | "Astigmatism"
  sphOD: number;
  cylOD: number;
  axisOD: number;
  sphOS: number;
  cylOS: number;
  axisOS: number;
  findings: string;
  confidence: number;
}

export interface TonometerDetails {
  status: string; // "Normal IOP" | "Ocular Hypertension" | "Hypotony"
  iopOD: number; // mmHg
  iopOS: number; // mmHg
  findings: string;
  confidence: number;
}

export interface OpticNerveDetails {
  status: string; // "Normal ONH" | "Glaucomatous Optic Neuropathy" | "Optic Disc Edema" | "Optic Atrophy"
  cupToDiscRatioOD: number;
  cupToDiscRatioOS: number;
  rimThinning: "None" | "Sectoral" | "Generalized" | string;
  findings: string;
  confidence: number;
}

export interface AmblyopiaDetails {
  status: string; // "No Amblyogenic Risk" | "High Anisometropia Risk" | "Strabismic Amblyopia Suspect"
  strabismusAngle: number; // degrees
  fixationPattern: "Central & Steady" | "Eccentric" | "Unsteady" | string;
  findings: string;
  confidence: number;
}

export interface UniversalScreeningDetails {
  status: string; // "Screening Complete" | "Referral Required"
  visualAcuityOD: string;
  visualAcuityOS: string;
  colorVision: string;
  contrastSensitivity: "Normal" | "Reduced" | string;
  findings: string;
  confidence: number;
}

export interface ClinicalTopics {
  diabeticRetinopathy: DRDetails;
  portableOCT: OCTDetails;
  pediatricRetinalImaging: PediatricDetails;
  ocularUltrasound3D: UltrasoundDetails;
  portableFFA: FFADetails;
  portableAutoRefractometer: RefractometerDetails;
  portableTonometer: TonometerDetails;
  opticNerveDisease: OpticNerveDetails;
  amblyopiaTechnology: AmblyopiaDetails;
  universalScreening: UniversalScreeningDetails;
}

export interface DiagnosticReport {
  overallHealthIndex: number;
  overallVerdict: "Normal" | "Borderline" | "Routine Referral" | "Urgent Referral";
  summary: string;
  patientProfile: PatientProfile;
  topics: ClinicalTopics;
  recommendations: string[];
}

export interface ClinicalSample {
  id: string;
  name: string;
  description: string;
  deviceType: string;
  imageUrl: string;
  topicIndex: number; // 1 to 10
  patientInfo: string;
}
