// Removed sharp usage entirely
export interface FFTResult {
    spectralImagePath: string;
    isSuspicious: boolean;
}

export async function analyzeFFT(inputBuffer: Buffer, outputBasePath: string): Promise<FFTResult> {
    // Return mock results instead of using sharp
    return {
        spectralImagePath: '',
        isSuspicious: true // Placeholder
    };
}
