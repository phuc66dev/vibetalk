import { apiClient } from './apiClient';
import type { GetMeResponse, User } from '../types';

export async function getMe(): Promise<User> {
  const response = await apiClient.get<GetMeResponse>('/auth/check');
  // Server trả về thẳng object User (res.status(200).json(req.user))
  return response as unknown as User;
}
