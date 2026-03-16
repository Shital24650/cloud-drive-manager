import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';


export interface FileItem {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  url: string;
folder?: string;
  type?: 'file' | 'folder';
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private supabase = supabase;

  private readonly BUCKET_NAME = 'drive-files';

  private filesSubject = new BehaviorSubject<FileItem[]>([]);
  public files$ = this.filesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private uploadProgressSubject = new BehaviorSubject<number>(0);
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor() {
    this.initializeBucket();
  }

  /**
   * Create bucket if not exists
   */
  private async initializeBucket(): Promise<void> {
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets();

      const exists = buckets?.some(b => b.name === this.BUCKET_NAME);

      if (!exists) {
        await this.supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true
        });
      }

    } catch (error) {
      console.error('Bucket init error:', error);
    }
  }

  /**
   * Get current user id
   */
  private async getUserId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    return user.id;
  }

  /**
   * Upload file observable
   */
  uploadFile(file: File): Observable<FileItem> {
    return from(this.uploadFileAsync(file));
  }

  /**
   * Upload file logic
   */
  private async uploadFileAsync(file: File): Promise<FileItem> {

    this.loadingSubject.next(true);
    this.uploadProgressSubject.next(0);

    try {

      const userId = await this.getUserId();

      const fileKey = `${userId}/${Date.now()}-${file.name}`;

      const { error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileKey, file, { upsert: true });

      if (error) throw error;

      this.uploadProgressSubject.next(100);

      const { data } = this.supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileKey);

      const fileItem: FileItem = {
        id: fileKey,
        name: file.name,
        size: file.size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: data.publicUrl
      };

      await this.loadFilesAsync();

      this.loadingSubject.next(false);

      return fileItem;

    } catch (error) {

      console.error('Upload error:', error);

      this.loadingSubject.next(false);

      throw error;
    }
  }

  /**
   * Load files observable
   */
  loadFiles(): Observable<FileItem[]> {
    return from(this.loadFilesAsync());
  }

  /**
   * Load files logic
   */
  private async loadFilesAsync(): Promise<FileItem[]> {

    this.loadingSubject.next(true);

    try {

      const userId = await this.getUserId();

      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'updated_at', order: 'desc' }
        });

      if (error) throw error;

      const files: FileItem[] = (data || []).map(file => {

        const { data: urlData } = this.supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${userId}/${file.name}`);

        return {
          id: `${userId}/${file.name}`,
          name: file.name.split('-').slice(1).join('-'),
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString(),
          updated_at: file.updated_at || new Date().toISOString(),
          url: urlData.publicUrl
        };

      });

      this.filesSubject.next(files);

      this.loadingSubject.next(false);

      return files;

    }catch (error) {

  console.error('Load files error:', error);

  this.loadingSubject.next(false);

  this.filesSubject.next([]);

  return [];
}}
  /**
   * Delete file
   */
  deleteFile(fileId: string): Observable<void> {
    return from(this.deleteFileAsync(fileId));
  }

  private async deleteFileAsync(fileId: string): Promise<void> {

    this.loadingSubject.next(true);

    try {

      const { error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileId]);

      if (error) throw error;

      await this.loadFilesAsync();

      this.loadingSubject.next(false);

    } catch (error) {

      console.error('Delete error:', error);

      this.loadingSubject.next(false);

      throw error;
    }
  }

  /**
   * Download file
   */
  downloadFile(fileId: string, fileName: string): void {

  const { data } = this.supabase.storage
    .from(this.BUCKET_NAME)
    .getPublicUrl(fileId);

  fetch(data.publicUrl)
    .then(res => res.blob())
    .then(blob => {

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    });
}
renameFile(fileId: string, newName: string): Observable<void> {
  return from(this.renameFileAsync(fileId, newName));
}

private async renameFileAsync(fileId: string, newName: string): Promise<void> {

  const userId = await this.getUserId();

  const oldPath = fileId;
  const newPath = `${userId}/${Date.now()}-${newName}`;

  const { error: copyError } = await this.supabase.storage
    .from(this.BUCKET_NAME)
    .copy(oldPath, newPath);

  if (copyError) throw copyError;

  const { error: deleteError } = await this.supabase.storage
    .from(this.BUCKET_NAME)
    .remove([oldPath]);

  if (deleteError) throw deleteError;

  await this.loadFilesAsync();
}

  /**
   * Files observable
   */
  getFiles(): Observable<FileItem[]> {
    return this.filesSubject.asObservable();
  }

}