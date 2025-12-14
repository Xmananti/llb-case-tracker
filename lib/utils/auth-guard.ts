import { User } from "firebase/auth";
import { getCurrentUser } from "../firebase/auth";

export const requireAuth = async (): Promise<User> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
};

export const checkUserOwnership = (
  resourceUserId: string,
  currentUserId: string
): boolean => {
  return resourceUserId === currentUserId;
};

export const withAuth = async <T>(
  handler: (user: User) => Promise<T>
): Promise<T> => {
  const user = await requireAuth();
  return handler(user);
};
