/**
 * Sinash uchun namuna korxona. Nomlar to'qima — hech qanday real
 * korxonaning ma'lumoti ishlatilmagan.
 *
 * Ishga tushirish:  npm run db:seed
 *
 * Faqat "Namuna poyabzal" korxonasiga tegadi: bor bo'lsa o'chirib qayta
 * yaratadi, boshqa korxonalarga qo'l tegizmaydi.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const COMPANY = "Namuna poyabzal";
const OWNER_PHONE = "+998900000001";
const OWNER_PIN = "1111";

const D = (v: string) => new Prisma.Decimal(v);

/** Bugundan n kun oldingi sana (UTC yarim tuni — @db.Date shuni kutadi) */
function daysAgo(n: number): Date {
  const now = new Date();
  const tashkent = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const d = new Date(
    Date.UTC(
      tashkent.getUTCFullYear(),
      tashkent.getUTCMonth(),
      tashkent.getUTCDate(),
    ),
  );
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function main() {
  const existing = await db.company.findFirst({
    where: { name: COMPANY },
    select: { id: true },
  });
  if (existing) {
    await db.company.delete({ where: { id: existing.id } });
    console.log("eski namuna korxona o'chirildi");
  }

  const company = await db.company.create({ data: { name: COMPANY } });

  const owner = await db.user.create({
    data: {
      companyId: company.id,
      name: "Rahbar",
      phone: OWNER_PHONE,
      pinHash: await bcrypt.hash(OWNER_PIN, 12),
      role: "owner",
    },
  });
  await db.user.create({
    data: {
      companyId: company.id,
      name: "Nodira hisobchi",
      phone: "+998900000002",
      pinHash: await bcrypt.hash("2222", 12),
      role: "xodim",
    },
  });

  const by = owner.id;
  const c = company.id;

  // --- Xom ashyo ---
  const [charm, taglik, ip, yelim] = await Promise.all([
    db.material.create({ data: { companyId: c, name: "Charm", unit: "dis" } }),
    db.material.create({ data: { companyId: c, name: "Taglik", unit: "par" } }),
    db.material.create({ data: { companyId: c, name: "Ip", unit: "dona" } }),
    db.material.create({ data: { companyId: c, name: "Yelim", unit: "kg" } }),
  ]);

  // --- Tayyor mahsulot: ikkita papka, ichida xillari ---
  const loroQora = await db.product.create({
    data: {
      companyId: c,
      name: "Loro piano",
      description: "qora 35 - 39",
      price: D("240000"),
    },
  });
  const loroJigar = await db.product.create({
    data: {
      companyId: c,
      name: "Loro piano",
      description: "jigarrang 40 - 45",
      price: D("260000"),
    },
  });
  const bolalar = await db.product.create({
    data: {
      companyId: c,
      name: "Bolalar krossovka",
      description: "oq 28 - 34",
      price: D("150000"),
    },
  });

  // --- Odamlar ---
  const akmal = await db.party.create({
    data: {
      companyId: c,
      kind: "taminotchi",
      name: "Akmal aka",
      phone: "+998901112233",
      openingBalance: D("1200000"),
    },
  });
  const rustam = await db.party.create({
    data: {
      companyId: c,
      kind: "taminotchi",
      name: "Rustam charm",
      openingBalance: D("0"),
    },
  });

  const sadaf = await db.party.create({
    data: {
      companyId: c,
      kind: "mijoz",
      name: "Sadaf savdo",
      phone: "+998902223344",
      openingBalance: D("0"),
    },
  });
  const chorsu = await db.party.create({
    data: {
      companyId: c,
      kind: "mijoz",
      name: "Chorsu do'kon",
      openingBalance: D("450000"),
    },
  });
  const bahor = await db.party.create({
    data: {
      companyId: c,
      kind: "mijoz",
      name: "Bahor market",
      openingBalance: D("0"),
    },
  });

  const sardor = await db.party.create({
    data: {
      companyId: c,
      kind: "ishchi",
      name: "Sardor",
      payType: "ishbay",
      rate: D("18000"),
      openingBalance: D("0"),
    },
  });
  const jasur = await db.party.create({
    data: {
      companyId: c,
      kind: "ishchi",
      name: "Jasur",
      payType: "ishbay",
      rate: D("15000"),
      openingBalance: D("0"),
    },
  });
  const dilnoza = await db.party.create({
    data: {
      companyId: c,
      kind: "ishchi",
      name: "Dilnoza",
      payType: "oylik",
      rate: D("4500000"),
      openingBalance: D("0"),
    },
  });
  const zuhra = await db.party.create({
    data: {
      companyId: c,
      kind: "ishchi",
      name: "Zuhra",
      payType: "oylik",
      rate: D("3800000"),
      openingBalance: D("0"),
    },
  });

  // --- Xaridlar ---
  const purchase = (
    partyId: string,
    materialId: string,
    qty: string,
    price: string,
    day: number,
  ) =>
    db.purchase.create({
      data: {
        companyId: c,
        partyId,
        materialId,
        qty: D(qty),
        unitPrice: D(price),
        total: D(qty).times(D(price)).toDecimalPlaces(2),
        date: daysAgo(day),
        createdBy: by,
      },
    });

  await purchase(akmal.id, charm.id, "120", "40000", 24);
  await purchase(akmal.id, yelim.id, "8", "95000", 18);
  await purchase(rustam.id, taglik.id, "300", "12000", 15);
  await purchase(rustam.id, ip.id, "40", "8000", 9);
  await purchase(akmal.id, charm.id, "60", "42000", 4);

  // --- Ishlab chiqarish ---
  const production = (
    productId: string,
    qty: string,
    workerId: string,
    day: number,
  ) =>
    db.production.create({
      data: {
        companyId: c,
        productId,
        qty: D(qty),
        workerId,
        date: daysAgo(day),
        createdBy: by,
      },
    });

  await production(loroQora.id, "60", sardor.id, 20);
  await production(loroJigar.id, "40", jasur.id, 16);
  await production(bolalar.id, "35", sardor.id, 11);
  await production(loroQora.id, "25", jasur.id, 5);

  // --- Sotuvlar ---
  const sale = (
    partyId: string,
    productId: string,
    qty: string,
    price: string,
    day: number,
  ) =>
    db.sale.create({
      data: {
        companyId: c,
        partyId,
        productId,
        qty: D(qty),
        unitPrice: D(price),
        total: D(qty).times(D(price)).toDecimalPlaces(2),
        date: daysAgo(day),
        createdBy: by,
      },
    });

  await sale(sadaf.id, loroQora.id, "30", "240000", 14);
  await sale(sadaf.id, loroJigar.id, "12", "260000", 7);
  await sale(chorsu.id, bolalar.id, "20", "150000", 10);
  await sale(bahor.id, loroQora.id, "18", "245000", 3);

  // --- Ishchilar bajargan ish ---
  const work = (
    partyId: string,
    productId: string | null,
    label: string | null,
    qty: string,
    price: string,
    day: number,
  ) =>
    db.workEntry.create({
      data: {
        companyId: c,
        partyId,
        productId,
        label,
        qty: D(qty),
        unitPrice: D(price),
        amount: D(qty).times(D(price)).toDecimalPlaces(2),
        date: daysAgo(day),
        createdBy: by,
      },
    });

  await work(sardor.id, loroQora.id, null, "60", "18000", 20);
  await work(sardor.id, null, "Bichuv", "40", "9000", 12);
  await work(jasur.id, loroJigar.id, null, "40", "15000", 16);
  await work(dilnoza.id, null, "Oylik", "1", "4500000", 2);
  await work(zuhra.id, null, "Oylik", "1", "3800000", 2);

  // --- Pul harakati ---
  const pay = (
    partyId: string,
    direction: "kirim" | "chiqim",
    amount: string,
    day: number,
    kind?: "avans" | "oylik",
  ) =>
    db.payment.create({
      data: {
        companyId: c,
        partyId,
        direction,
        amount: D(amount),
        kind: kind ?? null,
        date: daysAgo(day),
        createdBy: by,
      },
    });

  await pay(akmal.id, "chiqim", "2000000", 17);
  await pay(rustam.id, "chiqim", "1500000", 8);
  await pay(sadaf.id, "kirim", "6000000", 13);
  await pay(sadaf.id, "kirim", "2000000", 6);
  await pay(chorsu.id, "kirim", "3000000", 9);
  await pay(bahor.id, "kirim", "4000000", 2);
  await pay(sardor.id, "chiqim", "800000", 13, "avans");
  await pay(jasur.id, "chiqim", "500000", 10, "avans");
  await pay(dilnoza.id, "chiqim", "4500000", 1, "oylik");

  // --- Xarajatlar ---
  const spend = (title: string, amount: string, day: number) =>
    db.expense.create({
      data: {
        companyId: c,
        title,
        amount: D(amount),
        date: daysAgo(day),
        createdBy: by,
      },
    });

  await spend("Ijara", "2500000", 21);
  await spend("Elektr", "640000", 15);
  await spend("Benzin", "300000", 6);
  await spend("Ta'mir", "180000", 2);

  console.log(`
  Namuna korxona tayyor: ${COMPANY}
  Kirish:  ${OWNER_PHONE}   maxfiy raqam ${OWNER_PIN}
  Xodim:   +998900000002    maxfiy raqam 2222

  2 xom-ashyochi, 3 mijoz, 4 ishchi, 2 model (3 xil), 4 xarajat.
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
