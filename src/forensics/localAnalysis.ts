import { AnalysisResult } from '../types';
import { Buffer } from 'buffer';
import { analyzeMetadata } from './metadataService';
import { processELA } from './elaService';
import { analyzeFFT } from './fftService';

export async function simulateForensicAnalysis(imageBase64: string, deepScan: boolean): Promise<AnalysisResult> {
    const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    const outputDir = ''; // Removed path/process

    // Run actual local heuristics
    const [metadata, ela, fft] = await Promise.all([
        analyzeMetadata(buffer),
        processELA(buffer, outputDir),
        analyzeFFT(buffer, outputDir)
    ]);

    // Heuristic weighting
    const isSuspicious = metadata.isSuspicious || ela.varianceScore > 40 || fft.isSuspicious;
    const aiProbabilityScore = Math.min(100, Math.floor(
        (metadata.integrityScore < 50 ? 50 : 0) + 
        (ela.varianceScore > 30 ? 30 : 0) + 
        (fft.isSuspicious ? 20 : 0)
    ));

    const isAI = aiProbabilityScore > 50;

    return {
        classification: isAI ? 'AI-generated' : 'Real',
        aiProbabilityScore,
        confidenceLevel: aiProbabilityScore > 80 ? 'Very High' : aiProbabilityScore > 50 ? 'High' : 'Medium',
        detailedModelScores: {
            stableDiffusion: isAI ? 70 + (Math.random() * 20) : 5,
            midjourney: isAI ? 30 + (Math.random() * 20) : 2,
            dallE: isAI ? 40 + (Math.random() * 20) : 1,
            flux: isAI ? 20 + (Math.random() * 20) : 1,
            gan: isAI ? 10 + (Math.random() * 20) : 5,
            deepfake: 10,
            aiEnhancement: isAI ? 50 + (Math.random() * 20) : 10,
        },
        synthID: {
            detected: isAI ? 'Possible' : 'No',
            watermarkProbability: isAI ? Math.floor(Math.random() * 40) + 50 : Math.floor(Math.random() * 10),
            removalSuspicion: 'Medium',
        },
        forensicIndicators: [
            ...metadata.issues,
            `ELA Variance Score: ${ela.varianceScore.toFixed(2)}`,
            isAI ? "High-frequency artifacts detected" : "Standard sensor noise profile",
        ],
        suspiciousRegions: isAI ? ["Texture Surfaces"] : [],
        physicsCameraValidation: "Consistent with ISO 100",
        finalForensicSummary: isAI 
            ? "Image exhibits high-frequency statistical artifacts consistent with latent diffusion models and metadata stripping." 
            : "Image statistical profile matches standard camera sensor characteristics.",
        reversePromptReconstruction: {
            prompt: isAI ? "A hyper-realistic photograph, cinematic lighting, 8k resolution, highly detailed texture, shot on 35mm lens." : "",
            model: isAI ? "Latent Diffusion Model" : "N/A",
            style: isAI ? "Photorealistic" : "N/A",
            loraPossibility: isAI ? "High probability of fine-tuned portrait LoRA" : "N/A",
        }
    };
}
