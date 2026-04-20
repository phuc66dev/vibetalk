import { apiClient } from './apiClient';
import type { GetMeResponse, User } from '../types';

export async function getMe(): Promise<User> {
  const response = await apiClient.get<GetMeResponse>('/user/me');
  return response.user;
}
