CREATE TYPE "public"."assignment_status" AS ENUM('invited', 'accepted', 'rejected', 'removed');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('pequena', 'media', 'grande');--> statement-breakpoint
CREATE TYPE "public"."complexity_level" AS ENUM('low', 'medium', 'high', 'expert');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('pdf', 'video', 'image', 'other');--> statement-breakpoint
CREATE TYPE "public"."industry_type" AS ENUM('lojista', 'marcenaria', 'outros');--> statement-breakpoint
CREATE TYPE "public"."montador_level" AS ENUM('iniciante', 'intermediario', 'avancado', 'especialista');--> statement-breakpoint
CREATE TYPE "public"."partnership_status" AS ENUM('pending', 'active', 'rejected', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('draft', 'published', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('montador', 'partner', 'admin', 'marcenaria', 'lojista');--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"service_id" integer,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"type" text DEFAULT 'appointment' NOT NULL,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"trading_name" text NOT NULL,
	"corporate_name" text,
	"cnpj" text,
	"phone" text,
	"email_contact" text,
	"address_full" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"industry_type" "industry_type",
	"company_size" "company_size",
	"is_verified" boolean DEFAULT false,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "partnerships" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"montador_id" text NOT NULL,
	"status" "partnership_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'montador' NOT NULL,
	"full_name" text,
	"phone" text,
	"avatar_url" text,
	"bio" text,
	"cpf" text,
	"skills" text[],
	"experience_years" integer,
	"region" text,
	"company_id" integer,
	"reputation_score" integer DEFAULT 0,
	"level" "montador_level" DEFAULT 'iniciante',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
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
--> statement-breakpoint
CREATE TABLE "service_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"montador_id" text NOT NULL,
	"status" "assignment_status" DEFAULT 'invited',
	"assigned_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"file_url" text NOT NULL,
	"file_type" "file_type" NOT NULL,
	"file_name" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"creator_id" text,
	"montador_id" text,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"status" "service_status" DEFAULT 'draft',
	"complexity" "complexity_level" DEFAULT 'medium',
	"is_urgent" boolean DEFAULT false,
	"client_name" text NOT NULL,
	"client_phone" text,
	"client_info" jsonb DEFAULT '{}'::jsonb,
	"address_full" text NOT NULL,
	"scheduled_for" timestamp,
	"duration_hours" integer,
	"price" integer,
	"required_skills" text[],
	"documents" text[],
	"service_details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"min_qualification" "montador_level" DEFAULT 'iniciante'
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_montador_id_profiles_id_fk" FOREIGN KEY ("montador_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_profiles_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_profiles_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_montador_id_profiles_id_fk" FOREIGN KEY ("montador_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_attachments" ADD CONSTRAINT "service_attachments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_creator_id_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_montador_id_profiles_id_fk" FOREIGN KEY ("montador_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");