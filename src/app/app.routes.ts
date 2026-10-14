import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Analytic } from './features/analytic/analytic';
import { Todo } from './features/todo/todo';
import { Timesheets } from './features/timesheets/timesheets';
import { Tickets } from './features/tickets/tickets';
import { Settings } from './features/settings/settings';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },

  {
    path: '',
    canMatch: [authGuard],
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'analytic', component: Analytic },
      { path: 'todo', component: Todo },
      { path: 'timesheets', component: Timesheets },
      { path: 'tickets', component: Tickets },
      { path: 'settings', component: Settings }
    ]
  }
];