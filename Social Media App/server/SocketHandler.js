import Chats from './models/Chats.js';
import Post from './models/Post.js';
import Stories from './models/Stories.js';
import User from './models/Users.js';

const SocketHandler = (socket) => {
  
    socket.on('postLiked', async ({userId, postId}) =>{
        try {
            await Post.updateOne({_id: postId}, {$addToSet: {likes: userId}});
            socket.emit("likeUpdated");
        } catch (error) {
            console.error('Error liking post:', error);
            socket.emit('error', {message: 'Error liking post'});
        }
    });

    socket.on('postUnLiked', async ({userId, postId}) =>{
        try {
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            socket.emit("likeUpdated");
        } catch (error) {
            console.error('Error unliking post:', error);
            socket.emit('error', {message: 'Error unliking post'});
        }
    });

    socket.on("fetch-profile", async({_id})=>{
        try {
            const user = await User.findOne({_id});
            console.log(user);
            socket.emit("profile-fetched", {profile: user});
        } catch (error) {
            console.error('Error fetching profile:', error);
            socket.emit('error', {message: 'Error fetching profile'});
        }
    });

    socket.on('updateProfile', async ({userId, profilePic, username, about})=>{
        try {
            const user = await User.updateOne({_id: userId}, {profilePic: profilePic, username: username, about: about});
            socket.emit("profile-fetched", {profile: user});
        } catch (error) {
            console.error('Error updating profile:', error);
            socket.emit('error', {message: 'Error updating profile'});
        }
    });

    socket.on('user-search', async({username})=>{
        try {
            const user = await User.findOne({username: username});
            socket.emit('searched-user', {user});
        } catch (error) {
            console.error('Error searching user:', error);
            socket.emit('error', {message: 'Error searching user'});
        }
    });

    socket.on('followUser', async({ownId, followingUserId})=>{
        try {
            await User.updateOne({_id: ownId}, {$addToSet: {following: followingUserId}});
            await User.updateOne({_id: followingUserId}, {$addToSet: {followers: ownId}});

            const user1 = await User.findOne({_id: ownId});
            const user2 = await User.findOne({_id: followingUserId});
            socket.emit('userFollowed', {following: user1.following});

            if (user2.following.includes(user1._id) && user1.following.includes(user2._id)) {
                const newChat = new Chats({
                    _id: user1._id > user2._id ? user1._id + user2._id : user2._id + user1._id
                });

                const chat = await newChat.save();
            }
        } catch (error) {
            console.error('Error following user:', error);
            socket.emit('error', {message: 'Error following user'});
        }
    });

    socket.on('unFollowUser', async({ownId, followingUserId})=>{
        try {
            await User.updateOne({_id: ownId}, {$pull: {following: followingUserId}});
            await User.updateOne({_id: followingUserId}, {$pull: {followers: ownId}});

            const user = await User.findOne({_id: ownId});
            socket.emit('userUnFollowed', {following: user.following});
        } catch (error) {
            console.error('Error unfollowing user:', error);
            socket.emit('error', {message: 'Error unfollowing user'});
        }
    });

    socket.on('makeComment', async({postId, username, comment})=>{
        try {
            await Post.updateOne({_id: postId}, { $push: { comments: [username, comment] } });
        } catch (error) {
            console.error('Error making comment:', error);
            socket.emit('error', {message: 'Error making comment'});
        }
    });

    socket.on('fetch-friends', async ({userId}) =>{
        try {
            const userData = await User.findOne({_id: userId});

            function findCommonElements(array1, array2) {
                return array1.filter(element => array2.includes(element));
            }

            const friendsList = findCommonElements(userData.following, userData.followers);

            const friendsData = await User.find(
                { _id: { $in: friendsList } },
                { _id: 1, username: 1, profilePic: 1 }
            ).exec();

            socket.emit("friends-data-fetched", {friendsData});
        } catch (error) {
            console.error('Error fetching friends:', error);
            socket.emit('error', {message: 'Error fetching friends'});
        }
    });

    socket.on('fetch-messages', async ({chatId}) =>{
        try {
            const chat = await Chats.findOne({_id: chatId});
            await socket.join(chatId);
            await socket.emit('messages-updated', {chat: chat});
        } catch (error) {
            console.error('Error fetching messages:', error);
            socket.emit('error', {message: 'Error fetching messages'});
        }
    });

    socket.on('update-messages', async ({ chatId }) => {
        try {
            const chat = await Chats.findOne({ _id: chatId });
            console.log('updating messages');
            socket.emit('messages-updated', { chat });
        } catch (error) {
            console.error('Error updating messages:', error);
            socket.emit('error', {message: 'Error updating messages'});
        }
    });

    socket.on('new-message', async ({ chatId, id, text, file, senderId, date }) => {
        try {
            await Chats.findOneAndUpdate(
                { _id: chatId },
                { $addToSet: { messages: { id, text, file, senderId, date } } },
                { new: true }
            );

            const chat = await Chats.findOne({ _id: chatId });
            console.log(chat);
            socket.emit('messages-updated', { chat });
            socket.broadcast.to(chatId).emit('message-from-user');
        } catch (error) {
            console.error('Error adding new message:', error);
            socket.emit('error', {message: 'Error adding new message'});
        }
    });

    socket.on('chat-user-searched', async ({ownId, username})=>{
        try {
            const user = await User.findOne({username: username});
            if (user) {
                if (user.followers.includes(ownId) && user.following.includes(ownId)) {
                    socket.emit('searched-chat-user', {user});
                } else {
                    socket.emit('no-searched-chat-user');
                }
            } else {
                socket.emit('no-searched-chat-user');
            }
        } catch (error) {
            console.error('Error searching chat user:', error);
            socket.emit('error', {message: 'Error searching chat user'});
        }
    });

    socket.on('fetch-all-posts', async()=>{
        try {
            const posts = await Post.find();
            socket.emit('all-posts-fetched', {posts});
        } catch (error) {
            console.error('Error fetching all posts:', error);
            socket.emit('error', {message: 'Error fetching all posts'});
        }
    });

    socket.on('delete-post', async ({postId}) =>{
        try {
            await Post.deleteOne({_id: postId});
            const posts = await Post.find();
            socket.emit('post-deleted', {posts});
        } catch (error) {
            console.error('Error deleting post:', error);
            socket.emit('error', {message: 'Error deleting post'});
        }
    });

    socket.on('create-new-story', async({userId, username, userPic, fileType, file, text})=>{
        try {
            const newStory = new Stories({userId, username, userPic, fileType, file, text});
            await newStory.save();
        } catch (error) {
            console.error('Error creating new story:', error);
            socket.emit('error', {message: 'Error creating new story'});
        }
    });

    socket.on('fetch-stories', async()=>{
        try {
            const stories = await Stories.find();
            socket.emit('stories-fetched', {stories});
        } catch (error) {
            console.error('Error fetching stories:', error);
            socket.emit('error', {message: 'Error fetching stories'});
        }
    });

    socket.on('story-played', async ({storyId, userId})=>{
        try {
            await Stories.updateOne({_id: storyId}, {$addToSet: {viewers: userId}});
        } catch (error) {
            console.error('Error updating story viewers:', error);
            socket.emit('error', {message: 'Error updating story viewers'});
        }
    });
}

export default SocketHandler;