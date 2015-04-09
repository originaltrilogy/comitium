'select "id"
from subscriptions
where "userID" = $1 and "topicID" = (
  select "id"
  from topics
  where url = $2
);'
