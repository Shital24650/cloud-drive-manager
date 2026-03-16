import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { UploadComponent } from '../../components/upload/upload.component';
import { FileListComponent } from '../../components/file-list/file-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    UploadComponent,
    FileListComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <div class="content-wrapper">
        <app-upload></app-upload>
        <app-file-list></app-file-list>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    @media (max-width: 600px) {
      .content-wrapper {
        padding: 15px;
      }
    }
  `]
})
export class DashboardComponent {}