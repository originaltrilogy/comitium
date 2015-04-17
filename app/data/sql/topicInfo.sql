'select d."id" as "discussionID", d."title" as "discussionTitle", d."url" as "discussionUrl", t."sortDate" as "time", t.id, t."url", t."replies", t."views", t."titleHtml", t."titleMarkdown", t."lockedByID", t."lockReason", p."userID" as "authorID", u."username" as "author", u."url" as "authorUrl"
from topics t
inner join discussions d on d.id = t."discussionID"
inner join posts p on p.id = (
  select min(id)
  from posts
  where "topicID" = t.id
)
inner join users u on u.id = p."userID"
where t.url = $1;'
