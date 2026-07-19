import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  skills: string[] | null;
  location: string | null;
  availability: string | null;
  portfolio_links: string[] | null;
  verification_level: string;
  reputation_score: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface OpportunityResponse {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: string | null;
  required_skills: string[] | null;
  is_paid: boolean;
  payment_amount: number | null;
  deadline: string | null;
  estimated_hours: number | null;
  urgency: "low" | "medium" | "high" | "critical";
  category: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityCreate {
  title: string;
  description: string;
  organization: string;
  location?: string;
  required_skills?: string[];
  is_paid: boolean;
  payment_amount?: number;
  deadline?: string;
  estimated_hours?: number;
  urgency: "low" | "medium" | "high" | "critical";
  category: string;
  status?: "open" | "in_progress" | "completed" | "cancelled";
}

export interface ApplicationResponse {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  message: string | null;
  created_at: string;
}

export interface ApplicationCreate {
  message?: string;
}

export interface ApplicationUpdate {
  status: "pending" | "accepted" | "rejected" | "withdrawn";
}

export interface ReviewResponse {
  id: string;
  reviewer_id: string;
  receiver_id: string;
  application_id: string | null;
  rating: number;
  comments: string | null;
  created_at: string;
}

export interface ReviewCreate {
  receiver_id: string;
  application_id?: string;
  rating: number;
  comments?: string;
}

export interface UserUpdate {
  name?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  availability?: string;
  portfolio_links?: string[];
}

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<TokenResponse>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>("/auth/login", data),
  googleAuth: (code: string) =>
    api.post<TokenResponse>("/auth/google", { code }),
  googleLoginUrl: () => api.get<{ url: string }>("/auth/google/login"),
};

export const usersApi = {
  me: () => api.get<UserResponse>("/users/me"),
  updateMe: (data: UserUpdate) => api.patch<UserResponse>("/users/me", data),
  get: (id: string) => api.get<UserResponse>(`/users/${id}`),
};

export const opportunitiesApi = {
  list: (params?: {
    category?: string;
    urgency?: string;
    is_paid?: boolean;
    location?: string;
    skills?: string;
    status?: string;
  }) => api.get<OpportunityResponse[]>("/opportunities", { params }),
  get: (id: string) => api.get<OpportunityResponse>(`/opportunities/${id}`),
  create: (data: OpportunityCreate) => api.post<OpportunityResponse>("/opportunities", data),
  update: (id: string, data: Partial<OpportunityCreate>) =>
    api.patch<OpportunityResponse>(`/opportunities/${id}`, data),
  delete: (id: string) => api.delete(`/opportunities/${id}`),
};

export const applicationsApi = {
  apply: (opportunityId: string, data: ApplicationCreate) =>
    api.post<ApplicationResponse>(`/opportunities/${opportunityId}/apply`, data),
  listMy: (role: "provider" | "creator" = "provider") =>
    api.get<ApplicationResponse[]>("/applications", { params: { role } }),
  listForOpportunity: (opportunityId: string) =>
    api.get<ApplicationResponse[]>(`/opportunities/${opportunityId}/applications`),
  updateStatus: (applicationId: string, status: ApplicationUpdate["status"]) =>
    api.patch<ApplicationResponse>(`/applications/${applicationId}`, { status }),
};

export const reviewsApi = {
  create: (data: ReviewCreate) => api.post<ReviewResponse>("/reviews", data),
  listForUser: (userId: string) => api.get<ReviewResponse[]>(`/reviews/${userId}`),
};

export const matchingApi = {
  getMatches: () => api.get<OpportunityResponse[]>("/match"),
};