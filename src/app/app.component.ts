import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { SubmissionService } from './services/submission.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'aop-ui-ssr';


  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private submisssionService: SubmissionService
  ) {}
  
   
  

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.attemptAutoLogin();
      this.submisssionService.resolveSubmissions();
    }
    
  }
}
