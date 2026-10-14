import { Component, computed } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard{

  lastname = computed(() => this.authService.currentUser()?.lastname ?? '');
  firstname = computed(() => this.authService.currentUser()?.firstname ?? '');

  constructor( private authService: AuthService, ) {}

}
