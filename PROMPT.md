# LOYIHA: Al Amin Daftar

Sen yangi mahsulot quryapsan. Nomi — **Al Amin Daftar**.

## ⚠️ Eng muhim qoida

Bu **mutlaqo yangi, mustaqil loyiha**. Mening boshqa loyiham (al-amin ERP,
`Codex/Al_Amin_CRM` papkasida) bor, lekin:

- u yerdagi kodni o'qima, import qilma, nusxalama
- u yerdagi papkalarga hech narsa yozma
- faqat shu papkada, noldan boshla

## Bu nima uchun kerak

Nishon foydalanuvchi — O'zbekistondagi kichik ishlab chiqarish korxonasi egasi.
Hisobini **qo'l daftarida** yuritadi. Maktabda yaxshi o'qimagan, o'zi shu sohada
ishlab pul topgan va korxona ochgan odam. Kompyuter bilan ishlash tajribasi kam,
telefondan foydalanadi, sexda yuradi.

Uch nafar shunday korxona egasi bilan gaplashildi. Ular aynan shu gapni aytdi:
*"Bizga daftarimiz qulay. Daftarimdaqa sodda, tushunish oson narsa qilib bering."*

Ular uchta narsani sanadi:

1. Ta'minotchilar bilan oldi-berdi
2. Ishchilar qancha ishladi, qancha oldi
3. Kimga nima sotdim, qancha qarzi bor

Boshqa hech narsa so'rashmadi. **Shu uchtadan tashqarisini qo'shma.**

## Daftar qanday ko'rinadi

Ularning daftarida bir sahifa shunday:

```
Akmal aka — charm
12.03   oldim    2 400 000
15.03   berdim     800 000
20.03   oldim    1 100 000
                ─────────
        qoldi    2 700 000
```

Sana, izoh, summa. Boshqa hech narsa yo'q.

**Shuning uchun dastur miqdor emas, PUL yozadi.** Xom ashyo ro'yxati, metr,
kilogramm, dona, narxni ko'paytirish — hechqaysi yo'q. Izoh oddiy matn: xohlasa
"charm 40 metr" deb yozadi, xohlasa "charm" deb.

## Dizayn qoidalari (buzilmaydi)

1. Butun interfeys **o'zbek tilida**, lotin alifbosida.
2. Buxgalteriya atamalari **taqiqlanadi**: debit, kredit, kontragent,
   nomenklatura, provodka, saldo, oborot, balans. O'rniga: "Qarzim", "Haqim",
   "Oldim", "Sotdim", "Pul berdim", "Pul oldim", "Qoldi".
3. Bir ekranda **eng ko'pi 2 ta amal tugmasi**.
4. Bir formada **eng ko'pi 3 ta maydon**.
5. Mobil birinchi. Tugmalar kamida 48px balandlikda, ikki barmoq bilan qulay.
6. Foydalanuvchi hech qachon **kod raqam** kiritmaydi. Hamma narsa ro'yxatdan
   nom bo'yicha tanlanadi.
7. Sana maydoni sukut bo'yicha **bugun**.
8. Pul raqamlari bo'sh joy bilan: `2 400 000 so'm`.
9. Qidiruv maydoni faqat 10 tadan ortiq element bo'lganda ko'rinadi.
10. Ortiqcha animatsiya, modal oyna, tab, accordion yo'q. Sodda sahifa
    navigatsiyasi.

## Texnologiya

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Autentifikatsiya: **telefon raqam + 4 xonali PIN**. JWT httpOnly cookie'da.
- PWA: manifest.json + service worker, telefon ekraniga o'rnatiladigan
- Multi-tenant: har bir jadvalda `companyId`, har bir so'rov shu bo'yicha
  filtrlanadi

### PIN himoyasi — majburiy

4 xonali PIN — bu atigi 10 000 ta variant, skript uni bir necha daqiqada
topadi. Dastur ichida qarzlar turadi.

Shuning uchun: **5 marta noto'g'ri PIN → 15 daqiqaga bloklanadi.** Urinishlar
bazada, telefon raqam bo'yicha saqlanadi. Bu ixtiyoriy emas.

## Ma'lumotlar bazasi

Butun dastur ikkita jadvalga tushadi. Uchala bo'lim ham bir xil ishlaydi.

```
Company       id, name, createdAt
User          id, companyId, name, phone (unique), pinHash, role (owner|xodim), createdAt
LoginAttempt  id, phone, at, ok

Party         id, companyId, kind (taminotchi|mijoz|ishchi), name, phone?,
              openingBalance (Decimal, default 0), createdAt

Entry         id, companyId, partyId, direction (up|down), amount (Decimal),
              date, note?, createdBy, createdAt, deletedAt?
