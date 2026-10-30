import fs from "fs";
import path from "path";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image?: string | null;
  createdAt: string;
}

export interface StoredTask {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: string;
  completedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface FileData {
  users: StoredUser[];
  tasks: StoredTask[];
}

const DATA_FILE = path.join(process.cwd(), ".data.json");

function readData(): FileData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading data file:", e);
  }
  return { users: [], tasks: [] };
}

function writeData(data: FileData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing data file:", e);
  }
}

// In-memory cache for ultra-fast response
const globalForStore = globalThis as unknown as {
  cachedData: FileData;
};

if (!globalForStore.cachedData) {
  globalForStore.cachedData = readData();
}

export function getAllUsers(): StoredUser[] {
  return globalForStore.cachedData.users;
}

export function saveUser(user: StoredUser) {
  globalForStore.cachedData.users.push(user);
  writeData(globalForStore.cachedData);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const cleanEmail = email.toLowerCase().trim();
  return globalForStore.cachedData.users.find(
    (u) => u.email.toLowerCase().trim() === cleanEmail
  );
}

export function findUserById(id: string): StoredUser | undefined {
  return globalForStore.cachedData.users.find((u) => u.id === id);
}

export function getAllTasks(): StoredTask[] {
  return globalForStore.cachedData.tasks;
}

export function getUserTasks(userId: string): StoredTask[] {
  return globalForStore.cachedData.tasks.filter((t) => t.userId === userId);
}

export function saveTask(task: StoredTask) {
  globalForStore.cachedData.tasks.unshift(task);
  writeData(globalForStore.cachedData);
}

export function updateStoredTask(id: string, updates: Partial<StoredTask>): StoredTask | null {
  const index = globalForStore.cachedData.tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    globalForStore.cachedData.tasks[index] = {
      ...globalForStore.cachedData.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeData(globalForStore.cachedData);
    return globalForStore.cachedData.tasks[index];
  }
  return null;
}

export function removeStoredTask(id: string): boolean {
  const beforeLen = globalForStore.cachedData.tasks.length;
  globalForStore.cachedData.tasks = globalForStore.cachedData.tasks.filter((t) => t.id !== id);
  writeData(globalForStore.cachedData);
  return globalForStore.cachedData.tasks.length < beforeLen;
}
