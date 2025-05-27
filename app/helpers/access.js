// Move New Members to the Members group if their account is more than 7 days old
export const newMemberUpgrade = async (user) => {
  if ( user.group_id === 3 && app.helpers.moment().subtract(7, 'days') > app.helpers.moment(user.joined) ) {
    await app.models.user.updateGroup({ userID: user.id, groupID: 4 })

    return await app.models.user.info({ userID: user.id })
  } else {
    return user
  }
}

// Security checks to verify if users have access to a given controller/action/view

// If they're not logged in, send them to the sign in form. If they are, respond with a 403 Forbidden.
export const challenge = (args) => {
  if ( args.user.group_id === 1 ) {
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


export const contentEdit = async (args) => {
  let content = await app.models.content.info(args.contentID)

  if ( content ) {
    if ( args.user.moderate_discussions ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error('The requested content doesn\'t exist.')
    err.statusCode = 404
    throw err
  }
}


export const discussionPost = async (args) => {
  if ( args.user.post ) {
    let discussion = await app.models.discussion.info(args.discussionID)
  
    if ( discussion ) {
      let discussionPermissions = await app.models.group.discussionPermissions(args.discussionID, args.user.group_id)
  
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
  } else {
    let err = new Error('')
    err.statusCode = 403
    err.message = args.user.group_id === 3 ? 'To help prevent spam, new members aren\'t allowed to start topics for the first 7 days after signing up.' : 'You don\'t have permission to start new topics.'
    throw err
  }
}


export const discussionReply = async (args) => {
  let discussion = await app.models.discussion.info(args.discussionID)

  if ( discussion ) {
    let discussionPermissions = await app.models.group.discussionPermissions(args.discussionID, args.user.group_id)

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


export const discussionView = async (args) => {
  let discussion = await app.models.discussion.info(args.discussionID)

  if ( discussion ) {
    let discussionPermissions = await app.models.group.discussionPermissions(args.discussionID, args.user.group_id)

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


export const postEdit = async (args) => {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    if ( ( args.user.username === post.author && !post.locked_by_id ) || args.user.moderate_discussions ) {
      let topic = await app.models.topic.info(post.topic_id)

      if ( topic ) {
        if ( !topic.locked_by_id || args.user.moderate_discussions ) {
          let topicViewAccess = await topicView(app.helpers.util.extend(args, { topicID: topic.id }))

          if ( topicViewAccess === true ) {
            return true
          } else {
            return challenge(args)
          }
        } else {
          return challenge(args)
        }
      } else {
        let err = new Error('The requested topic doesn\'t exist.')
        err.statusCode = 404
        throw err
      }
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error('The requested post doesn\'t exist.')
    err.statusCode = 404
    throw err
  }
}


export const postLock = async (args) => {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    if ( args.user.moderate_discussions ) {
      let topicViewAccess = await topicView(app.helpers.util.extend(args, { topicID: post.topic_id }))

      if ( topicViewAccess === true ) {
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


export const postReport = async (args) => {
  if ( args.user.user_id ) {
    let post = await app.models.post.info(args.postID)

    if ( post ) {
      let postViewAccess = await postView(args)

      if ( postViewAccess === true ) {
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


export const postTrash = async (args) => {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    if ( post.topic_replies > 0 ) {
      if ( args.user.moderate_discussions ) {
        let topicViewAccess = await topicView(app.helpers.util.extend(args, { topicID: post.topic_id }))

        if ( topicViewAccess === true ) {
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


export const postView = async (args) => {
  let post = await app.models.post.info(args.postID)

  if ( post ) {
    let topicViewAccess = await topicView(app.helpers.util.extend(args, { topicID: post.topic_id }))

    if ( topicViewAccess === true ) {
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


export const privateTopicStart = async (args) => {
  if ( args.user.post ) {
    if ( args.user.talk_privately ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    let err = new Error('')
    err.statusCode = 403
    err.message = args.user.group_id === 3 ? 'To help prevent spam, new members aren\'t allowed to start private topics for the first 7 days, but you can receive and respond to messages from other members.' : 'You don\'t have permission to start new topics.'
    throw err
  }
}


export const privateTopicsView = (args) => {
  // Anybody can view private topics if logged in
  if ( args.user.group_id > 1 ) {
    return true
  }
}


export const topicEdit = async (args) => {
  let topic = await app.models.topic.info(args.topicID)

  if ( topic ) {
    let topicViewAccess = await topicView(args)

    if ( topicViewAccess && ( ( args.user.user_id === topic.author_id && !topic.locked_by_id ) || args.user.moderate_discussions ) ) {
      if ( !topic.private ) {
        // Check if the user has posting rights to the topic's current discussion.
        // If a topic has been moved to a discussion that the user doesn't have
        // permission to post in, they lose their editing permissions.
        let discussionPostAccess = await discussionPost(app.helpers.util.extend(args, { discussionID: topic.discussion_id }))

        if ( discussionPostAccess === true ) {
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
    let err = new Error('The requested topic doesn\'t exist.')
    err.statusCode = 404
    throw err
  }
}


export const topicLock = async (args) => {
  if ( args.user.moderate_discussions ) {
    let topicViewAccess = await topicView(args)

    if ( topicViewAccess === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


export const topicMerge = async (args) => {
  if ( args.user.moderate_discussions ) {
    return await topicView(args)
  } else {
    return challenge(args)
  }
}


export const topicMergeForm = async (args) => {
  if ( args.user.moderate_discussions ) {
    let access = true
    let permissions = await Promise.all(args.topicID.map( async (topicID) => {
      return await topicView(app.helpers.util.extend(args, { topicID: topicID }))
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


export const topicMove = async (args) => {
  if ( args.user.moderate_discussions ) {
    return await topicView(args)
  } else {
    return challenge(args)
  }
}


export const topicMoveForm = async (args) => {
  if ( args.user.moderate_discussions ) {
    let topicViewAccess = await topicView(args)

    if ( topicViewAccess === true ) {
      let newDiscussionView = await discussionView(app.helpers.util.extend(args, { discussionID: args.newDiscussionID }))

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


export const topicReply = async (args) => {
  let topic = await app.models.topic.info(args.topicID)

  if ( topic ) {
    if ( !topic.private ) {
      let topicLocked = topic.locked_by_id && !args.user.moderate_discussions ? true : false

      if ( topicLocked ) {
        return challenge(args)
      } else {
        if ( topic.discussionID !== 2 ) {
          let discussionReplyAccess = await discussionReply(app.helpers.util.extend(args, { discussionID: topic.discussion_id }))

          if ( topicLocked === false && discussionReplyAccess === true ) {
            return true
          } else {
            return challenge(args)
          }
        } else {
          let announcementReply = await app.models.topic.announcementReply({ topicID: args.topicID, groupID: args.user.group_id })

          if ( topicLocked === false && announcementReply === true ) {
            return true
          } else {
            return challenge(args)
          }
        }
      }
    } else {
      let invitee = await app.models.topic.invitee({ topicID: args.topicID, userID: args.user.user_id })

      if ( invitee && !invitee.left_topic ) {
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


export const topicSubscribe = async (args) => {
  if ( args.user.user_id ) {
    let topicViewAccess = await topicView(args)

    if ( topicViewAccess === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


export const topicTrash = async (args) => {
  if ( args.user.moderate_discussions ) {
    let topicViewAccess = await topicView(args)

    if ( topicViewAccess === true ) {
      return true
    } else {
      return challenge(args)
    }
  } else {
    return challenge(args)
  }
}


export const topicView = async (args) => {
  let topic = await app.models.topic.info(args.topicID)
  if ( topic ) {
    if ( !topic.private ) {
      if ( topic.discussion_id !== 2 ) {
        let discussionViewAccess = await discussionView(app.helpers.util.extend(args, { discussionID: topic.discussion_id }))
        if ( discussionViewAccess === true ) {
          return true
        } else {
          return challenge(args)
        }
      } else {
        let announcementView = await app.models.topic.announcementView({ topicID: args.topicID, groupID: args.user.group_id })
        if ( announcementView === true ) {
          return true
        } else {
          return challenge(args)
        }
      }
    } else {
      let invitee = await app.models.topic.invitee({ topicID: args.topicID, userID: args.user.user_id })

      if ( invitee && !invitee.left_topic ) {
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


export const signInRedirect = (request, url) => {
  return request.headers.referer && request.headers.referer.search('/sign-in') < 0 ? request.headers.referer : url
}


export const subscriptionsView = (args) => {
  // If the user is logged in, proceed.
  if ( args.user.user_id ) {
    return true
  // Otherwise, challenge.
  } else {
    return challenge(args)
  }
}


export const userBan = async (args) => {
  let target = await app.models.user.info({ userID: args.userID })

  if ( target ) {
    if ( args.user.moderate_users ) {
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


export const userIPBan = (args) => {
  if ( args.user.moderate_users ) {
    return true
  } else {
    return challenge(args)
  }
}


export const userUpgrade = async (args) => {
  let target = await app.models.user.info({ userID: args.userID })

  if ( target ) {
    if ( args.user.moderate_users ) {
      if ( target.group_id > 3 ) {
        let err = new Error('This user can\'t be upgraded.')
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
