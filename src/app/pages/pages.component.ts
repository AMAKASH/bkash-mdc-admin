import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../core/header/header.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule,RouterModule,HeaderComponent,ToastModule],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {

}
