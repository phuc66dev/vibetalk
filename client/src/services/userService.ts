import { apiClient } from './apiClient';
import type { User } from '../types';

export async function getMe(): Promise<User> {
  return apiClient.get<User>('/auth/check');
}
