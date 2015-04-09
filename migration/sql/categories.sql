
create table "categories" (
  "id" serial not null,
  "title" text not null,
  "url" text unique not null,
  "description" text,
  "metaDescription" text,
  "keywords" text,
  "sort" smallint unique not null,
  "dateCreated" timestamp not null,
  "hidden" boolean not null,
  "system" boolean not null,
  "locked" boolean not null,
  primary key ("id")
);


insert into "categories" (
  "id",
  "title",
  "url",
  "description",
  "metaDescription",
  "keywords",
  "sort",
  "dateCreated",
  "hidden",
  "system",
  "locked"
)
select
  "intCategoryID",
  "vchCategoryTitle",
  "vchCategoryURLTitle",
  "vchCategoryDescription",
  "vchCategoryMetaDescription",
  "vchCategoryMetaKeywords",
  "intCategoryPosition",
  "dteCategoryDateCreated",
  "bitHidden",
  "bitSystem",
  "bitLocked"
from "tblForumCategories";


SELECT SETVAL('categories_id_seq', ( select max("id") + 1 from categories ) );
