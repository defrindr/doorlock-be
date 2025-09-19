import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ImageUploadHelper,
  UploadImageResult,
} from '@src/shared/core/helpers/image-upload.helper';
import { Account } from '@src/modules/identities/entities/account.entity';

@Injectable()
export class GuestImageService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Handle guest photo upload during creation
   */
  async handlePhotoUpload(photoFile: any): Promise<string | undefined> {
    if (!photoFile || !photoFile.buffer) {
      return undefined;
    }

    const uploadResult = await ImageUploadHelper.uploadImage(
      photoFile.buffer,
      photoFile.filename,
      photoFile.mimetype,
      {
        destination: 'guests/photos',
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png'],
        generateThumbnail: true,
        thumbnailSize: { width: 120, height: 120 },
        compress: true,
        quality: 90,
        maxDimensions: { width: 800, height: 800 },
      },
    );

    return uploadResult.path;
  }

  /**
   * Handle guest photo update (delete old, upload new)
   */
  async handlePhotoUpdate(
    photoFile: any,
    currentPhotoPath?: string,
  ): Promise<string | undefined> {
    if (!photoFile || !photoFile.buffer) {
      return undefined;
    }

    // Delete old photo if exists
    if (currentPhotoPath) {
      await this.deletePhoto(currentPhotoPath);
    }

    // Upload new photo
    return this.handlePhotoUpload(photoFile);
  }

  /**
   * Delete photo from storage
   */
  async deletePhoto(photoPath: string): Promise<void> {
    try {
      await ImageUploadHelper.deleteImage({
        path: photoPath,
        fullPath: ImageUploadHelper.getUploadPath() + '/' + photoPath,
      } as UploadImageResult);
    } catch (error) {
      console.warn('Failed to delete photo:', photoPath, error);
    }
  }

  /**
   * Update account photo
   */
  async updateAccountPhoto(
    accountId: string,
    photoPath: string | undefined,
  ): Promise<void> {
    if (photoPath) {
      await this.accountRepository.update(accountId, { photo: photoPath });
    }
  }

  /**
   * Clean up guest photo when deleting account
   */
  async cleanupGuestPhoto(account: Account): Promise<void> {
    if (account.photo) {
      await this.deletePhoto(account.photo);
    }
  }

  /**
   * Get full photo URL for guest
   */
  getPhotoUrl(photoPath: string, baseUrl?: string): string {
    return ImageUploadHelper.getPublicUrl(photoPath, baseUrl);
  }
}
