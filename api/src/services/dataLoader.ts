// src/services/dataLoader.ts

import * as fs from 'fs/promises';
import * as path from 'path';

// IMPORTANT: Make sure you have a 'data/namebio_exports' directory in your project root
const NAMEBIO_EXPORTS_DIR = path.join(process.cwd(), 'data', 'namebio_exports');

let cachedSalesData: string | null = null;

/**
 * Loads all CSV files from the namebio_exports directory, combines them,
 * and returns the content as a single, massive CSV string. It samples the data
 * if it's too large to fit in a prompt.
 */
export async function loadHistoricalSalesData(): Promise<string> {
    if (cachedSalesData) {
        console.log('[DataLoader] Returning cached historical sales data.');
        return cachedSalesData;
    }

    console.log('[DataLoader] Loading historical sales data from CSV files...');
    try {
        const files = await fs.readdir(NAMEBIO_EXPORTS_DIR);
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        if (csvFiles.length === 0) {
            throw new Error("No CSV files found in the 'data/namebio_exports' directory.");
        }

        let allLines: string[] = [];

        for (const file of csvFiles) {
            const filePath = path.join(NAMEBIO_EXPORTS_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            // Read content, split by line, skip header, and filter out empty lines
            const lines = content.split('\n').slice(1).filter(line => line.trim() !== '');
            allLines.push(...lines);
        }

        // Shuffle the array to get a random sample
        for (let i = allLines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
        }
        
        // Take a large but manageable sample (e.g., 5000 records) for the prompt
        const sampleLines = allLines.slice(0, 5000);
        
        const combinedCsvString = "Domain,Price,Date\n" + sampleLines.join('\n');

        console.log(`[DataLoader] Successfully loaded and sampled ${sampleLines.length} records from ${csvFiles.length} files.`);
        cachedSalesData = combinedCsvString;
        return combinedCsvString;

    } catch (error) {
        console.error("[DataLoader] Failed to load historical sales data:", error);
        return "Domain,Price,Date\nerror.com,0,2025-01-01\n";
    }
}