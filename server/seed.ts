import { db } from "./db";
import { profiles, companies, services, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Create a demo user
    const passwordHash = await hashPassword("password123");
    
    const [demoUser] = await db.insert(users).values({
      id: "demo-user-id",
      username: "demo_user",
      password: passwordHash,
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
    }).onConflictDoNothing().returning();

    // If user already exists, fetch it
    const user = demoUser || (await db.select().from(users).where(eq(users.id, "demo-user-id")))[0];

    if (!user) {
        console.error("Failed to create or find demo user");
        return;
    }

    // Create profile
    const [profile] = await db.insert(profiles).values({
      id: user.id,
      role: "partner",
      fullName: "Demo Partner",
      bio: "A demo furniture store partner",
      region: "São Paulo, SP"
    }).onConflictDoNothing().returning();

    // If profile existed or was created
    const existingProfile = await db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.id, demoUser.id) });

    if (existingProfile) {
      // Create company
      const [company] = await db.insert(companies).values({
        ownerId: existingProfile.id,
        tradingName: "Móveis Demo Ltda",
        corporateName: "Móveis Demo Comércio de Móveis",
        cnpj: "00.000.000/0001-00",
        city: "São Paulo",
        state: "SP",
        phone: "(11) 99999-9999"
      }).onConflictDoNothing().returning(); // Added onConflictDoNothing in case run multiple times

      // Get company if not returned (already exists)
      const existingCompany = company || await db.query.companies.findFirst({ where: (c, { eq }) => eq(c.ownerId, existingProfile.id) });

      if (existingCompany) {
          // Update profile with companyId
          await db.update(profiles).set({ companyId: existingCompany.id }).where(eq(profiles.id, existingProfile.id));

          // Create service
          await db.insert(services).values({
            companyId: existingCompany.id,
            creatorId: existingProfile.id,
            title: "Montagem de Guarda-Roupa",
            description: "Montagem de guarda-roupa 6 portas com espelho. Necessário levar parafusadeira.",
            clientName: "João Silva",
            addressFull: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
            price: 15000, // 150.00
            status: "published",
            complexity: "medium",
            durationHours: 3
          });

          await db.insert(services).values({
            companyId: existingCompany.id,
            creatorId: existingProfile.id,
            title: "Instalação de Painel de TV",
            description: "Painel suspenso para TV de até 65 polegadas.",
            clientName: "Maria Souza",
            addressFull: "Rua Augusta, 500 - Consolação, São Paulo - SP",
            price: 8000, // 80.00
            status: "published",
            complexity: "low",
            durationHours: 1
          });
      }
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding:", error);
  }
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
