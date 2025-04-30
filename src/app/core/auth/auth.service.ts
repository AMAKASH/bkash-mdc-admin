import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Admin } from '../models/admin.model';


interface AuthResponse {
  admin: {
    name: string;
    email: string;
  };
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenExpirationTimer: any;
  private authorizationBaseURL = '';
  user = new BehaviorSubject<Admin | null>(null);
  redirectedRoute: ActivatedRouteSnapshot | null = null;
  overrideRedirectRoute: string | null  = null;

  constructor(private http: HttpClient, private router: Router) {
    if (environment.useProdAPI) {
      this.authorizationBaseURL = environment.prodApiURL;
    } else {
      this.authorizationBaseURL = environment.apiURL;
    }

    this.authorizationBaseURL += '/auth';
  }


  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.authorizationBaseURL}/admin`, {
        email,
        password,
      })
      .pipe(
        tap((responseData) => {
          this.handleAuthentication(responseData);
        })
      );
  }

  attemptAutoLogin() {
    const userData = JSON.parse(localStorage.getItem('adminData') ?? '[]');
    if (!userData) {
      return;
    }

    const loadedUser = new Admin(
      userData.name,
      userData.email,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  private autoLogout(expirationDuration: number) {
    if (expirationDuration > 24 * 60 * 60 * 1000) {
      return;
    }
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(responseData: AuthResponse) {
    const expirationDuration = 30 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + expirationDuration);

    const userData = responseData.admin;

    const user = new Admin(
      userData.name,
      userData.email,
      responseData.token,
      expirationDate
    );

    this.user.next(user);
    this.autoLogout(expirationDuration);
    localStorage.setItem('adminData', JSON.stringify(user));
  }


}
