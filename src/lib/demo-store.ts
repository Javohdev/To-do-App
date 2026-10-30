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
  globalForStore.mockUsers = [
    {
      id: "demo-user-id",
      name: "Ali Valiyev (Demo)",
      email: "demo@focusflow.uz",
      passwordHash: "",
      createdAt: new Date(),
    },
  ];
}

if (!globalForStore.mockTasks) {
  const now = Date.now();
  globalForStore.mockTasks = [
    {
      id: "task-1",
      title: "FocusFlow Next.js 15 tizimini ko'zdan kechirish",
      description: "App Router, Server Actions va i18n ko'p tillilik funksiyalarini tekshirish",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: new Date(now + 2 * 3600 * 1000), // 2 soat qoldi
      completedAt: null,
      userId: "demo-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "task-2",
      title: "PostgreSQL Prisma schema migratsiyasini yurgizish",
      description: "Render, Neon yoki Supabase bazasiga 'npx prisma db push' orqali jadvallarni yaratish",
      status: "PENDING",
      priority: "HIGH",
      deadline: new Date(now + 5 * 3600 * 1000), // 5 soat qoldi
      completedAt: null,
      userId: "demo-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "task-3",
      title: "Vercel platformasiga ilovani joylashtirish (Deploy)",
      description: "Vercel dashboardida DATABASE_URL va AUTH_SECRET o'zgaruvchilarini kiritish",
      status: "PENDING",
      priority: "MEDIUM",
      deadline: new Date(now + 26 * 3600 * 1000), // Ertaga
      completedAt: null,
      userId: "demo-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "task-4",
      title: "Mobil interfeys va burger menyuni sinash",
      description: "Smartfon ekranlarida Sheet drawer menyusi va til almashtirishni tekshirish",
      status: "COMPLETED",
      priority: "LOW",
      deadline: new Date(now - 3 * 3600 * 1000),
      completedAt: new Date(),
      userId: "demo-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "task-5",
      title: "Framer Motion va Confetti animatsiyalarini ko'rish",
      description: "Checkbox bosilganda to'liq ekranga chiqadigan confetti effektini sinash",
      status: "COMPLETED",
      priority: "MEDIUM",
      deadline: new Date(now - 10 * 3600 * 1000),
      completedAt: new Date(),
      userId: "demo-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export const mockUsers = globalForStore.mockUsers;
export const mockTasks = globalForStore.mockTasks;

export function addStarterTasksForUser(userId: string, userName: string) {
  const now = Date.now();
  mockTasks.unshift(
    {
      id: `task-${Date.now()}-1`,
      title: `Xush kelibsiz, ${userName}! FocusFlow bilan tanishing`,
      description: "Vazifalarni qo'shing, muddatlarni belgilang va bajarilganligini belgilang",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: new Date(now + 3 * 3600 * 1000), // 3 soat qoldi
      completedAt: null,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `task-${Date.now()}-2`,
      title: "Yangi vazifa yaratib ko'rish",
      description: "Yuqoridagi 'Yangi vazifa' tugmasini bosib birinchi vazifangizni qo'shing",
      status: "PENDING",
      priority: "MEDIUM",
      deadline: new Date(now + 24 * 3600 * 1000), // Ertaga
      completedAt: null,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: `task-${Date.now()}-3`,
      title: "Mavzu va tilni o'zgartirib ko'rish",
      description: "Chap menyu pastidagi til va qorong'i/yorug' rejim tugmalarini sinab ko'ring",
      status: "COMPLETED",
      priority: "LOW",
      deadline: new Date(now - 1 * 3600 * 1000),
      completedAt: new Date(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );
}
