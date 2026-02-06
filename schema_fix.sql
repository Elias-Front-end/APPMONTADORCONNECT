-- Fix Enums
DO $$ BEGIN
    CREATE TYPE "public"."assignment_status" AS ENUM('invited', 'accepted', 'rejected', 'removed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."company_size" AS ENUM('pequena', 'media', 'grande');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."complexity_level" AS ENUM('low', 'medium', 'high', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."file_type" AS ENUM('pdf', 'video', 'image', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."industry_type" AS ENUM('lojista', 'marcenaria', 'outros');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."montador_level" AS ENUM('iniciante', 'intermediario', 'avancado', 'especialista');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."partnership_status" AS ENUM('pending', 'active', 'rejected', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."service_status" AS ENUM('draft', 'published', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM('montador', 'partner', 'admin', 'marcenaria', 'lojista');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create missing tables
CREATE TABLE IF NOT EXISTS "service_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"montador_id" text NOT NULL,
	"status" "assignment_status" DEFAULT 'invited',
	"assigned_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "service_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_type" "file_type" NOT NULL,
	"file_name" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"reviewer_id" text NOT NULL,
	"reviewee_id" text NOT NULL,
	"rating_quality" integer NOT NULL,
	"rating_punctuality" integer NOT NULL,
	"rating_cleanliness" integer NOT NULL,
	"rating_professionalism" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);

-- Add columns to existing tables (Idempotent)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'montador' NOT NULL;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "full_name" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_url" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "bio" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "cpf" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "skills" text[];
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "experience_years" integer;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "region" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "company_id" integer;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "reputation_score" integer DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "level" "montador_level" DEFAULT 'iniciante';
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_cpf_unique";
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_cpf_unique" UNIQUE("cpf");

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "owner_id" text NOT NULL;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "trading_name" text NOT NULL;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "corporate_name" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "cnpj" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "email_contact" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address_full" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "state" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "zip_code" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "industry_type" "industry_type";
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "company_size" "company_size";
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "settings" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "companies_cnpj_unique";
ALTER TABLE "companies" ADD CONSTRAINT "companies_cnpj_unique" UNIQUE("cnpj");

ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "company_id" integer NOT NULL;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "creator_id" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "montador_id" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "title" text NOT NULL;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "category" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "status" "service_status" DEFAULT 'draft';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "complexity" "complexity_level" DEFAULT 'medium';
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "is_urgent" boolean DEFAULT false;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "client_name" text NOT NULL;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "client_phone" text;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "client_info" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "address_full" text NOT NULL;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "scheduled_for" timestamp;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "duration_hours" integer;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "price" integer;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "required_skills" text[];
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "documents" text[];
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "service_details" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "min_qualification" "montador_level" DEFAULT 'iniciante';

-- Foreign Keys (Attempt to add if not exists - simplistic approach, might fail if constraint name exists but that's fine)
DO $$ BEGIN
    ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_montador_id_profiles_id_fk" FOREIGN KEY ("montador_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "service_attachments" ADD CONSTRAINT "service_attachments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_profiles_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_profiles_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
