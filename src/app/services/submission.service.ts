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
              shotlisted_submissions.push(submission);
              break;
          }
        }
        this.approved_submissions.next(approved_submissions);
        this.shortlisted_submissions.next(shotlisted_submissions);
      },
    });
  }

  setStatus(submission: Submission, payload: any) {
    let old_list: Submission[] = [];
    let old_subject: BehaviorSubject<Submission[]> = new BehaviorSubject<
      Submission[]
    >([]);
    let new_subject: BehaviorSubject<Submission[]> = new BehaviorSubject<
      Submission[]
    >([]);

    if (submission.status == 'Approved') {
      old_subject = this.approved_submissions;
    } else if (submission.status == 'Shortlisted') {
      old_subject = this.shortlisted_submissions;
    }

    old_list = old_subject.getValue();

    let old_idx = old_list.indexOf(submission);

    return this.http
      .put(`${this.submissionBaseURL}/${submission._id}`, payload)
      .pipe(
        tap((submission: any) => {
          old_list.splice(old_idx, 1);
          old_subject.next(old_list);

          if (submission.status == 'Approved') {
            new_subject = this.approved_submissions;
          } else if (submission.status == 'Shortlisted') {
            new_subject = this.shortlisted_submissions;
          }

          new_subject.getValue().unshift(submission);
          new_subject.next(new_subject.value);
        })
      );
  }
}
