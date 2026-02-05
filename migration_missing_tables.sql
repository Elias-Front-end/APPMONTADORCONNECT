-- Create Enums
DO $$ BEGIN
    CREATE TYPE "montador_level" AS ENUM ('iniciante', 'intermediario', 'avancado', 'especialista');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "project_category" AS ENUM ('moveis_planejados', 'cozinhas', 'quartos', 'escritorios', 'comercial', 'montagem_geral');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "complexity_level" AS ENUM ('low', 'medium', 'high', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "partnership_status" AS ENUM ('pending', 'active', 'rejected', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "service_status" AS ENUM ('draft', 'published', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "company_id" integer;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "level" "montador_level" DEFAULT 'iniciante';
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "completed_services" integer DEFAULT 0;

-- Create companies table
CREATE TABLE IF NOT EXISTS "companies" (
    "id" serial PRIMARY KEY NOT NULL,
    "owner_id" text NOT NULL REFERENCES "profiles"("id"),
    "trading_name" text NOT NULL,
    "corporate_name" text,
    "cnpj" text UNIQUE,
    "phone" text,
    "email_contact" text,
    "address_full" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "segment" text,
    "size" text,
    "is_verified" boolean DEFAULT false,
    "settings" jsonb DEFAULT '{}',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS "services" (
    "id" serial PRIMARY KEY NOT NULL,
    "company_id" integer NOT NULL REFERENCES "companies"("id"),
    "creator_id" text REFERENCES "profiles"("id"),
    "montador_id" text REFERENCES "profiles"("id"),
    "title" text NOT NULL,
    "description" text,
    "category" "project_category" DEFAULT 'montagem_geral',
    "status" "service_status" DEFAULT 'draft',
    "complexity" "complexity_level" DEFAULT 'medium',
    "min_qualification" "montador_level" DEFAULT 'iniciante',
    "is_urgent" boolean DEFAULT false,
    "client_name" text NOT NULL,
    "client_phone" text,
    "client_info" jsonb DEFAULT '{}',
    "address_full" text NOT NULL,
    "scheduled_for" timestamp,
    "duration_hours" integer,
    "price" integer,
    "required_skills" text[],
    "documents" text[],
    "videos" text[],
    "service_details" jsonb DEFAULT '{}',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "completed_at" timestamp
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" serial PRIMARY KEY NOT NULL,
    "service_id" integer NOT NULL REFERENCES "services"("id"),
    "reviewer_id" text NOT NULL REFERENCES "profiles"("id"),
    "target_id" text NOT NULL REFERENCES "profiles"("id"),
    "rating" integer NOT NULL,
    "quality" integer,
    "punctuality" integer,
    "cleanliness" integer,
    "professionalism" integer,
    "comment" text,
    "created_at" timestamp DEFAULT now()
);

-- Create partnerships table
CREATE TABLE IF NOT EXISTS "partnerships" (
    "id" serial PRIMARY KEY NOT NULL,
    "company_id" integer NOT NULL REFERENCES "companies"("id"),
    "montador_id" text NOT NULL REFERENCES "profiles"("id"),
    "status" "partnership_status" DEFAULT 'pending',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS "calendar_events" (
    "id" serial PRIMARY KEY NOT NULL,
    "profile_id" text NOT NULL REFERENCES "profiles"("id"),
    "service_id" integer REFERENCES "services"("id"),
    "title" text NOT NULL,
    "description" text,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "type" text DEFAULT 'appointment' NOT NULL,
    "is_available" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
