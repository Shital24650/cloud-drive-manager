import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { StorageService, FileItem } from '../../services/storage.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatGridListModule,
    MatCardModule
  ],
  template: `
    <div class="file-list-container">
      <div class="header"><div class="header-left">
  <mat-icon>folder</mat-icon>
  <h2>Your Files ({{files.length}})</h2>
</div>
        <button 
          mat-icon-button 
          (click)="refreshFiles()"
          [disabled]="isLoading"
          matTooltip="Refresh"
        >
          <mat-icon>refresh</mat-icon>
        </button>
      </div>


<div style="margin-bottom:15px;">
 <input
type="text"
placeholder="Search files..."
class="search-input"
(keyup)="filterFiles($event)"
>
</div>

<div style="margin-bottom:15px; display:flex; gap:10px;">


</div>
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading your files...</p>
      </div>

      <div *ngIf="!isLoading && files.length === 0" class="empty-state">
        <mat-icon class="empty-icon">folder_open</mat-icon>
        <h3>No files uploaded yet</h3>
        <p>Start by uploading your first file using the upload area above</p>
      </div>

      <!-- Table View for Desktop -->
      <div *ngIf="!isLoading && files.length > 0 && !isMobile" class="table-view">
        <table mat-table [dataSource]="files" class="files-table">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>File Name</th>
            <td mat-cell *matCellDef="let element">
              <div class="file-name-cell">
<div class="preview-overlay" *ngIf="previewUrl">

  <div class="preview-box">

    <button mat-icon-button class="close-btn" (click)="previewUrl=null">
      <mat-icon>close</mat-icon>
    </button>

    <img *ngIf="previewType==='image'" [src]="previewUrl"/>

    <iframe *ngIf="previewType==='pdf'" [src]="previewUrl"></iframe>

  </div>

</div>

  <img 
    *ngIf="isImage(element.name)" 
    [src]="element.url"
    class="thumb"
  />

  <mat-icon *ngIf="!isImage(element.name)">
    {{ getFileIcon(element.name) }}
  </mat-icon>

  <span>{{ element.name }}</span>

</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="size">
            <th mat-header-cell *matHeaderCellDef>Size</th>
            <td mat-cell *matCellDef="let element">
              {{ formatFileSize(element.size) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Upload Date</th>
            <td mat-cell *matCellDef="let element">
              {{ formatDate(element.created_at) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let element">

              <button 
                mat-icon-button 
                (click)="previewFile(element)"
                matTooltip="Preview"
              >
                <mat-icon>visibility</mat-icon>
              </button>

              <button 
                mat-icon-button 
                (click)="downloadFile(element)"
                matTooltip="Download"
                color="primary"
              >
                <mat-icon>download</mat-icon>
              </button>

              <button 
                mat-icon-button 
                (click)="deleteFile(element.id)"
                matTooltip="Delete"
                color="warn"
              >
                <mat-icon>delete</mat-icon>

              </button>
<button 
  mat-icon-button
  (click)="shareFile(element)"
  matTooltip="Share"
>
  <mat-icon>share</mat-icon>
</button>
<button 
  mat-icon-button 
  (click)="renameFile(element)"
  matTooltip="Rename"
>
  <mat-icon>edit</mat-icon>
</button>



            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <mat-grid-list *ngIf="!isLoading && files.length > 0 && isMobile"
        cols="1" 
        rowHeight="200px"
        class="grid-view"
      >
        <mat-grid-tile *ngFor="let file of files">
          <mat-card class="file-card">
            <mat-card-header>
              <img 
  *ngIf="isImage(file.name)"
  [src]="file.url"
  class="grid-thumb"
/>

<mat-icon *ngIf="!isImage(file.name)" class="file-icon">
  {{ getFileIcon(file.name) }}
</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <p class="file-name">{{ file.name }}</p>
              <p class="file-meta">{{ formatFileSize(file.size) }}</p>
              <p class="file-meta">{{ formatDate(file.created_at) }}</p>
            </mat-card-content>
            <mat-card-footer>

              <button 
                mat-icon-button 
                (click)="previewFile(file)"
              >
                <mat-icon>visibility</mat-icon>
              </button>

              <button 
                mat-icon-button 
                (click)="downloadFile(file)"
                color="primary"
              >
                <mat-icon>download</mat-icon>
              </button>

              <button 
                mat-icon-button 
                (click)="deleteFile(file.id)"
                color="warn"
              >
                <mat-icon>delete</mat-icon>
              </button>

            </mat-card-footer>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`

.thumb{
width:36px;
height:36px;
min-width:36px;
object-fit:cover;
border-radius:4px;
}
.grid-thumb{
width:100%;
height:120px;
object-fit:cover;
border-radius:8px;
margin-bottom:10px;
}
.files-table tr{
height:60px;
}
.files-table{
width:100%;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 4px 14px rgba(0,0,0,0.06);
}

.files-table th{
background:#f1f5f9;
font-weight:600;
color:#334155;
}

.files-table td{
border-bottom:1px solid #f1f5f9;
}

.files-table tr:hover{
background:#f8fafc;
}
.file-name-cell{
display:flex;
align-items:center;
gap:10px;
max-width:250px;
overflow:hidden;
}
.file-name-cell span{
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
}
.preview-overlay{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.7);
display:flex;
justify-content:center;
align-items:center;
z-index:1000;
}

