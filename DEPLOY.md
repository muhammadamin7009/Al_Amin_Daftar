# Serverga chiqarish

DigitalOcean droplet (Ubuntu 22.04+) va domen bor deb hisoblanadi.
Hammasi Docker ichida ishlaydi: dastur va PostgreSQL.

Quyida `DOMEN` deb yozilgan joyga o'z domeningizni qo'ying
(masalan `daftar.al-amin.uz`).

---

## 1. Domenni serverga yo'naltirish

Domen boshqaruvida **A yozuv** qo'shing:

```
Turi   Nom      Qiymat
A      daftar   <droplet IP manzili>
```

Tekshirish (o'z kompyuteringizdan):

```bash
ping daftar.al-amin.uz
```

IP to'g'ri chiqsa, keyingi qadamga o'ting. DNS tarqalishi 5 daqiqadan
bir necha soatgacha vaqt oladi.

---

## 2. Serverni tayyorlash

Dropletga kiring:

```bash
ssh root@<droplet IP>
```

Docker va nginx o'rnating:

```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
systemctl enable --now docker
```

Faqat kerakli portlarni oching:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 3. Loyihani olish

```bash
mkdir -p /srv && cd /srv
git clone https://github.com/muhammadamin7009/Al_Amin_Daftar.git daftar
cd daftar
```

Maxfiy qiymatlarni yozing:

```bash
cp .env.production.example .env
openssl rand -base64 48      # chiqqan satrni SESSION_SECRET ga qo'ying
openssl rand -base64 24      # chiqqan satrni DB_PASSWORD ga qo'ying
nano .env
```

> `.env` git'ga tushmaydi. Uni serverda saqlang, boshqa hech qayerga
> nusxalamang.

---

## 4. Ishga tushirish

```bash
docker compose up -d --build
```

Birinchi marta 3-5 daqiqa oladi. Migratsiya konteyner ichida o'zi
bajariladi. Tekshirish:

```bash
docker compose ps
curl -I http://127.0.0.1:3000/login     # 200 qaytishi kerak
docker compose logs -f app              # xato bo'lsa shu yerda ko'rinadi
```

---

## 5. Nginx va HTTPS

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/daftar
sed -i 's/DOMEN/daftar.al-amin.uz/g' /etc/nginx/sites-available/daftar
ln -sf /etc/nginx/sites-available/daftar /etc/nginx/sites-enabled/daftar
rm -f /etc/nginx/sites-enabled/default
```

Sertifikat oling:

```bash
certbot --nginx -d daftar.al-amin.uz
nginx -t && systemctl reload nginx
```

Certbot sertifikatni o'zi yangilab turadi. Tekshirish:

```bash
certbot renew --dry-run
```

Endi `https://daftar.al-amin.uz` ochilishi kerak. **HTTPS bo'lgandan
keyingina** telefon ekraniga o'rnatish ishlaydi.

---

## 6. Birinchi hisoblar

Platforma egasini yarating:

```bash
docker compose exec app node scripts/platform-admin.mjs admin "kuchli parol"
```

Korxonalar `https://daftar.al-amin.uz/signup` orqali o'zi ro'yxatdan
o'tadi va 30 kunlik sinov muddati boshlanadi.

---

## Kundalik ishlar

**Yangilash** (kod o'zgargandan keyin):

```bash
cd /srv/daftar
git pull
docker compose up -d --build
```

**Nusxa olish (backup).** Har kuni ishlatilsin:

```bash
docker compose exec -T db pg_dump -U daftar al_amin_daftar | gzip > /srv/backup/daftar-$(date +%F).sql.gz
```

Papkani oldindan yarating: `mkdir -p /srv/backup`. Buni `crontab -e`
ichida har kuni tunda ishlatib qo'ying:

```
0 3 * * * cd /srv/daftar && docker compose exec -T db pg_dump -U daftar al_amin_daftar | gzip > /srv/backup/daftar-$(date +\%F).sql.gz
```

**Nusxadan tiklash:**

```bash
gunzip -c /srv/backup/daftar-2026-08-19.sql.gz | docker compose exec -T db psql -U daftar -d al_amin_daftar
```

**Loglar:**

```bash
docker compose logs -f app
docker compose logs -f db
```

---

## Eslatmalar

- Baza porti tashqariga chiqarilmagan — faqat konteynerlar orasida
  ko'rinadi. Dastur ham `127.0.0.1:3000` da, unga faqat nginx tegadi.
- `SESSION_SECRET` almashtirilsa hamma foydalanuvchi tizimdan chiqib
  qoladi — qayta kirishlari kerak bo'ladi.
- Namuna ma'lumot (`npm run db:seed`) haqiqiy serverda **ishlatilmasin**.
