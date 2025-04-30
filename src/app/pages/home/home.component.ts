import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';

import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { SubmissionService } from '../../services/submission.service';
import { Submission } from '../../core/models/submission.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { environment } from '../../../environments/environment.development';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    PaginatorModule,
    BadgeModule,
    ToastModule,
    TableModule,
    LazyLoadImageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  staticAssetLink = environment.staticURL;
  selectedImage: string | null = null;

  totalRecords: number = 125;
  first: number = 0;
  rows: number = 50;

  shown_submissions: Submission[] = [];

  selectedList: Submission[] = [];

  activeIndex = 0;

  loading = false;

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly messageService: MessageService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.submissionService.resolveSubmissions();

    this.submissionService.approved_submissions.subscribe((submissions) => {
      this.OnTabChange();
    });
  }

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;

    this.shown_submissions = this.selectedList.slice(
      this.first,
      this.first + this.rows
    );
  }

  get approved() {
    return this.submissionService.approved_submissions.getValue();
  }

  get shortlisted() {
    return this.submissionService.shortlisted_submissions.getValue();
  }

  getSanitizedUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(this.staticAssetLink + url);
  }

  download(submission: Submission) {
    const serverLink = this.staticAssetLink + submission.image_url;
    fetch(serverLink)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${submission.slug}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error('Download failed:', error));
  }

  OnTabChange() {
    switch (this.activeIndex) {
      case 0:
        this.selectedList = this.approved;
        break;
      case 1:
        this.selectedList = this.shortlisted;
        break;
    }

    this.totalRecords = this.selectedList.length;
    this.rows = Math.min(this.selectedList.length, 50);
    this.shown_submissions = this.selectedList.slice(0, this.rows);
  }

  setStatus(event: Event, submission: Submission, status?: string) {
    if (!status && submission.status === 'Approved') {
      status = 'Shortlisted';
    } else if (!status && submission.status === 'Shortlisted') {
      status = 'Approved';
    }

    this.submissionService.setStatus(submission, { status }).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Submission Updated',
          detail: `Submission status changed`,
        });
        this.OnTabChange();
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Status Changed Failed',
          detail: err.error.msg,
        });
      },
    });
  }

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

  generateExportableSubmissions() {
    const exportable_schemes: any[] = [];

    const list = this.activeIndex == 0 ? this.approved : this.shortlisted;

    list.forEach((submission) => {
      exportable_schemes.push({
        Name: submission.name,
        'bKash Wallet Number': submission.bkash_wallet_number,
        'Image Link': this.staticAssetLink + submission.image_url,
      });
    });

    return exportable_schemes;
  }

  downloadDataAction() {
    const data = this.generateExportableSubmissions();
    this.exportSubmissions(data);
  }

  exportSubmissions(jsonData: any) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

    const columnWidths = this.calculateColumnWidths(jsonData);
    worksheet['!cols'] = columnWidths;

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    saveAs(
      blob,
      `MWM_${
        this.activeIndex == 0 ? 'submissions' : 'shortlisted_Submissions'
      }_till_${new Date().toDateString()}.xlsx`
    );
  }

  private calculateColumnWidths(jsonData: any[]): { wch: number }[] {
    const widths: number[] = [];

    jsonData.forEach((row) => {
      Object.keys(row).forEach((key, index) => {
        const value =
          row[key] !== null && row[key] !== undefined
            ? row[key].toString()
            : '';
        widths[index] = Math.max(widths[index] || key.length, value.length);
      });
    });

    return widths.map((width) => ({ wch: width + 2 }));
  }

  downloadImagesAction() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    this.submissionService.downloadShortListedImages().subscribe({
      next: (blob) => {
        this.loading = false;
        saveAs(blob, `MWM_images_till_${new Date().toDateString()}.zip`);
      },
      error: (err) => {
        console.error('Download failed:', err);
        // Optionally show a user-friendly message
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to download images. Please try again later.',
          detail: err.error.msg,
        });
      },
    });
  }
}
