import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtpModule } from 'primeng/inputotp';
import { MessagesModule } from 'primeng/messages';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    InputOtpModule,
    MessagesModule,
  ],
  providers: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private messageService: MessageService, private authService: AuthService,private router:Router) {}

  LoginButtonAction() {
    if (!this.email || !this.password){
      this.showHideErrorMsg('Invalid Email or Password');
      return;
    }
     
    this.authService.login(this.email.trim(),this.password.trim()).subscribe({next:()=>{
      this.handleAuthenticatedRedirect();
    },
  error:(errResponse)=>{
    this.showHideErrorMsg('Invalid Email or password')
  }})
  }

  errorMsgShown = false;

  showHideErrorMsg(msg: string, summery?: string) {
    this.messageService.add({
      severity: 'error',
      detail: msg,
      summary: summery,
      key: 'error',
      closable: false,
    });
    this.errorMsgShown = true;
    setTimeout(() => {
      this.errorMsgShown = false;
      this.messageService.clear();
    }, 3000);
  }

  showHideInfoMsg(msg: string, summery?: string) {
    this.messageService.add({
      severity: 'info',
      detail: msg,
      summary: summery,
      key: 'info',
      closable: false,
    });
    this.errorMsgShown = true;
    setTimeout(() => {
      this.errorMsgShown = false;
      this.messageService.clear('info');
    }, 3000);
  }

  handleAuthenticatedRedirect() {
    if(this.authService.overrideRedirectRoute){
      this.router.navigate(this.authService.overrideRedirectRoute.split("/"));
      this.authService.overrideRedirectRoute = null;
      this.authService.redirectedRoute = null;
      return
    }
    if (this.authService.redirectedRoute) {
      const url = this.authService.redirectedRoute.url;
      this.router.navigate(['/', ...url.map((segment) => segment.path)], {
        queryParams: this.authService.redirectedRoute.queryParams,
      });
      this.authService.redirectedRoute = null;
    } else {
      this.router.navigate(['/']);
    }
  }
}
