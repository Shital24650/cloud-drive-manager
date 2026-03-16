import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-brand">
        <mat-icon class="logo-icon">cloud</mat-icon>
        <span class="logo-text">Cloud Drive</span>
      </div>

      <div class="navbar-spacer"></div>

      <button 
        mat-icon-button 
        [matMenuTriggerFor]="menu"
        matTooltip="Account"
      >
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #menu="matMenu">
        <div class="user-info" *ngIf="currentUser$ | async as user">
          <div class="user-email">{{ user?.email }}</div>
          <mat-divider></mat-divider>
        </div>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 600;
      cursor: pointer;
    }

    .logo-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .logo-text {
      display: none;
    }

    .navbar-spacer {
      flex: 1 1 auto;
    }

    .user-info {
      padding: 8px 16px;
    }

    .user-email {
      font-size: 14px;
      color: #666;
      word-break: break-all;
    }

    @media (min-width: 600px) {
      .logo-text {
        display: inline;
      }
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.getCurrentUserObservable();

  logout(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/']);
      }
    });
  }
}