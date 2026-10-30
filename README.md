# 🌟 FocusFlow — Zamonaviy Vazifalar Boshqaruvi va Analitika Platformasi

FocusFlow — bu Next.js 15+ (App Router), PostgreSQL (Prisma ORM), NextAuth.js v5, Tailwind CSS, shadcn/ui va `next-intl` (3 ta til: O'zbekcha `uz`, Ruscha `ru`, Inglizcha `en`) asosida yaratilgan to'liq funksional, xavfsiz va analitik To-Do & Productivity veb-ilovasi.

Ilova Vercel Serverless arxitekturasi va tashqi PostgreSQL (Render, Supabase, Neon) ma'lumotlar bazalariga connection pooling orqali 100% moslashtirilgan.

---

## 🚀 Asosiy Xususiyatlar

1. **Autentifikatsiya (NextAuth v5 & Auth.js):**
   - Email va parol orqali ro'yxatdan o'tish (parollar `bcryptjs` yordamida 12 raundli salt bilan shifrlanadi).
   - Google OAuth 2.0 bir marta bosish orqali kirish.
   - Himoyalangan yo'nalishlar (`/dashboard`, `/tasks`) uchun Edge-mos middleware tekshiruvi.

2. **Ko'p tillilik (i18n - next-intl):**
   - 3 ta to'liq til: 🇺🇿 **O'zbekcha**, 🇷🇺 **Русский**, 🇬🇧 **English**.
   - URL prefikslari (`/uz`, `/ru`, `/en`) va sahifa yangilanmasdan dinamik til almashtirish.
   - Foydalanuvchi til sozlamalarini PostgreSQL bazasida saqlash.

3. **Interaktiv Dashboard & Analitika:**
   - 4 ta asosiy KPI kartochkasi: Jami topshiriqlar, Bajarilgan ishlar, Kutilayotgan ishlar, Bajarilish foizi.
   - Zamonaviy Circular Gauge (dumaloq progress ko'rsatkichi) va gradient animatsiyalari.
   - "Eng yaqin deadline-lar" bloki: Muddati yaqinlashgan 5 ta eng muhim topshiriq, dinamik qolgan vaqt hisoblagichi ("2 soat qoldi", "Ertaga 18:00") va bir bosishda bajarish imkoniyati.

4. **To-Do Vazifalar Boshqaruvi (/tasks):**
   - Yangi vazifa qo'shish va tahrirlash dialogi (Title, Description, Deadline datetime-picker, Priority: Low/Medium/High).
   - Vazifani bajarish bilan bir vaqtda chizilish (line-through), `canvas-confetti` bayramona animatsiyasi va foiz ko'rsatkichining dinamik yangilanishi.
   - Qidiruv tizimi (Search by title) va status filtratsiyasi ("Barchasi", "Bajarilayotgan", "Tugallangan").

5. **Dizayn va UX:**
   - Qorong'i (Dark) va Yorug' (Light) mavzu almashtirgichi (`next-themes`).
   - Mobil qurilmalarga to'liq moslashuvchan Hamburger Drawer Sheet menyusi.
   - `suppressHydrationWarning` bilan himoyalangan va hydration mismatch xatolaridan holi.

---

## 🛠️ Texnologiyalar Steki

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Til:** [TypeScript](https://www.typescriptlang.org/)
- **UI & Stillash:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI) + [Lucide Icons](https://lucide.dev/)
- **Animatsiyalar:** [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Ma'lumotlar bazasi & ORM:** [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Autentifikatsiya:** [NextAuth.js v5 (Auth.js)](https://authjs.dev/)
- **Ko'p tillilik:** [next-intl](https://next-intl-docs.vercel.app/)
- **Validatsiya:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)

---

## 📁 Loyiha Strukturasi

```
focusflow/
├── prisma/
│   └── schema.prisma          # PostgreSQL ma'lumotlar bazasi sxemasi
├── public/
│   └── locales/               # 3 ta tildagi JSON tarjimalar
│       ├── uz.json
│       ├── ru.json
│       └── en.json
├── messages/                  # next-intl uchun xabarlar
├── src/
│   ├── actions/               # Server Actions (tasks.ts, user.ts, auth.ts)
│   ├── app/
│   │   ├── [locale]/          # next-intl dinamik yo'nalishlari
│   │   │   ├── (auth)/        # /login va /register sahifalari
│   │   │   ├── (dashboard)/   # /dashboard va /tasks sahifalari
│   │   │   ├── layout.tsx     # Til provayderi
│   │   │   └── page.tsx       # Bosh sahifa
│   │   ├── api/auth/[...nextauth]/route.ts # NextAuth handler
│   │   ├── globals.css        # Tailwind va shadcn CSS o'zgaruvchilari
│   │   ├── layout.tsx         # Root layout (Theme & Session provayder)
│   │   └── page.tsx           # Asosiy yo'naltirish
│   ├── components/
│   │   ├── ui/                # shadcn/ui komponentlari (button, dialog, input va h.k.)
│   │   ├── analytics-gauge.tsx# Circular progress gauge
│   │   ├── kpi-card.tsx       # KPI ko'rsatkich kartochkalari
│   │   ├── language-toggle.tsx# Til tanlash dropdown
│   │   ├── sidebar.tsx        # Yon menyu va mobil drawer
│   │   ├── task-card.tsx      # Vazifa kartochkasi va confetti
│   │   ├── task-dialog.tsx    # Vazifa yaratish/tahrirlash modal
│   │   ├── task-list.tsx      # Vazifalar ro'yxati, qidiruv va filtrlar
│   │   ├── theme-toggle.tsx   # Qorong'i/Yorug' mavzu tugmasi
│   │   └── urgent-tasks.tsx   # Eng yaqin deadline-lar ro'yxati
│   ├── i18n/                  # routing.ts va request.ts sozlamalari
│   ├── lib/
│   │   ├── auth.config.ts     # Edge-mos NextAuth sozlamalari
│   │   ├── auth.ts            # To'liq NextAuth (Prisma & Credentials)
│   │   ├── prisma.ts          # Singleton Prisma Client (connection pool leak himoyasi)
│   │   └── utils.ts           # Yordamchi funksiyalar va formatlash
│   └── middleware.ts          # Auth va i18n middleware
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 2. Muhit o'zgaruvchilarini sozlash (`.env`):
`.env.example` faylidan nusxa oling:
```bash
cp .env.example .env
```

Quyidagi parametrlarni to'ldiring:
```env
# PostgreSQL ulanish manzili (Render, Supabase yoki Neon)
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"

# NextAuth sozlamalari
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super_secret_generated_key_32_chars_focusflow"
AUTH_SECRET="super_secret_generated_key_32_chars_focusflow"

# Google OAuth (Ixtiyoriy)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 3. Ma'lumotlar bazasini yangilash (Prisma Migration):
```bash
npx prisma db push
```

### 4. Dasturchi rejimida ishga tushirish:
```bash
npm run dev
```
Brauzerda `http://localhost:3000` manzilini oching.

### 5. Ishlab chiqarish (Production Build):
```bash
npm run build
npm run start
```

---

## 🌐 Vercel va Render Deploy Qoidalari

1. **Build Skripti:** `package.json` ichidagi build skripti `"build": "prisma generate && next build"` qilib sozlangan, shuning uchun Vercel avtomatik ravishda Prisma Client-ni generatsiya qiladi.
2. **Prisma Connection Pooling:** `src/lib/prisma.ts` singleton arxitekturasida yozilgan bo'lib, Vercel Serverless funksiyalarida ortiqcha ochiq ulanishlar (`Connection pool exhausted`) xatosini to'liq bartaraf qiladi.
3. **Muvaffaqiyatli Production Build:** Barcha sahifalar, dinamik i18n marshrutlari, NextAuth handlerlari va statik parametrlar xatoliksiz tekshirilib to'liq yig'ilgan.
