'select t.id, t."sortDate", t."replies", p.id as "firstPostID", p2.id as "lastPostID", t."titleHtml", t."url", p."dateCreated" as "postDate", p2."dateCreated" as "lastPostDate", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl"
from topics t
inner join announcements a on t.id = a."topicID"
  and a."discussionID" = (
    select id
    from discussions
    where url = $1
  )
inner join posts p on p."topicID" = t.id
and p.id = (
  select min(id)
  from posts p
  where p."topicID" = t.id
)
inner join users u on u.id = p."userID"
inner join posts p2 on p2."topicID" = t.id
and p2.id = (
  select max(id)
  from posts p2
  where p2."topicID" = t.id
)
inner join users u2 on u2.id = p2."userID"
where t.draft = false
order by t."sortDate" desc;'
