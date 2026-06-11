
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'training_data.json');

interface TrainingEntry {
    imageHash: string; // Simplified as image signature
    classification: 'AI' | 'Original';
    timestamp: number;
}

export function saveTrainingData(imageHash: string, classification: 'AI' | 'Original') {
    if (!fs.existsSync(path.dirname(STORE_PATH))) {
        fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    }
    
    let data: TrainingEntry[] = [];
    if (fs.existsSync(STORE_PATH)) {
        data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
    
    data.push({ imageHash, classification, timestamp: Date.now() });
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export function getTrainingData(imageHash: string): TrainingEntry | undefined {
    if (!fs.existsSync(STORE_PATH)) return undefined;
    const data: TrainingEntry[] = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    return data.find(entry => entry.imageHash === imageHash);
}
