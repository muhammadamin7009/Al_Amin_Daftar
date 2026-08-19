# Al Amin Daftar

Kichik ishlab chiqarish korxonasi uchun oldi-berdi daftari. Telefonda ishlaydi,
interfeys o'zbekcha, buxgalteriya atamalari yo'q.

Nishon foydalanuvchi — hisobini qo'l daftarida yuritadigan sex egasi. Shuning
uchun ekranda "debit", "saldo", "kontragent" degan so'zlar yo'q: **Qarzim**,
**Haqim**, **Oldim**, **Sotdim**, **Pul berdim**.

---

## Nima qiladi

| Bo'lim | Nima yoziladi |
|---|---|
| **Xom-ashyochilar** | Kimdan nima oldim, qancha pul berdim, qancha qarzim qoldi |
| **Mijozlar** | Kimga nima sotdim, qancha pul oldim, qancha qarzi bor |
| **Tayyor mahsulot** | Qaysi modeldan qancha ishlab chiqarildi, qancha sotildi, omborda qancha qoldi |
| **Ishchilar** | Kim qancha ishladi, qancha avans oldi, qancha berish kerak |
| **Xarajatlar** | Elektr, ijara, benzin — kassadan chiqib ketgan pul |

Bosh sahifada kassadagi pul va to'rtala bo'limning raqamlari turadi.

Qarzlar bazada saqlanmaydi — har safar yozuvlardan hisoblanadi:

```
Ta'minotchi qarzim = boshlang'ich + Σ Xarid − Σ To'lov
Mijoz qarzi        = boshlang'ich + Σ Sotuv − Σ To'lov
Ishchi qoldig'i    = boshlang'ich + Σ Ish   − Σ To'lov
Mahsulot qoldig'i  = Σ Ishlab chiqarish − Σ Sotuv
Kassa              = Σ olingan − Σ berilgan − Σ xarajat
```

---

## Ishga tushirish

Kerak: **Node 20+**, **PostgreSQL 14+**.

```bash
npm install
cp .env.example .env        # DATABASE_URL va SESSION_SECRET ni to'ldiring
npx prisma migrate dev      # bazani yaratadi
npm run db:seed             # namuna ma'lumot (ixtiyoriy)
npm run dev
```

`.env` ikkita qiymat kutadi:

```
DATABASE_URL="postgresql://postgres:parol@localhost:5432/al_amin_daftar?schema=public"
SESSION_SECRET="kamida 32 belgi bo'lgan tasodifiy satr"
```

### Namuna hisob

`npm run db:seed` "Namuna poyabzal" degan to'qima korxona yaratadi — 2
xom-ashyochi, 3 mijoz, 4 ishchi, 2 model, xarid-sotuv tarixi bilan.

| | |
|---|---|
| Telefon | `90 000 00 01` |
| Maxfiy raqam | `1111` |

Skript faqat o'sha korxonaga tegadi, bazadagi boshqa ma'lumotga qo'l urmaydi.

---

## Platforma paneli

`/platform` — korxonalarni boshqarish uchun. Ro'yxatdan o'tgan sana,
foydalanuvchilar soni, sinov muddati, to'lov holati; to'lovni qayd etish,
bloklash, egasining kodini tiklash va korxonani o'chirish.

Panel korxonalarning **ichidagi ma'lumotni ko'rmaydi** — mijoz, qarz, sotuv
so'rovlari u yerdan umuman yuborilmaydi.

Egasini yaratish:

```bash
npx tsx scripts/platform-admin.ts admin "kuchli parol"
```

Kirish: `/platform/login`. Bu hisob korxona hisoblaridan butunlay alohida —
boshqa jadval, boshqa cookie, boshqa token turi.

### To'lov tartibi

Ro'yxatdan o'tgan korxonaga **30 kun bepul**. Muddat tugasa yoki panel orqali
bloklansa, korxona `/tolov` sahifasiga tushadi va yozish amallari to'xtaydi.
Ma'lumot o'chmaydi — to'lovdan keyin hammasi o'z holida ochiladi.

---

## Buyruqlar

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | Ishlab chiqish serveri |
| `npm run build` / `npm start` | Yig'ish va tayyor server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migratsiya |
| `npm run db:seed` | Namuna ma'lumot |
| `npm run db:studio` | Prisma Studio |
| `node scripts/make-icons.mjs` | PWA ikonkalarini qayta chizadi |

---

## Texnologiya

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · PostgreSQL

Yozish amallari Server Actions orqali, alohida API route yo'q. Sahifalar
sukut bo'yicha Server Component, `"use client"` faqat forma va modallarda.

### Xavfsizlik

- **Har bir so'rovda `companyId` filtri.** Begona korxonaning yozuvini ID'sini
  bilib turib ham ochib bo'lmaydi — 404 qaytadi.
- **Kirish: telefon + 4 xonali maxfiy raqam**, bcrypt bilan hashlangan, JWT
  httpOnly cookie'da.
- **5 marta xato kod → 15 daqiqa blok.** Urinishlar bazada, telefon bo'yicha.
  4 xonali kod atigi 10 000 variant — busiz skript uni tez topadi.
- **Yozuvlar o'chmaydi**, `deletedAt` qo'yiladi va hisobdan chiqadi. Sotuv
  o'chirilsa ham mijozning tarixi buzilmaydi.

### PWA

Telefon ekraniga o'rnatiladi. Service worker faqat o'zgarmas fayllarni va
"internet yo'q" sahifasini saqlaydi — **korxona raqamlari keshlanmaydi**.
Uzilgan internetda ekranda kechagi qarz turib qolgani yo'q ekrandan yomonroq.

---

## Papkalar

```
prisma/          sxema, migratsiyalar, seed
scripts/         ikonka chizish, platforma egasini yaratish
src/app/         sahifalar (marshrutlar o'zbekcha: /mijozlar, /xarajatlar)
src/components/  umumiy komponentlar: modal, maydonlar, ro'yxatlar
src/lib/         hisob-kitob, pul va sana formati, sessiya, obuna
src/server/      Server Actions — yozish amallari shu yerda
```

Fayl nomlari va o'zgaruvchilar inglizcha, foydalanuvchiga ko'rinadigan
matnlar o'zbekcha.