```

### `openingBalance` yo'nalishi — aniq belgilangan

**Musbat qiymat doim "qarz" degani:**

| Turi | Musbat nimani bildiradi |
|---|---|
| ta'minotchi | men unga qarzdorman |
| mijoz | u menga qarzdor |
| ishchi | unga berilishi kerak |

Manfiy qiymat teskarisini bildiradi (oldindan to'langan).

Buni interfeysda ham shunday tushuntir: "Boshlang'ich qarz" deb yoz, "balans"
deb emas.

### `direction` uchala turda bir xil mexanika

| Turi | `up` (qarz oshadi) | `down` (qarz kamayadi) |
|---|---|---|
| ta'minotchi | Oldim | Pul berdim |
| mijoz | Sotdim | Pul oldim |
| ishchi | Ishladi | Pul berdim |

Ya'ni kod bitta, faqat tugma matni farq qiladi.

### Hisob-kitob

```
Qarz = openingBalance + Σ Entry(up).amount − Σ Entry(down).amount
```

Faqat `deletedAt IS NULL` bo'lgan yozuvlar hisoblanadi.

Qarz bazada saqlanmasin — har safar hisoblansin. Tezlik kerak bo'lsa keyin
keshlaymiz.

### Xatoni tuzatish — majburiy

Bu foydalanuvchi albatta xato kiritadi: summani noto'g'ri, odamni adashib.
Tuzatish yo'li bo'lmasa u soxta teskari yozuv yaratadi yoki dasturni tashlab
ketadi. Daftarda hech bo'lmasa chizib tashlash mumkin.

Shuning uchun: **o'sha kuni yaratilgan yozuvni o'chirish mumkin.**
`deletedAt` qo'yiladi, ro'yxatdan yashiriladi, qarzdan chiqadi. Kechagisini
emas — faqat bugungisini. Sodda va yetarli.

## Ekranlar

Aslida uchta noyob ekran bor, ular uch marta ishlatiladi.

**1. Kirish** — telefon raqam, keyin 4 xonali PIN. Katta raqamli klaviatura.

**2. Bosh sahifa**

Uchta raqam:

- **Men qarzdorman** — ta'minotchilarga jami — qizil fon
- **Mendan haqdorlar** — mijozlar jami — yashil fon
- **Ishchilarga** — jami qoldiq — kulrang fon

Ostida uchta katta kvadrat tugma: **Xom-ashyochilar · Mijozlar · Ishchilar**.

Boshqa hech narsa yo'q. Grafik yo'q, diagramma yo'q.

**3. Ro'yxat ekrani** (uchala bo'lim uchun bir xil)

Nomlar ro'yxati, har birining yonida qarz summasi. Pastda `+ Yangi qo'shish`.

Yangi qo'shish formasi: nom, telefon (ixtiyoriy), boshlang'ich qarz (ixtiyoriy).

**4. Kartochka ekrani** (uchala bo'lim uchun bir xil)

Yuqorida qarz summasi katta shrift bilan. Ikkita tugma (yuqoridagi jadvalga
qarab). Ostida oldi-berdi tarixi: sana, izoh, summa. Qarz oshirgani qizil,
kamaytirgani yashil.

Bugungi yozuv yonida kichik "o'chirish" tugmasi.

**5. Yozuv formasi** (uchala bo'lim uchun bir xil, faqat sarlavha farq qiladi)

Uchta maydon: **summa**, **sana** (sukut — bugun), **izoh** (ixtiyoriy).

**6. Sozlamalar** — korxona nomi, xodim qo'shish.

## MVP'ga KIRMAYDI — yozma

- Tayyor mahsulot va uning qoldig'i
- Xom ashyo ro'yxati, miqdor, o'lchov birligi, narx, ko'paytirish
- Kassa raqami (elektr, ijara kabi harajatlar hisobga olinmasa u yolg'on
  chiqadi — yarim to'g'ri raqamdan ko'ra yo'q bo'lgani yaxshi)
- Spetsifikatsiya, tannarx, foyda
- Excel eksport/import
- Grafik va diagrammalar
- Rollar va ruxsatlar matritsasi
- Telegram bot
- Ko'p valyuta

Bularning hammasi keyingi bosqich. Kimdir so'rasa qo'shamiz.

## Ish tartibi

1. Avval **rejani yozib ber** — papka tuzilmasi, Prisma sxemasi, ekranlar
   ro'yxati. Kod yozishdan oldin men tasdiqlayman.
2. Tasdiqlagach: loyiha karkasi, Prisma sxemasi va migratsiya.
3. Auth: telefon + PIN, urinishlarni cheklash bilan birga.
4. `Party` va `Entry`: ro'yxat, kartochka, forma, o'chirish — uchala turga
   birdan ishlaydigan qilib.
5. Bosh sahifa raqamlari.
6. Sozlamalar.
7. PWA.
8. Seed skript: 2 ta ta'minotchi, 3 ta mijoz, 4 ta ishchi va har birida bir
   nechta yozuv. **Nomlar to'qima bo'lsin, real korxona ma'lumotlaridan
   foydalanma.**

Har bosqichdan keyin to'xta va nima qilganingni qisqa aytib ber.

## Kod uslubi

- Server Components default, `"use client"` faqat forma va interaktiv joylarda
- Server Actions orqali yozish amallari, alohida API route'lar shart emas
- Summalar bazada `Decimal` (`@db.Decimal(18,2)`), JS'da `number`ga
  aylantirishda ehtiyot bo'l
- **Har bir so'rovda `companyId` filtri** — bu xavfsizlik masalasi, unutma
- Fayl nomlari va o'zgaruvchilar inglizcha, foydalanuvchiga ko'rinadigan
  matnlar o'zbekcha

---

Boshla: avval rejani ko'rsat.
