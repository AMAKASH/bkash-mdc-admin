import { safeJsonParse } from './../../../node_modules/typed-assert/src/index';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
import { Submission } from '../core/models/submission.model';

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly submissionBaseURL = '';
  approved_submissions = new BehaviorSubject<Submission[]>([]);
  shortlisted_submissions = new BehaviorSubject<Submission[]>([]);

  constructor(private readonly http: HttpClient) {
    if (environment.useProdAPI) {
      this.submissionBaseURL = environment.prodApiURL;
    } else {
      this.submissionBaseURL = environment.apiURL;
    }

    this.submissionBaseURL += '/submission';
  }

  resolveSubmissions() {
    this.http.get(`${this.submissionBaseURL}/fetch-as-admin`).subscribe({
      next: (response: any) => {
        const submissions = response.submissions as Submission[];
        const approved_submissions = [];
        const shotlisted_submissions = [];
        for (let submission of submissions) {
          switch (submission.status) {
            case 'Approved':
              approved_submissions.push(submission);
              break;
            case 'Shortlisted':
              approved_submissions.push(submission);
              shotlisted_submissions.push(submission);
              break;
            default:
              approved_submissions.push(submission);
              break;
          }
        }
        this.approved_submissions.next(approved_submissions);
        this.shortlisted_submissions.next(shotlisted_submissions);
      },
    });
  }

  setStatus(submission: Submission, payload: any) {
    const approved_old_list = this.approved_submissions.getValue();
    const approved_old_idx = approved_old_list.findIndex(
      (s) => s._id == submission._id
    );

    const shortlisted_old_list = this.shortlisted_submissions.getValue();
    const shortlisted_old_idx = shortlisted_old_list.findIndex(
      (s) => s._id == submission._id
    );

    console.log(approved_old_idx, shortlisted_old_idx);

    return this.http
      .put(`${this.submissionBaseURL}/${submission._id}`, payload)
      .pipe(
        tap((submission: any) => {
          approved_old_list[approved_old_idx].status = submission.status;
          if (submission.status == 'Approved') {
            shortlisted_old_list.splice(shortlisted_old_idx, 1);
          } else if (submission.status == 'Shortlisted') {
            shortlisted_old_list.unshift(submission);
          }

          this.approved_submissions.next(approved_old_list);
          this.shortlisted_submissions.next(shortlisted_old_list);
        })
      );
  }

  downloadShortListedImages() {
    return this.http.get(
      `${this.submissionBaseURL}/download-shortlisted-images`,
      {
        responseType: 'blob',
      }
    );
  }
}