.preview-box{
background:white;
padding:20px;
border-radius:10px;
max-width:90%;
max-height:90%;
position:relative;
}

.preview-box img{
max-width:100%;
max-height:80vh;
}

.preview-box iframe{
width:80vw;
height:80vh;
border:none;
}

.close-btn{
position:absolute;
top:10px;
right:10px;
}
.header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
}

.header-left{
display:flex;
align-items:center;
gap:10px;
}

.header h2{
font-weight:600;
color:#334155;
}
.search-input{
padding:10px 14px;
width:260px;
border-radius:8px;
border:1px solid #e2e8f0;
outline:none;
transition:0.2s;
}

.search-input:focus{
border-color:#2563eb;
box-shadow:0 0 0 3px rgba(37,99,235,0.15);
}
`]
})
export class FileListComponent implements OnInit {

  private storageService = inject(StorageService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  files: FileItem[] = [];
  allFiles: FileItem[] = [];
  isLoading = true;
previewUrl: string | null = null;
previewType: string | null = null;
isMobile: boolean = window.innerWidth < 768;
  displayedColumns: string[] = ['name', 'size', 'date', 'actions'];

  ngOnInit(): void {

    this.storageService.files$.subscribe(files => {

      this.allFiles = [...files];
      this.files = [...files];

      this.isLoading = false;

      this.cdr.detectChanges();

    });

    this.storageService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.storageService.loadFiles().subscribe();

  }


  loadFiles(): void {
    this.isLoading = true;
    this.storageService.loadFiles().subscribe({
      next: (files) => {
        this.files = files;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading files', 'Close', { duration: 3000 });
      }
    });
  }

  filterFiles(event: Event): void {

    const value = (event.target as HTMLInputElement).value.toLowerCase();

    if (!value) {
      this.files = [...this.allFiles];
      return;
    }

    this.files = this.allFiles.filter(file =>
      file.name.toLowerCase().includes(value)
    );

  }

  refreshFiles(): void {

    this.isLoading = true;

    this.storageService.loadFiles().subscribe({
      next: (files) => {

        this.allFiles = [...files];
        this.files = [...files];

        this.isLoading = false;

        this.snackBar.open('Files refreshed', 'Close', { duration: 2000 });

      },
      error: () => {

        this.isLoading = false;

        this.snackBar.open('Error refreshing files', 'Close', { duration: 3000 });

      }
    });

  }

  downloadFile(file: FileItem): void {
    this.storageService.downloadFile(file.id, file.name);
    this.snackBar.open(`Downloading ${file.name}...`, 'Close', { duration: 2000 });
  }

  deleteFile(fileId: string): void {

    if (confirm('Are you sure you want to delete this file?')) {

      this.storageService.deleteFile(fileId).subscribe({
        next: () => {
          this.snackBar.open('File deleted successfully', 'Close', { duration: 2000 });
          this.loadFiles();
        },
        error: () => {
          this.snackBar.open('Error deleting file', 'Close', { duration: 3000 });
        }
      });

    }

  }

  previewFile(file: FileItem): void {

  const ext = file.name.split('.').pop()?.toLowerCase();

  if (!ext) return;

  if (['png','jpg','jpeg','gif','webp'].includes(ext)) {

    this.previewType = 'image';
    this.previewUrl = file.url;

  }

  else if (ext === 'pdf') {

    this.previewType = 'pdf';
    this.previewUrl = file.url;

  }

  else {

    this.snackBar.open(
      'Preview not available for this file type',
      'Close',
      { duration: 2000 }
    );

  }

}

  getFileIcon(name: string): string {

    const ext = name.split('.').pop()?.toLowerCase();

    if (!ext) return 'insert_drive_file';

    if (['png','jpg','jpeg','gif','webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'picture_as_pdf';
    if (['zip','rar','7z'].includes(ext)) return 'archive';
    if (['doc','docx'].includes(ext)) return 'description';
    if (['xls','xlsx'].includes(ext)) return 'table_chart';
    if (['mp4','mov','avi'].includes(ext)) return 'movie';
    if (['mp3','wav'].includes(ext)) return 'audiotrack';

    return 'insert_drive_file';

  }
renameFile(file: FileItem){

const newName = prompt("Enter new file name", file.name);

if(!newName || newName === file.name) return;

this.storageService.renameFile(file.id,newName).subscribe({
next:()=>{

file.name = newName;

this.snackBar.open(
"File renamed successfully",
"Close",
{duration:2000}
);

},
error:()=>{
this.snackBar.open(
"Rename failed",
"Close",
{duration:2000}
);
}
});

}isImage(name: string): boolean {

  const ext = name.split('.').pop()?.toLowerCase();

  return ['png','jpg','jpeg','gif','webp'].includes(ext || '');

}
shareFile(file: FileItem){

const shareId = crypto.randomUUID();

const shareLink =
window.location.origin + "/share/" + shareId;

navigator.clipboard.writeText(shareLink);

this.snackBar.open(
"Share link copied to clipboard",
"Close",
{duration:3000}
);

}
  formatFileSize(bytes: number): string {

    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];

  }

  formatDate(date: string): string {

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  }

}