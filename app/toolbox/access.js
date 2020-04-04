// Security checks to verify if users have access to a given controller/action/view

'use strict'

module.exports = {
  challenge         : challenge,
  contentEdit       : contentEdit,
  discussionPost    : discussionPost,
  discussionReply   : discussionReply,
  discussionView    : discussionView,
  postEdit          : postEdit,
  postLock          : postLock,
  postReport        : postReport,
  postTrash         : postTrash,
  postView          : postView,
  privateTopicStart : privateTopicStart,
  privateTopicsView : privateTopicsView,
  topicEdit         : topicEdit,
  topicLock         : topicLock,
  topicMerge        : topicMerge,
  topicMergeForm    : topicMergeForm,
  topicMove         : topicMove,
  topicMoveForm     : topicMoveForm,
  topicReply        : topicReply,
  topicSubscribe    : topicSubscribe,
  topicTrash        : topicTrash,
  topicView         : topicView,
  signInRedirect    : signInRedirect,
  subscriptionsView : subscriptionsView,
  userBan           : userBan,
  userIPBan         : userIPBan
}



// If they're not logged in, send them to the sign in form. If they are, respond with a 403 Forbidden.
function challenge(args) {
  if ( args.user.groupID === 1 ) {
    if ( args.response === 'boolean' ) {
      return false
    } else {
      return {
        redirect: app.config.comitium.baseUrl + 'sign-in'
      }
    }
  } else {
    if ( args.response === 'boolean' ) {
      return false
    } else {
      let err = new Error()
      err.statusCode = 403
      throw err
    }
  }
}


