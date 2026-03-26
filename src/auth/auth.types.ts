export type JwtUserPayload = {
  sub: number;
  email: string;
};

export type AuthenticatedRequestUser = {
  userId: number;
  email: string;
};
