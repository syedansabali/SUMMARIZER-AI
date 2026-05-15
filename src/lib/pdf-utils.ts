/**
 * PDF Extraction Utility using pdfjs-dist
 * Replaces pdf-parse to avoid DOMMatrix and native binding issues
 * Compatible with Node.js, Vercel, and Google Cloud Run
 */

import * as pdfjs from 'pdfjs-dist';

// Set worker source - use the built-in worker
const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  metadata?: Record<string, any>;
}

/**
 * Extract text from a PDF buffer
 * @param buffer PDF file buffer
 * @returns Extracted text and page count
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractionResult> {
  try {
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const pageCount = pdf.numPages;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items into a single string
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        fullText += `[Error extracting page ${pageNum}]\n`;
      }
    }
    
    // Try to get metadata
    let metadata: Record<string, any> = {};
    try {
      metadata = await pdf.getMetadata().catch(() => ({}));
    } catch (metadataError) {
      console.warn('Failed to extract metadata:', metadataError);
    }
    
    return {
      text: fullText.trim(),
      pageCount,
      metadata
    };
  } catch (error: any) {
    console.error('PDF extraction failed:', error);
    throw new Error(`PDF extraction error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract specific page text
 * @param buffer PDF file buffer
 * @param pageNumber Page number (1-indexed)
 * @returns Text from the specified page
 */
export async function extractPageText(buffer: Buffer, pageNumber: number): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Page number ${pageNumber} is out of range (1-${pdf.numPages})`);
    }
    
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    
    return textContent.items
      .map((item: any) => item.str)
      .join(' ');
  } catch (error: any) {
    console.error(`Failed to extract page ${pageNumber}:`, error);
    throw new Error(`Page extraction error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get PDF metadata without extracting all text
 * @param buffer PDF file buffer
 * @returns PDF metadata
 */
export async function getPdfMetadata(buffer: Buffer): Promise<Record<string, any>> {
  try {
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const metadata = await pdf.getMetadata().catch(() => ({}));
    
    return {
      pageCount: pdf.numPages,
      metadata
    };
  } catch (error: any) {
    console.error('Failed to get PDF metadata:', error);
    throw new Error(`Metadata extraction error: ${error.message || 'Unknown error'}`);
  }
}
