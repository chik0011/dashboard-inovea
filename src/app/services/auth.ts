import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { timeout, firstValueFrom  } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  public currentUser = signal<User | null>(null);

  constructor() {}

  async getUser(): Promise<User | null>  {
    if (this.currentUser())
      return this.currentUser();

    await this.init();

    return this.currentUser();
  }

  // Appelé par APP_INITIALIZER — peut être async
  async init(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await this.loadUserByToken(token);
    }
  }

  async login(login: string, password: string): Promise<void> {
    const params = new HttpParams().set('login', login).set('password', password);

    const response = await firstValueFrom(
      this.http.get<any>(`${environment.apiDolibarrUrl}/login`, { params }).pipe(timeout(5000))
    );

    const token = response.success.token;
    localStorage.setItem('token-dolibarr', token);

    await this.loadUserByToken(token);
  }

  async loadUserByToken(token: string): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${environment.apiDolibarrUrl}/dashboardapiapi/userByToken`, {
          params: { DOLAPIKEY: token },
        })
      );

      this.currentUser.set(user);
    } catch {
      this.logout();
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token-dolibarr');
  }

  logout(): void {
    localStorage.removeItem('token-dolibarr');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token-dolibarr');
  }
}
