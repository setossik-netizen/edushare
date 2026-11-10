export type UserRole = "user" | "moderator" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  approvedCount: number;
  isContributor: boolean;
  avatarUrl: string | null;
  currentLevelId: string | null;
  bio: string | null;
};

export type HeaderUser = Pick<
  SessionUser,
  "username" | "email" | "role" | "isContributor"
>;

export type LevelOption = {
  id: string;
  slug: string;
  label: string;
  cycle: "primaire" | "college" | "lycee" | "universite";
};

export type SubjectOption = {
  id: string;
  slug: string;
  label: string;
};

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};
