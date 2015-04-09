'select c.id as "categoryID", c."title" as "categoryTitle", c."description" as "categoryDescription", d.id, d."title" as "discussionTitle", d."url" as "discussionUrl", d."description" as "discussionDescription", d."topics", d."posts"
from categories c
inner join discussions d on c.id = d."categoryID"
where d.url = $1;'
