CREATE TABLE "batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_name" text NOT NULL,
	"department" text NOT NULL,
	"rank_start" integer,
	"rank_end" integer,
	"student_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"total_solved" integer DEFAULT 0 NOT NULL,
	"easy_solved" integer DEFAULT 0 NOT NULL,
	"medium_solved" integer DEFAULT 0 NOT NULL,
	"hard_solved" integer DEFAULT 0 NOT NULL,
	"acceptance_rate" text,
	"ranking" integer,
	"contest_rating" integer,
	"recent_submissions" jsonb DEFAULT '[]'::jsonb,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"department" text,
	"leetcode_username" text,
	"role" text DEFAULT 'student' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "stats" ADD CONSTRAINT "stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;