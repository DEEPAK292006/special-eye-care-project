import { ClinicalSample } from "../types";

export const CLINICAL_SAMPLES: ClinicalSample[] = [
  {
    id: "diabetic_retinopathy_active",
    name: "Diabetic Retinopathy & DME Suspect",
    description: "Retinal fundus scan displaying extensive microaneurysms, hard exudates, and macular edema.",
    deviceType: "ICMR Topic 1 & 5: Fundus/FFA Imaging",
    imageUrl: "fundus_dr",
    topicIndex: 1,
    patientInfo: "Male, 54 Years. Type-2 Diabetes for 12 years. Complaining of bilateral blurry vision."
  },
  {
    id: "glaucoma_optic_nerve_severe",
    name: "Glaucomatous Optic Neuropathy",
    description: "Optic disk showing deep pathological cupping (0.78 CDR) and high Intraocular Pressure.",
    deviceType: "ICMR Topic 7 & 8: Tonometer/Optic Nerve AI",
    imageUrl: "optic_nerve_glaucoma",
    topicIndex: 8,
    patientInfo: "Female, 62 Years. Family history of glaucoma. Elevated IOP measured at 28 mmHg."
  },
  {
    id: "pediatric_rop_congenital",
    name: "Pediatric ROP Stage 2 (Zone II)",
    description: "Wide-field pediatric retinal image of a premature neonate displaying active vessel ridge.",
    deviceType: "ICMR Topic 3 & 9: Pediatric/Amblyopia Device",
    imageUrl: "pediatric_retina_rop",
    topicIndex: 3,
    patientInfo: "Neonate (Preterm 29 weeks). Screened at 4 weeks postnatal age. Pre-plus signs noticed."
  },
  {
    id: "oct_dme_amd",
    name: "Age-Related Macular Degeneration",
    description: "OCT cross-sectional scan demonstrating sub-RPE drusen deposits and geographic foveal thinning.",
    deviceType: "ICMR Topic 2: Handheld OCT Scanner",
    imageUrl: "oct_macular_drusen",
    topicIndex: 2,
    patientInfo: "Female, 71 Years. Describes gradual loss of central reading vision with mild distortion."
  },
  {
    id: "ultrasound_detachment_dense",
    name: "Rhegmatogenous Retinal Detachment",
    description: "3D ocular ultrasound showing dense membranous band anchored at the optic nerve head.",
    deviceType: "ICMR Topic 4: 3D Ocular Ultrasound",
    imageUrl: "ultrasound_bscan",
    topicIndex: 4,
    patientInfo: "Male, 43 Years. Post-trauma severe vision reduction. Opaque media prevents optical screening."
  },
  {
    id: "normal_healthy",
    name: "Standard Ocular Baseline Screen",
    description: "Pristine retinal and physiological screening. No vascular, optic, or sensory anomalies detected.",
    deviceType: "ICMR Topic 10: Universal Community Screen",
    imageUrl: "normal_healthy_eye",
    topicIndex: 10,
    patientInfo: "Female, 34 Years. Annual preventive community health checkup. Asymptomatic."
  }
];
