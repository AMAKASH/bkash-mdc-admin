import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ImageModule } from 'primeng/image';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { SubmissionService } from '../../services/submission.service';
import { Submission } from '../../core/models/submission.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DomSanitizer } from '@angular/platform-browser';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TabViewModule,
    ImageModule,
    PaginatorModule,
    BadgeModule,
    ToastModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  totalRecords: number = 125;
  first: number = 0;
  rows: number = 50;

  shown_submissions: Submission[] = [];

  selectedList: Submission[] = [];

  activeIndex = 0;

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;

    this.shown_submissions = this.selectedList.slice(
      this.first,
      this.first + this.rows
    );
  }

  get pending() {
    return this.submissionService.pending_submissions.getValue();
  }

  get approved() {
    return this.submissionService.approved_submissions.getValue();
  }

  get shortlisted() {
    return this.submissionService.shortlisted_submissions.getValue();
  }

  constructor(private submissionService: SubmissionService,private messageService:MessageService) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.submissionService.pending_submissions.subscribe((submissions) => {
      this.OnTabChange();
    });
  }

  OnTabChange() {
    switch (this.activeIndex) {
      case 0:
        this.selectedList = this.pending;
        break;
      case 1:
        this.selectedList = this.approved;
        break;
      case 2:
        this.selectedList = this.shortlisted;
        break;
    }

    this.totalRecords = this.selectedList.length;
    this.rows = Math.min(this.selectedList.length, 50);
    this.shown_submissions = this.selectedList.slice(0, this.rows);
  }

  setStatus(event:Event,submission: Submission, status: string) {
   
    
      this.submissionService
        .setStatus(submission, { status })
        .subscribe({ next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Submission Updated',
            detail: `Submission status set to: ${status}`,
          });
          this.OnTabChange();
        }, error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Submission Status Changed Failed',
            detail: err.error.msg,
          });
        } });
    
  }
}
