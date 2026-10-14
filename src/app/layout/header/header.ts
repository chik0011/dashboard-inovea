import { AvatarModule } from 'primeng/avatar';
import { Component, computed } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [AvatarModule, MenuModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class HeaderComponent {
  items: any;
  lastname = computed(() => this.authService.currentUser()?.lastname ?? '');
  firstname = computed(() => this.authService.currentUser()?.firstname ?? '');
  job = computed(() => this.authService.currentUser()?.job ?? '');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Profil',
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/profile']);
        }
      },
      {
        label: 'Déconnexion',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
