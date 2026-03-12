import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://midas-backend-6zth.onrender.com/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('midas_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ❌ reload() YO'Q — loop yasaydi
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Faqat tokenni o'chirish, reload EMAS
      localStorage.removeItem('midas_token')
    }
    return Promise.reject(err)
  }
)

export interface User {
  id: number; telegram_id: number; telegram_username?: string
  first_name: string; last_name?: string; photo_url?: string
  language_code: string; is_verified: boolean; created_at: string
}
export interface UserProfile {
  id: number; role: string; display_name?: string; bio?: string
  avatar_url?: string; city?: string; website?: string
  specializations: string[]; rating: number; review_count: number
  completed_deals: number; response_rate: number
  verified_badge: boolean; featured: boolean; user: User
}
export interface Listing {
  id: number; title: string; description?: string; category: string
  status: string; pricing_type: string; price_from?: number
  price_to?: number; currency: string; city?: string
  telegram_channel_url?: string; subscriber_count?: number
  avg_views?: number; engagement_rate?: number; daily_traffic?: number
  ad_formats: string[]; cover_image?: string; images: string[]
  view_count: number; save_count: number; lead_count: number
  verified: boolean; featured: boolean; rating: number
  review_count: number; tags: string[]; created_at: string; owner: User
}
export interface Campaign {
  id: number; title: string; description?: string; business_type?: string
  goal?: string; target_audience?: string; city?: string
  budget_min?: number; budget_max?: number; currency: string
  duration_days?: number; target_platforms: string[]
  needs_creative: boolean; needs_management: boolean; status: string
  view_count: number; proposal_count: number; deadline?: string
  created_at: string; buyer: User
}
export interface Message {
  id: number; conversation_id: number; sender_id: number
  content?: string; message_type: string; file_url?: string
  is_read: boolean; created_at: string
}
export interface Conversation {
  id: number; participant_1_id: number; participant_2_id: number
  last_message_at: string; other_user?: User
  last_message?: Message; unread_count: number
}
export interface Deal {
  id: number; title: string; price: number; currency: string
  status: string; deadline?: string; created_at: string
  buyer: User; provider: User
}
export interface Notification {
  id: number; type: string; title: string; body?: string
  data: Record<string, unknown>; is_read: boolean; created_at: string
}
export interface PaginatedResponse<T> {
  items: T[]; total: number; page: number; per_page: number; pages: number
}

export const authApi = {
  telegramLogin: (initData: string) =>
    api.post('/auth/telegram', { init_data: initData }),
  getMe: () => api.get('/auth/me'),
}
export const listingsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Listing>>('/listings', { params }),
  featured: () => api.get<Listing[]>('/listings/featured'),
  get: (id: number) => api.get<Listing>(`/listings/${id}`),
  create: (data: unknown) => api.post<Listing>('/listings', data),
  update: (id: number, data: unknown) => api.patch<Listing>(`/listings/${id}`, data),
  toggleFavorite: (id: number) => api.post(`/listings/${id}/favorite`),
  favorites: () => api.get<Listing[]>('/listings/me/favorites'),
}
export const campaignsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Campaign>>('/campaigns', { params }),
  get: (id: number) => api.get<Campaign>(`/campaigns/${id}`),
  create: (data: unknown) => api.post<Campaign>('/campaigns', data),
  mine: () => api.get<Campaign[]>('/campaigns/mine'),
  submitProposal: (id: number, data: unknown) =>
    api.post(`/campaigns/${id}/proposals`, data),
}
export const chatApi = {
  conversations: () => api.get<Conversation[]>('/chat/conversations'),
  startConversation: (recipientId: number, listingId?: number) =>
    api.post('/chat/conversations/start', null, {
      params: { recipient_id: recipientId, listing_id: listingId },
    }),
  messages: (convId: number, page = 1) =>
    api.get<Message[]>(`/chat/conversations/${convId}/messages`, { params: { page } }),
  sendMessage: (convId: number, data: unknown) =>
    api.post<Message>(`/chat/conversations/${convId}/messages`, data),
  unreadCount: () => api.get<{ unread_count: number }>('/chat/unread-count'),
}
export const dealsApi = {
  list: () => api.get<Deal[]>('/deals'),
  create: (data: unknown) => api.post<Deal>('/deals', data),
  update: (id: number, data: unknown) => api.patch<Deal>(`/deals/${id}`, data),
}
export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications'),
  markRead: () => api.post('/notifications/mark-read'),
}
export const usersApi = {
  getProfile: (userId: number) => api.get<UserProfile>(`/users/${userId}`),
  myProfiles: () => api.get<UserProfile[]>('/users/me/profiles'),
  createProfile: (data: unknown) => api.post<UserProfile>('/users/me/profiles', data),
}
export const paymentsApi = {
  initiate: (data: unknown) => api.post('/payments/initiate', data),
}