async function contentEdit(args) {
  let content = await app.models.content.info(args.contentID)

  if ( content ) {
    if ( args.user.moderateDiscussions ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function discussionPost(args) {
  let discussion = await app.models.discussion.info(args.discussionID)

  if ( discussion ) {
    let discussionPermissions = await app.models.group.discussionPermissions(args.discussionID, args.user.groupID)

    if ( discussionPermissions.post === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function discussionReply(args) {
  let discussion = await app.models.discussion.info(args.discussionID)

  if ( discussion ) {
    let discussionPermissions = await app.models.group.discussionPermissions(args.discussionID, args.user.groupID)

    if ( discussionPermissions.reply === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function discussionView(args) {
  let discussion = await app.models.discussion.info(args.discussionID)

  if ( discussion ) {
    let discussionPermissions = await app.models.group.discussionPermissions(args.discussionID, args.user.groupID)

    if ( discussionPermissions.read ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function postEdit(args) {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    if ( ( args.user.username === post.author && !post.lockedByID ) || args.user.moderateDiscussions ) {
      let topic = await app.models.topic.info(post.topicID)

      if ( topic ) {
        if ( !topic.lockedByID || args.user.moderateDiscussions ) {
          let topicView = await this.topicView(app.toolbox.helpers.extend(args, { topicID: topic.id }))

          if ( topicView === true ) {
            return true
          } else {
            return challenge(args)
          }
        } else {
          return challenge(args)
        }
      } else {
        throw new Error({ statusCode: 404 })
      }
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function postLock(args) {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    if ( args.user.moderateDiscussions ) {
      let topicView = await this.topicView(app.toolbox.helpers.extend(args, { topicID: post.topicID }))

      if ( topicView === true ) {
        return true
      } else {
        return challenge(args)
      }
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function postReport(args) {
  if ( args.user.userID ) {
    let post = await app.models.post.info(args.postID)

    if ( post ) {
      let postView = await this.postView(args)

      if ( postView === true ) {
        return true
      } else {
        return challenge(args)
      }
    } else {
      let err = new Error()
      err.statusCode = 404
      throw err
    }
  } else {
    return challenge(args)
  }
}


async function postTrash(args) {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    if ( post.topicReplies > 0 ) {
      if ( args.user.moderateDiscussions ) {
        let topicView = await this.topicView(app.toolbox.helpers.extend(args, { topicID: post.topicID }))

        if ( topicView === true ) {
          return true
        } else {
          return challenge(args)
        }
      } else {
        return challenge(args)
      }
    } else {
      let err = new Error('You can\'t delete the only post in a topic. Delete the parent topic instead.')
      err.statusCode = 403
      throw err
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function postView(args) {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    let topicView = await this.topicView(app.toolbox.helpers.extend(args, { topicID: post.topicID }))

    if ( topicView === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function privateTopicStart(args) {
  if ( args.user.talkPrivately ) {
    return true
  } else {
    return challenge(args)
  }
}


function privateTopicsView(args) {
  if ( args.user.talkPrivately ) {
    return true
  } else {
    return challenge(args)
  }
}


async function topicEdit(args) {
  let topic = await app.models.topic.info(args.topicID)

  if ( topic ) {
    let topicView = await this.topicView(args)

    if ( topicView && ( ( args.user.userID === topic.authorID && !topic.lockedByID ) || args.user.moderateDiscussions ) ) {
      if ( !topic.private ) {
        // Check if the user has posting rights to the topic's current discussion.
        // If a topic has been moved to a discussion that the user doesn't have
        // permission to post in, they lose their editing permissions.
        let discussionPost = await this.discussionPost(app.toolbox.helpers.extend(args, { discussionID: topic.discussionID }))

        if ( discussionPost === true ) {
          return true
        } else {
          return challenge(args)
        }
      } else {
        return true
      }
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function topicLock(args) {
  if ( args.user.moderateDiscussions ) {
    let topicView = await this.topicView(args)

    if ( topicView === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


async function topicMerge(args) {
  if ( args.user.moderateDiscussions ) {
    return await this.topicView(args)
  } else {
    return challenge(args)
  }
}


async function topicMergeForm(args) {
  if ( args.user.moderateDiscussions ) {
    let access = true
    let permissions = await Promise.all(args.topicID.map( async (topicID) => {
      return await this.topicView(app.toolbox.helpers.extend(args, { topicID: topicID }))
    }))
    permissions.forEach( item => {
      if ( !item ) {
        access = false
      }
    })
    return access
  } else {
    return challenge(args)
  }
}


async function topicMove(args) {
  if ( args.user.moderateDiscussions ) {
    return await this.topicView(args)
  } else {
    return challenge(args)
  }
}


async function topicMoveForm(args) {
  if ( args.user.moderateDiscussions ) {
    let topicView = await this.topicView(args)

    if ( topicView === true ) {
      let newDiscussionView = await discussionView(app.toolbox.helpers.extend(args, { discussionID: args.newDiscussionID }))

      if ( newDiscussionView === true ) {
        return true
      } else {
        return challenge(args)
      }
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


async function topicReply(args) {
  let topic = await app.models.topic.info(args.topicID)

  if ( topic ) {
    if ( !topic.private ) {
      let topicLocked = topic.lockedByID && !args.user.moderateDiscussions ? true : false

      if ( topicLocked ) {
        return challenge(args)
      } else {
        if ( topic.discussionID !== 2 ) {
          let discussionReply = await this.discussionReply(app.toolbox.helpers.extend(args, { discussionID: topic.discussionID }))

          if ( topicLocked === false && discussionReply === true ) {
            return true
          } else {
            return challenge(args)
          }
        } else {
          let announcementReply = await app.models.topic.announcementReply({ topicID: args.topicID, groupID: args.user.groupID })

          if ( topicLocked === false && announcementReply === true ) {
            return true
          } else {
            return challenge(args)
          }
        }
      }
    } else {
      let invitee = await app.models.topic.invitee({ topicID: args.topicID, userID: args.user.userID })

      if ( args.user.talkPrivately && invitee && !invitee.left ) {
        return true
      } else {
        return challenge(args)
      }
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function topicSubscribe(args) {
  if ( args.user.userID ) {
    let topicView = await this.topicView(args)

    if ( topicView === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


async function topicTrash(args) {
  if ( args.user.moderateDiscussions ) {
    let topicView = await this.topicView(args)

    if ( topicView === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


async function topicView(args) {
  let topic = await app.models.topic.info(args.topicID)
  if ( topic ) {
    if ( !topic.private ) {
      if ( topic.discussionID !== 2 ) {
        let discussionView = await this.discussionView(app.toolbox.helpers.extend(args, { discussionID: topic.discussionID }))
        if ( discussionView === true ) {
          return true
        } else {
          return challenge(args)
        }
      } else {
        let announcementView = await app.models.topic.announcementView({ topicID: args.topicID, groupID: args.user.groupID })
        if ( announcementView === true ) {
          return true
        } else {
          return challenge(args)
        }
      }
    } else {
      let invitee = await app.models.topic.invitee({ topicID: args.topicID, userID: args.user.userID })
      if ( args.user.talkPrivately && invitee && !invitee.left ) {
        return true
      } else {
        return challenge(args)
      }
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


function signInRedirect(params, url) {
  return params.request.headers.referer && params.request.headers.referer.search('/sign-in') < 0 ? params.request.headers.referer : url
}


function subscriptionsView(args) {
  // If the user is logged in, proceed.
  if ( args.user.userID ) {
    return true
  // Otherwise, challenge.
  } else {
    return challenge(args)
  }
}


async function userBan(args) {
  let target = await app.models.user.info({ userID: args.userID })

  if ( target ) {
    if ( args.user.moderateUsers ) {
      if ( target.group === 'Administrators' ) {
        let err = new Error('Administrators can\'t be banned.')
        err.statusCode = 403
        throw err
      } else if ( target.group === 'Moderators' && args.user.group !== 'Administrators' ) {
        let err = new Error('Only an administrator can ban a moderator or lift an existing ban on a moderator.')
        err.statusCode = 403
        throw err
      } else {
        return true
      }
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


function userIPBan(args) {
  if ( args.user.moderateUsers ) {
    return true
  } else {
    return challenge(args)
  }
}
