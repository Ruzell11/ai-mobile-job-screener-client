import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AIJobMatch,
  ApiResponse,
  Application,
  Education,
  Employer,
  Experience,
  Interview,
  Job,
  JobSeeker,
  JobsResponse,
  LoginResponse,
  Notification,
  PaginatedResponse,
  RegisterRequest,
} from '../types';

const API_URL = 'http://192.168.1.6:5000/api'; // Change this to your backend URL
// For Android emulator use: http://10.0.2.2:5000/api
// For iOS simulator use: http://localhost:5000/api
// For physical device use: http://YOUR_COMPUTER_IP:5000/api






const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<LoginResponse>>('/auth/register', data),
  
  login: (data: { email: string; password: string }) => 
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  
  refreshToken: (token: string) => 
    api.post('/auth/refresh-token', { token }),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
};

// Job Seeker APIs
export const jobSeekerAPI = {
   getDashboard: () => api.get('/jobseeker/dashboard'),
  getProfile: () => 
    api.get<ApiResponse<JobSeeker>>('/job-seekers/profile'),
  
  updateProfile: (data: Partial<JobSeeker>) => 
    api.put<ApiResponse<JobSeeker>>('/job-seekers/profile', data),
  
  uploadResume: (formData: FormData) => 
    api.post('/job-seekers/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  uploadProfilePicture: (formData: FormData) => 
    api.post('/job-seekers/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // Skills
  addSkill: (data: { skillName: string; proficiency?: number; yearsOfExp?: number }) => 
    api.post('/job-seekers/skills', data),
  
  updateSkill: (skillId: string, data: { proficiency?: number; yearsOfExp?: number }) => 
    api.put(`/job-seekers/skills/${skillId}`, data),
  
  removeSkill: (skillId: string) => 
    api.delete(`/job-seekers/skills/${skillId}`),
  
  // Experience
  addExperience: (data: Partial<Experience>) => 
    api.post('/job-seekers/experience', data),
  
  updateExperience: (id: string, data: Partial<Experience>) => 
    api.put(`/job-seekers/experience/${id}`, data),
  
  deleteExperience: (id: string) => 
    api.delete(`/job-seekers/experience/${id}`),
  
  // Education
  addEducation: (data: Partial<Education>) => 
    api.post('/job-seekers/education', data),
  
  updateEducation: (id: string, data: Partial<Education>) => 
    api.put(`/job-seekers/education/${id}`, data),
  
  deleteEducation: (id: string) => 
    api.delete(`/job-seekers/education/${id}`),
  
  // Saved Jobs
  getSavedJobs: () => 
    api.get('/job-seekers/saved-jobs'),
  
  saveJob: (jobId: string) => 
    api.post(`/job-seekers/saved-jobs/${jobId}`),
  
  unsaveJob: (jobId: string) => 
    api.delete(`/job-seekers/saved-jobs/${jobId}`),
};

// Job APIs
export const jobAPI = {
   saveJob: (jobId: string) => 
    api.post(`/job-seekers/saved-jobs/${jobId}`),
  
  // Unsave a job
  unsaveJob: (jobId: string) => 
    api.delete(`/job-seekers/saved-jobs/${jobId}`),
  
  // Apply for a job
  applyForJob: (jobId: string, data?: { coverLetter?: string }) => 
    api.post(`/jobs/${jobId}/apply`, data),
  
  // Get my applications
  getMyApplications: () => 
    api.get('/job-seekers/applications'),
  
  // Get application status
  getApplicationStatus: (jobId: string) => 
    api.get(`/jobs/${jobId}/application-status`),
  
  // Get recommended jobs
  getRecommendedJobs: () => 
    api.get<JobsResponse>('/jobs/recommended'),
  
  // Get similar jobs
  getSimilarJobs: (jobId: string) => 
    api.get<JobsResponse>(`/jobs/${jobId}/similar`),
  getAllJobs: (params?: { 
    page?: number; 
    limit?: number; 
    location?: string; 
    employmentType?: string;
    experienceLevel?: string;
    isRemote?: boolean;
  }) => 
    api.get<PaginatedResponse<Job>>('/jobs', { params }),
  
  getJobById: (jobId: string) => 
    api.get<ApiResponse<Job>>(`/jobs/${jobId}`),
  
  searchJobs: (params: { 
    q?: string; 
    skills?: string; 
    location?: string; 
    page?: number; 
    limit?: number;
  }) => 
    api.get<PaginatedResponse<Job>>('/jobs/search', { params }),
};

// Application APIs
export const applicationAPI = {
  submitApplication: (data: { jobId: string; coverLetter?: string }) => 
    api.post<ApiResponse<Application>>('/applications', data),
  
  getMyApplications: (params?: { status?: string; page?: number; limit?: number }) => 
    api.get<PaginatedResponse<Application>>('/applications/my-applications', { params }),
  
  getApplicationById: (id: string) => 
    api.get<ApiResponse<Application>>(`/applications/${id}`),
  
  withdrawApplication: (id: string) => 
    api.put(`/applications/${id}/withdraw`),
};

// AI APIs
export const aiAPI = {
  getJobMatches: () => 
    api.get<ApiResponse<{ matches: AIJobMatch[] }>>('/ai/job-matches'),
  
  analyzeResume: () => 
    api.get('/ai/resume-analysis'),
  
  generateInterviewQuestions: (data: { 
    jobRole: string; 
    experienceLevel: string; 
    skills: string[];
  }) => 
    api.post('/ai/interview-questions', data),
  
  evaluateAnswer: (data: { 
    question: string; 
    answer: string; 
    jobRole: string;
  }) => 
    api.post('/ai/evaluate-answer', data),
};

// Interview APIs
export const interviewAPI = {
  getMyInterviews: (params?: { upcoming?: boolean; status?: string }) => 
    api.get<ApiResponse<{ interviews: Interview[] }>>('/interviews/my-interviews', { params }),
  
  getInterviewById: (id: string) => 
    api.get<ApiResponse<Interview>>(`/interviews/${id}`),
  
  createMockInterview: (data: { 
    jobRole: string; 
    experienceLevel: string; 
    skills: string[];
  }) => 
    api.post('/interviews/mock', data),
  
  getMockInterviews: () => 
    api.get('/interviews/mock/my-sessions'),
  
  completeMockInterview: (id: string, data: { answers: any[] }) => 
    api.put(`/interviews/mock/${id}`, data),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params?: { unreadOnly?: boolean }) => 
    api.get<ApiResponse<{ notifications: Notification[] }>>('/notifications', { params }),
  
  getUnreadCount: () => 
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  
  markAsRead: (id: string) => 
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => 
    api.put('/notifications/read-all'),
  
  deleteNotification: (id: string) => 
    api.delete(`/notifications/${id}`),
};

// Employer APIs
export const employerAPI = {
  getProfile: () => 
    api.get<ApiResponse<Employer>>('/employers/profile'),
  
  updateProfile: (data: Partial<Employer>) => 
    api.put<ApiResponse<Employer>>('/employers/profile', data),
  
  uploadLogo: (formData: FormData) => 
    api.post('/employers/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getDashboard: () => 
    api.get(`/employers/dashboard`),
  
  // Team
  getTeamMembers: () => 
    api.get('/employers/team'),
  
  addTeamMember: (data: any) => 
    api.post('/employers/team', data),
  
  updateTeamMember: (id: string, data: any) => 
    api.put(`/employers/team/${id}`, data),
  
  removeTeamMember: (id: string) => 
    api.delete(`/employers/team/${id}`),
  
  // Jobs
  createJob: (data: Partial<Job> & { skills?: string[] }) => 
    api.post('/jobs', data),
  
  updateJob: (id: string, data: Partial<Job> & { skills?: string[] }) => 
    api.put(`/jobs/${id}`, data),
  
  deleteJob: (id: string) => 
    api.delete(`/jobs/${id}`),
  
  getMyJobs: () => 
    api.get('/jobs/employer/my-jobs'),
  
  // Applications
  getJobApplications: (jobId: string, params?: { status?: string; page?: number; limit?: number }) => 
    api.get(`/applications/job/${jobId}`, { params }),
  
  updateApplicationStatus: (id: string, data: { status: string; notes?: string }) => 
    api.put(`/applications/${id}/status`, data),
  
  rateApplication: (id: string, data: { rating: number; notes?: string }) => 
    api.put(`/applications/${id}/rating`, data),
  
  // Interviews
  scheduleInterview: (data: any) => 
    api.post('/interviews', data),
  
  updateInterview: (id: string, data: any) => 
    api.put(`/interviews/${id}`, data),
  
  cancelInterview: (id: string, data: { reason?: string }) => 
    api.delete(`/interviews/${id}`, { data }),
  
  addInterviewFeedback: (id: string, data: { feedback: string; rating?: number; notes?: string }) => 
    api.put(`/interviews/${id}/feedback`, data),
  
  // AI
  getCandidateMatches: (jobId: string) => 
    api.get(`/ai/candidate-matches/${jobId}`),
  
  getDiversityMetrics: () => 
    api.get('/ai/diversity-metrics'),
};

export default api;