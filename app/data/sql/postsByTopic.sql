'select p."id", p."topicID", p."html", p."markdown", p."dateCreated", p."draft", p."lockedByID", p."lockReason", u."username" as "author", u."url" as "authorUrl"
from posts p
inner join users u on p."userID" = u.id
where p."topicID" = (
  select id
  from topics
  where url = $1
) and p.draft = false
order by p."dateCreated" asc;'
