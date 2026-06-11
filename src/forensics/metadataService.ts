import exifParser from 'exif-parser';

export interface MetadataResult {
    integrityScore: number;
    details: any;
    isSuspicious: boolean;
    issues: string[];
}

export async function analyzeMetadata(buffer: Buffer): Promise<MetadataResult> {
    try {
        const parser = exifParser.create(buffer);
        const result = parser.parse();
        
        const issues: string[] = [];
        let score = 100;
        
        // Simple heuristic check: AI models often strip metadata or leave specific traces
        if (!result.tags.Make || !result.tags.Model) {
            issues.push("Missing hardware camera model/make signatures");
            score -= 30;
        }
        
        if (result.tags.Software && result.tags.Software.toLowerCase().includes('ai')) {
            issues.push("Detected AI-tool software signature in metadata");
            score -= 50;
        }
        
        return {
            integrityScore: Math.max(0, score),
            details: result.tags,
            isSuspicious: score < 70,
            issues
        };
    } catch (e) {
        return {
            integrityScore: 0,
            details: {},
            isSuspicious: true,
            issues: ["Failed to parse metadata or no EXIF data present"]
        };
    }
}
