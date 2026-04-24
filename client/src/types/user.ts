export type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type GetMeResponse = {
  message: string;
  user: User;
};
