export interface Submission {
    _id: string;
    title: string;
    description: string;
    content: string[];
    participant:any;
    participant_display_name: string;
    participant_phone: string;
    participant_slug: string;
    participant_district: string;
    votes: number;
    featured: number;
    slug: string;
    voted: boolean;
    status:string;
    createdAt:Date;
  }