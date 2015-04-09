'select
	id,
  "groupID",
  "discussionID",
  read,
  post,
  reply
from "discussionPermissions"
where "groupID" = $1
and "discussionID" = (
	select d.id
  from discussions d
  where d.url = $2
);'
