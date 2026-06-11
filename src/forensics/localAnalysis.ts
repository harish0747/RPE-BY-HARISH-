import { AnalysisResult } from '../types';
import { Buffer } from 'buffer';
import { analyzeMetadata } from './metadataService';
import { processELA } from './elaService';
import { analyzeFFT } from './fftService';

export async function simulateForensicAnalysis(imageBase64: string, deepScan: boolean): Promise<AnalysisResult> {
    // Call the server-side analysis API
    const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
        throw new Error("Failed to analyze image");
    }

    const aiResult = await response.json();

    // Map Gemini results to the structure expected by the app
    // We maintain default fallbacks for properties not returned by gemini
    return {
        classification: aiResult.classification || 'Uncertain',
        aiProbabilityScore: aiResult.aiProbabilityScore || 0,
        confidenceLevel: aiResult.confidenceLevel || 'Medium',
        detailedModelScores: {
            stableDiffusion: aiResult.classification === 'AI-generated' ? 80 : 0,
            midjourney: 0,
            dallE: 0,
            flux: 0,
            gan: 0,
            deepfake: 0,
            aiEnhancement: 0,
        },
        synthID: {
            detected: 'Possible',
            watermarkProbability: 0,
            removalSuspicion: 'Low',
        },
        forensicIndicators: [aiResult.finalForensicSummary || "No analysis details."],
        suspiciousRegions: [],
        physicsCameraValidation: "N/A",
        finalForensicSummary: aiResult.finalForensicSummary || "Analysis inconclusive.",
        reconstructedPrompt: aiResult.reconstructedPrompt || "N/A",
        reportContent: aiResult.reportContent || "No detailed report available."
    };
}
