'insert into tblForumBookmarks (
  intUserID,
  intPostID,
  vchBookmarkNotes )
values (
  ' + connection.escape(args.userID) + ',
  ' + connection.escape(args.postID) + ',
  ' + connection.escape(args.notes) + '
);'
