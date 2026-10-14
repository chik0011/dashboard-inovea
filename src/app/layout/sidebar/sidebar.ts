import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive  } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true
})
export class SidebarComponent {
  links = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Analytic', path: '/analytic', icon: 'analytic' },
    { label: 'Timesheets', path: '/timesheets', icon: 'timesheets' },
    { label: 'Todo', path: '/todo', icon: 'todo' },
    { label: 'Tickets', path: '/tickets', icon: 'tickets' },
    { label: 'Settings', path: '/settings', icon: 'settings' }
  ]
}
