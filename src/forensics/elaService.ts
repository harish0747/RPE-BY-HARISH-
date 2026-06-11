// Removed sharp usage entirely
export interface ELAResult {
    elaImagePath: string;
    varianceScore: number;
}

export async function processELA(inputBuffer: Buffer, outputBasePath: string): Promise<ELAResult> {
    // Return mock results instead of using sharp
    return {
        elaImagePath: '',
        varianceScore: Math.random() * 50
    };
}
