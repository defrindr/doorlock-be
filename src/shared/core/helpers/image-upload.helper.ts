import { BadRequestException } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import { AppConfig } from '@src/config';

export interface UploadImageOptions {
  /** Upload destination directory relative to uploads folder */
  destination?: string;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Allowed image formats (default: ['jpg', 'jpeg', 'png', 'webp']) */
  allowedFormats?: string[];
  /** Whether to generate thumbnail (default: false) */
  generateThumbnail?: boolean;
  /** Thumbnail size (default: { width: 150, height: 150 }) */
  thumbnailSize?: { width: number; height: number };
  /** Whether to compress image (default: true) */
  compress?: boolean;
  /** Image quality for compression (1-100, default: 85) */
  quality?: number;
  /** Maximum image dimensions */
  maxDimensions?: { width: number; height: number };
  /** Custom filename (without extension) */
  customFilename?: string;
  /** Whether to preserve original filename (default: false) */
  preserveOriginalName?: boolean;
}

export interface UploadImageResult {
  /** Original filename */
  originalName: string;
  /** Generated filename with extension */
  filename: string;
  /** File path relative to upload directory */
  path: string;
  /** Full file path */
  fullPath: string;
  /** File size in bytes */
  size: number;
  /** Image dimensions */
  dimensions: { width: number; height: number };
  /** MIME type */
  mimeType: string;
  /** Thumbnail info (if generated) */
  thumbnail?: {
    filename: string;
    path: string;
    fullPath: string;
  };
}

export class ImageUploadHelper {
  private static readonly DEFAULT_OPTIONS: Required<
    Omit<UploadImageOptions, 'customFilename'>
  > = {
    destination: 'images',
    maxSize: AppConfig.maxFileSize,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    generateThumbnail: false,
    thumbnailSize: { width: 150, height: 150 },
    compress: true,
    quality: 85,
    maxDimensions: { width: 2048, height: 2048 },
    preserveOriginalName: false,
  };

  /**
   * Upload and process image file
   * @param fileBuffer File buffer from multipart upload
   * @param originalFilename Original filename
   * @param mimetype File MIME type
   * @param options Upload options
   * @returns Upload result information
   */
  static async uploadImage(
    fileBuffer: Buffer,
    originalFilename: string,
    mimetype: string,
    options: UploadImageOptions = {},
  ): Promise<UploadImageResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Validate file
    this.validateFile(fileBuffer, originalFilename, mimetype, opts);

    // Setup paths
    const uploadDir = join(process.cwd(), 'public', opts.destination);
    this.ensureDirectoryExists(uploadDir);

    // Generate filename
    const extension = this.getFileExtension(originalFilename);
    const filename = this.generateFilename(originalFilename, extension, opts);

    // Process image
    const processedImageBuffer = await this.processImage(fileBuffer, opts);

