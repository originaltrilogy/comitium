ALTER TABLE "public"."topics" ADD UNIQUE ("url");
ALTER TABLE "public"."topics" alter column "firstPostID" set not null;
ALTER TABLE "public"."topics" alter column "lastPostID" set not null;
ALTER TABLE "public"."topics" alter column "titleHtml" set not null;
