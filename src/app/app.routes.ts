import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pages.component').then((c) => c.PagesComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((c) => c.LoginComponent),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