    // Get image metadata
    const metadata = await sharp(processedImageBuffer).metadata();
    const dimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };

    // Save main image
    const filePath = join(uploadDir, filename);
    await this.saveFile(processedImageBuffer, filePath);

    // Generate thumbnail if requested
    let thumbnail: UploadImageResult['thumbnail'];
    if (opts.generateThumbnail) {
      thumbnail = await this.generateThumbnail(
        processedImageBuffer,
        filename,
        uploadDir,
        opts,
      );
    }

    return {
      originalName: originalFilename,
      filename,
      path: join(opts.destination, filename).replace(/\\/g, '/'),
      fullPath: filePath,
      size: processedImageBuffer.length,
      dimensions,
      mimeType: `image/${this.getImageFormat(extension)}`,
      thumbnail,
    };
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    options: Required<Omit<UploadImageOptions, 'customFilename'>>,
  ): void {
    // Check file size
    if (buffer.length > options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.formatBytes(
          options.maxSize,
        )}`,
      );
    }

    // Check file extension
    const extension = this.getFileExtension(filename).toLowerCase();
    if (!options.allowedFormats.includes(extension)) {
      throw new BadRequestException(
        `File type not allowed. Allowed formats: ${options.allowedFormats.join(
          ', ',
        )}`,
      );
    }

    // Check MIME type
    const allowedMimeTypes = options.allowedFormats.map(
      (format) => `image/${format === 'jpg' ? 'jpeg' : format}`,
    );
    if (!allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(`Invalid file type: ${mimetype}`);
    }
  }

  /**
   * Process image (resize, compress, etc.)
   */
  private static async processImage(
    buffer: Buffer,
    options: Required<Omit<UploadImageOptions, 'customFilename'>>,
  ): Promise<Buffer> {
    let image = sharp(buffer);

    // Get original dimensions
    const metadata = await image.metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Resize if exceeds maximum dimensions
    if (
      originalWidth > options.maxDimensions.width ||
      originalHeight > options.maxDimensions.height
    ) {
      image = image.resize(
        options.maxDimensions.width,
        options.maxDimensions.height,
        {
          fit: 'inside',
          withoutEnlargement: true,
        },
      );
    }

    // Apply compression
    if (options.compress) {
      image = image.jpeg({ quality: options.quality });
    }

    return image.toBuffer();
  }

  /**
   * Generate thumbnail
   */
  private static async generateThumbnail(
    imageBuffer: Buffer,
    originalFilename: string,
    uploadDir: string,
    options: Required<Omit<UploadImageOptions, 'customFilename'>>,
  ): Promise<UploadImageResult['thumbnail']> {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(options.thumbnailSize.width, options.thumbnailSize.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailFilename = this.addSuffixToFilename(
      originalFilename,
      '_thumb',
    );
    const thumbnailPath = join(uploadDir, thumbnailFilename);

    await this.saveFile(thumbnailBuffer, thumbnailPath);

    return {
      filename: thumbnailFilename,
      path: join(options.destination, thumbnailFilename).replace(/\\/g, '/'),
      fullPath: thumbnailPath,
    };
  }

  /**
   * Save file to disk
   */
  private static async saveFile(
    buffer: Buffer,
    filePath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(buffer);
      writeStream.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  /**
   * Generate unique filename
   */
  private static generateFilename(
    originalFilename: string,
    extension: string,
    options: UploadImageOptions,
  ): string {
    if (options.customFilename) {
      return `${options.customFilename}.${extension}`;
    }

    if (options.preserveOriginalName) {
      const baseName = originalFilename.replace(/\.[^/.]+$/, '');
      const timestamp = Date.now();
      return `${baseName}_${timestamp}.${extension}`;
    }

    return `${uuidv4()}.${extension}`;
  }

  /**
   * Add suffix to filename (before extension)
   */
  private static addSuffixToFilename(filename: string, suffix: string): string {
    const extension = this.getFileExtension(filename);
    const baseName = filename.replace(/\.[^/.]+$/, '');
    return `${baseName}${suffix}.${extension}`;
  }

  /**
   * Get file extension without dot
   */
  private static getFileExtension(filename: string): string {
    return extname(filename).slice(1).toLowerCase();
  }

  /**
   * Get image format for Sharp
   */
  private static getImageFormat(extension: string): string {
    return extension === 'jpg' ? 'jpeg' : extension;
  }

  /**
   * Ensure directory exists
   */
  private static ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Format bytes to human readable string
   */
  private static formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Delete uploaded image and thumbnail
   */
  static async deleteImage(uploadResult: UploadImageResult): Promise<void> {
    try {
      // Delete main image
      await fs.unlink(uploadResult.fullPath);

      // Delete thumbnail if exists
      if (uploadResult.thumbnail) {
        await fs.unlink(uploadResult.thumbnail.fullPath);
      }
    } catch (error) {
      console.warn('Error deleting image files:', error);
    }
  }

  /**
   * Get upload directory path
   */
  static getUploadPath(destination: string = 'images'): string {
    return join(process.cwd(), 'public', destination);
  }

  /**
   * Get public URL for uploaded image
   */
  static getPublicUrl(filePath: string, baseUrl?: string): string {
    const cleanPath = filePath.replace(/\\/g, '/');
    const publicPath = `/static/${cleanPath}`;

    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, '')}${publicPath}`;
    }

    return publicPath;
  }
}
