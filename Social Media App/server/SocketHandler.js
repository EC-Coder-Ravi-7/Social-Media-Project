import prisma from './db.js';

export const SocketHandler = (io) => {
  io.on('connection', (socket) => {
    
    socket.on('join-user-room', ({ userId }) => {
      if (!userId) {
        console.log('⚠️ join-user-room received without userId');
        return;
      }

      const roomId = String(userId);

      socket.join(roomId);

      console.log(
        `🔔 Socket ${socket.id} joined notification room: ${roomId}`
      );
    });

    // 1. Fetch Profile
    socket.on('fetch-profile', async ({ _id }) => {
      try {
        if (!_id) return;

        const user = await prisma.user.findUnique({
          where: { id: _id },
          include: {
            followedBy: true, // followers
            following: true,  // following
          },
        });

        if (user) {
          const formattedProfile = {
            _id: user.id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
            about: user.about,
            followers: user.followedBy.map((f) => f.followerId),
            following: user.following.map((f) => f.followingId),
          };

          socket.emit('profile-fetched', { profile: formattedProfile });
        }
      } catch (err) {
        console.error('Socket fetch-profile error:', err);
      }
    });

    // 2. Update Profile
    socket.on('updateProfile', async ({ userId, profilePic, username, about }) => {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            profilePic: profilePic || undefined,
            username: username || undefined,
            about: about || undefined,
          },
          include: {
            followedBy: true,
            following: true,
          },
        });

        const formattedProfile = {
          _id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          profilePic: updatedUser.profilePic,
          about: updatedUser.about,
          followers: updatedUser.followedBy.map((f) => f.followerId),
          following: updatedUser.following.map((f) => f.followingId),
        };

        io.emit('profile-fetched', { profile: formattedProfile });
      } catch (err) {
        console.error('Socket updateProfile error:', err);
      }
    });

    // 3. Like Post
    socket.on('postLiked', async ({ userId, postId }) => {
      try {
        await prisma.like.upsert({
          where: {
            userId_postId: { userId, postId },
          },
          update: {},
          create: { userId, postId },
        });

        const updatedLikes = await prisma.like.findMany({
          where: { postId },
          select: { userId: true },
        });

        io.emit('post-liked-updated', {
          postId,
          likes: updatedLikes.map((l) => l.userId),
        });
      } catch (err) {
        console.error('Socket like error:', err);
      }
    });

    // 4. Unlike Post
    socket.on('postUnLiked', async ({ userId, postId }) => {
      try {
        await prisma.like.deleteMany({
          where: { userId, postId },
        });

        const updatedLikes = await prisma.like.findMany({
          where: { postId },
          select: { userId: true },
        });

        io.emit('post-liked-updated', {
          postId,
          likes: updatedLikes.map((l) => l.userId),
        });
      } catch (err) {
        console.error('Socket unlike error:', err);
      }
    });

    // 5. Follow User
    socket.on('followUser', async ({ ownId, followingUserId }) => {
      try {
        if (ownId === followingUserId) return;

        await prisma.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: ownId,
              followingId: followingUserId,
            },
          },
          update: {},
          create: {
            followerId: ownId,
            followingId: followingUserId,
          },
        });

        const userFollowing = await prisma.follow.findMany({
          where: { followerId: ownId },
          select: { followingId: true },
        });

        socket.emit('userFollowed', {
          following: userFollowing.map((f) => f.followingId),
        });
      } catch (err) {
        console.error('Socket follow error:', err);
      }
    });

    // 6. Unfollow User
    socket.on('unFollowUser', async ({ ownId, followingUserId }) => {
      try {
        await prisma.follow.deleteMany({
          where: {
            followerId: ownId,
            followingId: followingUserId,
          },
        });

        const userFollowing = await prisma.follow.findMany({
          where: { followerId: ownId },
          select: { followingId: true },
        });

        socket.emit('userUnFollowed', {
          following: userFollowing.map((f) => f.followingId),
        });
      } catch (err) {
        console.error('Socket unfollow error:', err);
      }
    });

    // 7. Add Comment
    socket.on('makeComment', async ({ postId, username, comment }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) return;

        await prisma.comment.create({
          data: {
            postId,
            userId: user.id,
            text: comment,
          },
        });

        const comments = await prisma.comment.findMany({
          where: { postId },
          include: {
            user: { select: { username: true } },
          },
        });

        io.emit('comment-added', {
          postId,
          comments: comments.map((c) => [c.user.username, c.text]),
        });
      } catch (err) {
        console.error('Socket makeComment error:', err);
      }
    });

    // 8. Delete Post
    socket.on('delete-post', async ({ postId }) => {
      try {
        await prisma.post.delete({
          where: { id: postId },
        });

        const posts = await prisma.post.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            likes: true,
            comments: {
              include: { user: { select: { username: true } } },
            },
          },
        });

        const formattedPosts = posts.map((post) => ({
          _id: post.id,
          userId: post.userId,
          userName: post.userName,
          userPic: post.userPic,
          fileType: post.fileType,
          file: post.file,
          description: post.description,
          location: post.location,
          likes: post.likes.map((like) => like.userId),
          comments: post.comments.map((c) => [c.user.username, c.text]),
          createdAt: post.createdAt,
        }));

        io.emit('post-deleted', { posts: formattedPosts });
      } catch (err) {
        console.error('Socket delete-post error:', err);
      }
    });

    // 9. Search User
    socket.on('user-search', async ({ username }) => {
      try {
        const searchUsername = username?.trim();

        if (!searchUsername) {
          socket.emit('searched-user', { user: null });
          return;
        }

        const user = await prisma.user.findFirst({
          where: {
            username: {
              equals: searchUsername,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            username: true,
            profilePic: true,
            fullName: true,
            about: true,
          },
        });

        if (!user) {
          socket.emit('searched-user', { user: null });
          return;
        }

        socket.emit('searched-user', {
          user: {
            _id: user.id,
            username: user.username,
            profilePic: user.profilePic,
            fullName: user.fullName,
            about: user.about,
          },
        });
      } catch (err) {
        console.error('Socket user-search error:', err);
        socket.emit('searched-user', { user: null });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);
    });
  });
};

export default SocketHandler;