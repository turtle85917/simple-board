interface ResponseResult {
  error?: string;
  error_description?: string;
  message?: string;
}

type RequestBody = { [name: string]: string; };

type Post = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  like: string;
  view: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

type PropsPrismaDiscordUser = {
  id: string;
  nickname: string;
  profile: string;
  lastLogin: string;
}

type PropsPrismaComments = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  like: string;
  createdAt: string;
  updatedAt: string;
  user: PropsPrismaDiscordUser;
}

interface DiscordToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  avatar_decoration: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  banner_color: string;
  accent_color: number;
  locale: string;
  mfa_enabled: boolean;
  email: string;
  verified: boolean;
}

interface PrismaDiscordUser {
  id: string;
  nickname: string;
  avatarUrl: string;
  lastLogin: Date;
}

type APIDiscordUser = Omit<DiscordUser, "flags" | "locale" | "mfa_enabled" | "email" | "verified"> & { avatarUrl?: string; };