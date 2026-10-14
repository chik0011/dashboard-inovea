import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { timeout, firstValueFrom  } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly token: string | null

  constructor() {
    this.token = this.authService.getToken();
  }

  async getAllUser(): Promise<User[]> {
    return await firstValueFrom(
      this.http.get<User[]>(`${environment.apiDolibarrUrl}/dashboardapiapi/getUsers`, {
        params: { DOLAPIKEY: this.token! },
      }).pipe(timeout(5000))
    );
  }
  
}
