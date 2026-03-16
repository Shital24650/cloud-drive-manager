import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = supabase;
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state on app load
   */
  private initializeAuth(): void {
    console.log('Starting auth initialization...');
    
    try {
      // Non-blocking check
      this.supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Session retrieved:', !!session);
        if (session?.user) {
  this.currentUserSubject.next(session.user);
  this.isAuthenticatedSubject.next(true);

  // ⭐ ADD THIS LINE
  this.router.navigate(['/dashboard']);
}
      }).catch(error => {
        console.error('Session check error:', error);
      });

      // Listen for auth changes
      const unsubscribe = this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
       if (session?.user) {
  this.currentUserSubject.next(session.user);
  this.isAuthenticatedSubject.next(true);

  // redirect after login
  this.router.navigate(['/dashboard']);

} else {
  this.currentUserSubject.next(null);
  this.isAuthenticatedSubject.next(false);
}
      });
    } catch (error) {
      console.error('Auth init error:', error);
    }
  }

  /**
   * Sign in with Google
   */
  signInWithGoogle(): Observable<any> {
    console.log('Sign in with Google called');
    
    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
    ).pipe(
      tap(response => {
        console.log('Sign in response:', response);
      }),
      catchError(error => {
        console.error('Sign in error:', error);
        throw error;
      })
    );
  }

  /**
   * Sign out user
   */
  signOut(): Observable<any> {
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        console.log('Signed out');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Sign out error:', error);
        this.router.navigate(['/']);
        return of(null);
      })
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get current user as observable
   */
  getCurrentUserObservable(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }
}