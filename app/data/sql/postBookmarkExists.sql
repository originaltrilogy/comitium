'select intBookmarkID as id from tblForumBookmarks
where intUserID = ' + connection.escape(args.userID) + '
and intPostID = ' + connection.escape(args.postID) + ';'
