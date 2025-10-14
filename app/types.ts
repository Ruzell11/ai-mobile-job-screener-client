// Type definitions for the application

export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  INTERMEDIATE = 'INTERMEDIATE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobSeeker {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  resumeUrl?: string;
  profilePicture?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  preferredJobTitle?: string;
  preferredLocation?: string;
  expectedSalary?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  description?: string;
  logo?: string;
  location?: string;
  contactPerson: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  createdAt: string;
}

export interface JobSeekerSkill {
  id: string;
  jobSeekerId: string;
  skillId: string;
  proficiency: number;
  yearsOfExp?: number;
  skill: Skill;
}

export interface Experience {
  id: string;
  jobSeekerId: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  jobSeekerId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  isRemote: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  employer?: Employer;
  skills?: JobSkill[];
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillId: string;
  isRequired: boolean;
  importance: number;
  skill: Skill;
}

export interface Application {
  id: string;
  jobId: string;
  jobSeekerId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  job?: Job;
  jobSeeker?: JobSeeker;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobSeekerId: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  interviewType: string;
  status: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIJobMatch {
  id: string;
  jobId: string;
  jobSeekerId: string;
  matchScore: number;
  skillsMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
  experienceMatch: number;
  locationMatch: number;
  recommendations: string;
  job?: Job;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    profile: JobSeeker | Employer;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  contactPerson?: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type JobSeekerTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Applications: undefined;
  Profile: undefined;
  JobDetail: { jobId: string };
  AIMatches: undefined;
  AIResumeAnalysis: undefined;
  MockInterview: undefined;
  Notifications: undefined;
};

export type EmployerTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Candidates: undefined;
  Profile: undefined;
  CreateJob: undefined;
  JobApplications: { jobId: string };
};

// Context Types
export interface AuthContextType {
  user: {
    id: string;
    email: string;
    role: UserRole;
    profile: JobSeeker | Employer;
  } | null;
  userRole: UserRole | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isJobSeeker: boolean;
  isEmployer: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string; user?: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
}