-- These queries took about 6 minutes on the VM, so be patient.

update "topics" t
set "url" = (
  select "vchPostURLTitle"
    from "tblForumPosts"
    where "intPostID" = (
      select min("intPostID")
      from "tblForumPosts" p
      where p."intTopicID" = t."id"
    )
);

update "topics" t
set "titleHtml" = (
  select "vchPostTitle"
    from "tblForumPosts"
    where "intPostID" = (
      select min("intPostID")
      from "tblForumPosts" p
      where p."intTopicID" = t."id"
    )
);
