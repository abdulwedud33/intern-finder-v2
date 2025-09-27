export interface Application {
  id: number;
  companyName: string;
  companyLogo: string;
  role: string;
  dateApplied: string;
  status:
    | "In Review"
    | "Shortlisted"
    | "Offered"
    | "Interviewing"
    | "Unsuitable"
    | "Hired";
}

export interface ApplicationStats {
  all: number;
  inReview: number;
  interviewing: number;
  assessment: number;
  offered: number;
  hired: number;
}

export type TabType =
  | "all"
  | "in-review"
  | "interviewing"
  | "assessment"
  | "offered"
  | "hired";
