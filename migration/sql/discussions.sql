
create table "discussions" (
  "id" serial not null,
  "categoryID" integer not null,
  "title" text not null,
  "url" text unique not null,
  "description" text,
  "metaDescription" text,
  "keywords" text,
  "posts" integer not null,
  "topics" integer not null,
  "sort" smallint not null,
  "dateCreated" timestamp not null,
  "hidden" boolean not null,
  "system" boolean not null,
  "locked" boolean not null,
  primary key ("id")
);


insert into "discussions" (
  "id",
  "categoryID",
  "title",
  "url",
  "description",
  "metaDescription",
  "keywords",
  "posts",
  "topics",
  "sort",
  "dateCreated",
  "hidden",
  "system",
  "locked"
)
select
  "intForumID",
  "intCategoryID",
  "vchForumTitle",
  "vchForumURLTitle",
  "vchForumDescription",
  "vchForumMetaDescription",
  "vchForumMetaKeywords",
  "intForumPostCount",
  "intForumTopicCount",
  "intForumPosition",
  "dteForumDateCreated",
  "bitHidden",
  "bitSystem",
  "bitLocked"
from "tblForumSubcategories";


update "discussions"
set "metaDescription" = "description"
where "metaDescription" = '';
