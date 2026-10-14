import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { signal } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  imports: [FormsModule],
  styleUrl: './login.scss'
})
export class Login {

  login = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');
  email = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.login(this.login(), this.password());
      this.router.navigate(['/dashboard']);

    } catch (error) {
      if (error instanceof TimeoutError) {
        this.error.set('Le serveur ne répond pas.');
        return;
      }

      const httpError = error as HttpErrorResponse;
      switch (httpError.status) {
        case 0:
          this.error.set('Impossible de contacter le serveur.');
          break;
        case 500:
          this.error.set('Erreur interne du serveur.');
          break;
        default:
          this.error.set('Identifiants incorrects.');
      }

    } finally {
      this.loading.set(false);
    }
  }
}