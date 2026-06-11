export interface AnalysisResult {
  classification: 'AI-generated' | 'Real' | 'Edited' | 'Deepfake' | 'Hybrid' | 'Uncertain';
  aiProbabilityScore: number;
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  finalForensicSummary: string;
  reconstructedPrompt: string;
  reportContent: string;
  detailedModelScores: {
    stableDiffusion: number;
    midjourney: number;
    dallE: number;
    flux: number;
    gan: number;
    deepfake: number;
    aiEnhancement: number;
  };
  synthID: {
    detected: 'Yes' | 'No' | 'Possible';
    watermarkProbability: number;
    removalSuspicion: 'Low' | 'Medium' | 'High';
  };
  forensicIndicators: string[];
  suspiciousRegions: string[];
  physicsCameraValidation: string;
}

export interface BatchResult extends AnalysisResult {
  id: string;
  filename: string;
  timestamp: string;
  thumbnail: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}
