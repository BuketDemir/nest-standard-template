import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface PdfFile {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
  path: string;
}

export interface PdfMetadata {
  data: PdfFile[];
}

@Injectable()
export class FilesService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly documentsDir = path.join(this.dataDir, 'documents');
  private readonly dbDir = path.join(this.dataDir, 'db');
  private readonly metadataFile = path.join(this.dbDir, 'documents-metadata.json');

  constructor() {
    this.ensureDirectoriesExist();
  }

  /**
   * Gerekli klasörlerin var olduğundan emin ol
   */
  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
    if (!fs.existsSync(this.metadataFile)) {
      this.saveMetadata({ data: [] });
    }
  }

  /**
   * Metadata dosyasını oku
   */
  private readMetadata(): PdfMetadata {
    try {
      const data = fs.readFileSync(this.metadataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading metadata:', error);
      return { data: [] };
    }
  }

  /**
   * Metadata dosyasını kaydet
   */
  private saveMetadata(metadata: PdfMetadata): void {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Error saving metadata:', error);
      throw new Error('Failed to save metadata');
    }
  }

  /**
   * Response validation helper
   */
  private validateResponse(response: any, validator?: (response: any) => boolean): boolean {
    if (!response || response.status === false) {
      return false;
    }

    if (validator) {
      return validator(response);
    }

    return !!response.data;
  }

  /**
   * PDF dosyası upload et
   */
  async uploadPdf(file: Express.Multer.File): Promise<PdfFile> {
    const id = uuidv4();
    
    // Dosya adını doğru encoding ile decode et
    let originalName = file.originalname;
    try {
      // Eğer dosya adı bozuk encoding'de geliyorsa, düzelt
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (error) {
      console.log('Filename decoding failed, using original:', originalName);
    }
    
    // ID ile dosya adı oluştur
    const filename = `${id}.pdf`;
    const filePath = path.join(this.documentsDir, filename);

    // Dosyayı kaydet
    fs.writeFileSync(filePath, file.buffer);

    // Metadata oluştur
    const pdfFile: PdfFile = {
      id,
      originalName: originalName, // Düzeltilmiş adı kullan
      filename,
      size: file.size,
      uploadDate: new Date().toISOString(),
      path: `data/documents/${filename}`, // Relative path kullan
    };

    // Metadata'yı güncelle
    const metadata = this.readMetadata();
    metadata.data.push(pdfFile);
    this.saveMetadata(metadata);

    return pdfFile;
  }

  /**
   * Tüm PDF dosyalarını listele
   */
  async getAllData(): Promise<PdfFile[]> {
    const metadata = this.readMetadata();
    return metadata.data;
  }

  /**
   * PDF dosyasını ID ile sil
   */
  async deletePdf(id: string): Promise<boolean> {
    const metadata = this.readMetadata();
    const fileIndex = metadata.data.findIndex(pdf => pdf.id === id);

    if (fileIndex === -1) {
      return false;
    }

    const file = metadata.data[fileIndex];

    // Fiziksel dosyayı sil
    try {
      const absolutePath = path.join(process.cwd(), file.path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    // Metadata'dan kaldır
    metadata.data.splice(fileIndex, 1);
    this.saveMetadata(metadata);

    return true;
  }
} 