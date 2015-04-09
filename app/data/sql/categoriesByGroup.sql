'select c.id as "categoryID", c.sort as "categorySort", c.title as "categoryTitle", c.description as "categoryDescription", d.id as "discussionID", d.sort as "discussionSort", d.title as "discussionTitle", d.url as "discussionUrl", d.description as "discussionDescription", d."topics", d."posts", p.id as "lastPostID", p."dateCreated" as "lastPostDate", u.username as "lastPostAuthor", u.url as "lastPostAuthorUrl"
from categories c
join discussions d on c.id = d."categoryID"
join "discussionPermissions" dp on d.id = dp."discussionID"
and dp."groupID" = $1 and dp.read = true
join topics t on d.id = t."discussionID"
  and t.id = (
    select max(t2.id)
    from topics t2
    where t2."discussionID" = d.id
  )
left join posts p on t.id = p."topicID"
join users u on p."userID" = u.id
where p.id = (
	select max(p2.id)
	from posts p2
	where p2."topicID" = t.id and p2.draft = false
)
order by c.sort asc, d.sort asc;'
