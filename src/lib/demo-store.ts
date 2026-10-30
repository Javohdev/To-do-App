export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image?: string | null;
  createdAt: Date;
}

export interface StoredTask {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date;
  completedAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const globalForStore = globalThis as unknown as {
  mockUsers: StoredUser[];
  mockTasks: StoredTask[];
};

if (!globalForStore.mockUsers) {
  globalForStore.mockUsers = [];
}

if (!globalForStore.mockTasks) {
  globalForStore.mockTasks = [];
}

export const mockUsers = globalForStore.mockUsers;
export const mockTasks = globalForStore.mockTasks;
