import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <mat-icon class="logo">cloud</mat-icon>
          <h1>Cloud Drive</h1>
          <p class="subtitle">Your Personal Cloud Storage</p>
        </div>

        <div class="description">
          <p>Securely store and share your files with Google Drive-like experience</p>
        </div>

        <button 
          mat-raised-button 
          color="accent"
          (click)="signInWithGoogle()"
          [disabled]="isLoading"
          class="google-signin-btn"
        >
          <mat-icon *ngIf="!isLoading">lock</mat-icon>
          <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          {{ isLoading ? 'Signing in...' : 'Sign in with Google' }}
        </button>

        <div class="features">
          <h3>Features</h3>
          <ul>
            <li>✓ Google Login Authentication</li>
            <li>✓ Secure Cloud Storage</li>
            <li>✓ Drag & Drop Upload</li>
            <li>✓ File Management</li>
            <li>✓ Mobile Responsive</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .logo-section {
      margin-bottom: 30px;
    }

    .logo {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin: 0 auto 15px;
    }

    h1 {
      font-size: 32px;
      margin: 0;
      color: #333;
      font-weight: 600;
    }

    .subtitle {
      color: #999;
      margin: 5px 0 0 0;
      font-size: 14px;
    }

    .description {
      margin-bottom: 30px;
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }

    .google-signin-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .features {
      text-align: left;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .features h3 {
      font-size: 14px;
      color: #333;
      margin: 0 0 15px 0;
      font-weight: 600;
    }

    .features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .features li {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    @media (max-width: 600px) {
      .login-card {
        padding: 30px 20px;
      }

      h1 {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading = false;

  signInWithGoogle(): void {
    this.isLoading = true;
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Login successful');
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
      }
    });
  }
}