import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Admin } from '../models/admin.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit{

  constructor(private authService:AuthService,private router:Router){}

  admin:Admin|null = null

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.authService.user.subscribe((user)=>{
      this.admin = user;
    })
  }

  logoutAction(){
    this.authService.logout();
    this.router.navigate(['/','login']);
  }


}
