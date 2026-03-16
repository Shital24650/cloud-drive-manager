import { Component, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="upload-section">
      <div 
        class="drag-drop-area"
        [class.dragover]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <h3>Upload Files</h3>
        <p>Drag and drop your files here</p>
        <p class="or-text">or</p>
        <button 
          mat-stroked-button 
          color="primary"
          (click)="fileInput.click()"
        >
          <mat-icon>folder_open</mat-icon>
          Browse Files
        </button>
        <input 
          #fileInput 
          type="file" 
          multiple
          (change)="onFileSelected($event)"
          style="display: none;"
        />
        <p class="file-info">Supported all file types • Max 100MB per file</p>
      </div>

      <mat-progress-bar 
        *ngIf="uploadProgress > 0 && uploadProgress < 100"
        mode="determinate" 
        [value]="uploadProgress"
      ></mat-progress-bar>

      <div *ngIf="uploadProgress === 100" class="success-message">
        <mat-icon>check_circle</mat-icon>
        <span>File uploaded successfully!</span>
      </div>
    </div>
  `,
  styles: [`
    .upload-section {
      margin-bottom: 30px;
    }

    .drag-drop-area {
      border: 2px dashed #667eea;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      background: #f8f9ff;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .drag-drop-area:hover {
      border-color: #764ba2;
      background: #f0f0ff;
    }

    .drag-drop-area.dragover {
      border-color: #764ba2;
      background: #e8e8ff;
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin: 0 auto 15px;
    }

    h3 {
      margin: 15px 0 5px 0;
      color: #333;
      font-size: 20px;
    }

    p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }

    .or-text {
      font-weight: 600;
      margin: 15px 0;
    }

    button {
      margin-top: 15px;
    }

    .file-info {
      font-size: 12px;
      color: #999;
      margin-top: 15px;
    }

    mat-progress-bar {
      margin-bottom: 10px;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-size: 14px;
    }

    .success-message mat-icon {
      color: #4caf50;
    }

    @media (max-width: 600px) {
      .drag-drop-area {
        padding: 20px;
      }

      h3 {
        font-size: 16px;
      }
    }
  `]
})
export class UploadComponent {
  private storageService = inject(StorageService);
  private snackBar = inject(MatSnackBar);
  
  @ViewChild('fileInput') fileInput!: ElementRef;

  isDragging = false;
  uploadProgress = 0;

  constructor() {
    this.storageService.uploadProgress$.subscribe(progress => {
      this.uploadProgress = progress;
      if (progress === 100) {
        setTimeout(() => {
          this.uploadProgress = 0;
        }, 2000);
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.uploadFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      this.uploadFiles(files);
    }
  }

  private uploadFiles(files: FileList): void {

  Array.from(files).forEach(file => {

    this.storageService.uploadFile(file).subscribe({

      next: () => {

        // reload files so UI updates
        this.storageService.loadFiles().subscribe();

        this.snackBar.open(`${file.name} uploaded successfully!`, 'Close', {
          duration: 3000
        });

      },

      error: (error) => {

        console.error('Upload error:', error);

        this.snackBar.open(`Failed to upload ${file.name}`, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });

      }

    });

  });

}
}