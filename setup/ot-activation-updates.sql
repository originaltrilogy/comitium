alter table groups rename to user_groups;

update user_groups set id = id + 1 where id > 1;

alter table user_groups add column content_restrictions boolean;

insert into user_groups
("id","name","url","description","login","post","reply","talk_privately","content_restrictions","moderate_discussions","administrate_discussions","moderate_users","administrate_users","administrate_app","bypass_lockdown","system","locked")
values (2, 'Pending Activation','Pending-Activation','Forum members awaiting account activation.',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,TRUE);

update user_groups set content_restrictions = TRUE where id = 1;
update user_groups set content_restrictions = TRUE where id = 3;
update user_groups set content_restrictions = TRUE where id = 7;
update user_groups set content_restrictions = FALSE where id = 4;
update user_groups set content_restrictions = FALSE where id = 5;
update user_groups set content_restrictions = FALSE where id = 6;
update user_groups set post = FALSE where id = 3;

alter table user_groups alter column content_restrictions set not null;

alter table discussion_permissions drop constraint "discussionPermissions_pkey";

update discussion_permissions set group_id = group_id + 1 where group_id > 1;

insert into discussion_permissions
( select 2, discussion_id, read, post, reply from discussion_permissions where group_id = 1 );

delete from discussion_permissions where group_id = 3;

insert into discussion_permissions ( select 3, discussion_id, read, post, reply from discussion_permissions where group_id = 4 );

alter table discussion_permissions add constraint discussion_permissions_pkey primary key (group_id, discussion_id);

CREATE TABLE user_activation (
    user_id integer PRIMARY KEY,
    destination_group_id integer,
    activation_code text
);

insert into user_activation ( user_id, activation_code, destination_group_id ) select id, activation_code, 3 from users where activated = false;

update users set group_id = group_id + 1;
update users set group_id = 2 where activated = false;
update users set group_id = 3 where joined > (now() - interval '30 days');

alter table users drop column activated;
alter table users drop column activation_code;
