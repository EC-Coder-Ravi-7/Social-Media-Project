import React, { useContext, useEffect, useState } from 'react';
import '../styles/ProfilePage.css';
import '../styles/Posts.css';
import { AiOutlineHeart, AiTwotoneHeart } from 'react-icons/ai';
import { BiCommentDetail } from 'react-icons/bi';
import { FaGlobeAmericas } from 'react-icons/fa';
import HomeLogo from '../components/HomeLogo';
import Navbar from '../components/Navbar';
import navProfile from '../images/nav-profile.avif';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { logout } = useContext(AuthenticationContext);
  const { socket } = useContext(GeneralContext);
  const { id } = useParams();
  const userId = localStorage.getItem('userId');
  const isOwnProfile = id === userId;

  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  
  // Edit State
  const [updateProfilePicFile, setUpdateProfilePicFile] = useState(null);
  const [updateProfileUsername, setUpdateProfileUsername] = useState('');
  const [updateProfileAbout, setUpdateProfileAbout] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState('');

  // 1. Fetch Profile Details
  useEffect(() => {
    if (!socket) return;

    const handleProfileFetched = ({ profile }) => {
      if (profile) {
        setUserProfile(profile);
        setUpdateProfileUsername(profile.username || '');
        setUpdateProfileAbout(profile.about || '');
      }
    };

    socket.on('profile-fetched', handleProfileFetched);
    socket.emit('fetch-profile', { _id: id });

    return () => {
      socket.off('profile-fetched', handleProfileFetched);
    };
  }, [socket, id]);

  // 2. Fetch User Posts
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetchAllPosts');
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 3. Socket Event Handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserFollowed = ({ following }) => {
      localStorage.setItem('following', JSON.stringify(following));
    };

    const handleUserUnFollowed = ({ following }) => {
      localStorage.setItem('following', JSON.stringify(following));
    };

    const handlePostDeleted = ({ posts: updatedPosts }) => {
      setPosts(updatedPosts || []);
    };

    socket.on('userFollowed', handleUserFollowed);
    socket.on('userUnFollowed', handleUserUnFollowed);
    socket.on('post-deleted', handlePostDeleted);

    return () => {
      socket.off('userFollowed', handleUserFollowed);
      socket.off('userUnFollowed', handleUserUnFollowed);
      socket.off('post-deleted', handlePostDeleted);
    };
  }, [socket]);

  // 4. Update Profile with Cloudinary Device Upload
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('username', updateProfileUsername);
      formData.append('about', updateProfileAbout);

      if (updateProfilePicFile) {
        formData.append('profilePic', updateProfilePicFile);
      }

      const res = await axios.post('http://localhost:6001/updateProfile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        const updated = res.data.user;
        if (updated.profilePic) {
          localStorage.setItem('profilePic', updated.profilePic);
        }
        localStorage.setItem('username', updated.username);

        // Update local state and notify socket
        setUserProfile((prev) => ({ ...prev, ...updated }));
        socket.emit('updateProfile', {
          userId: updated.id,
          profilePic: updated.profilePic,
          username: updated.username,
          about: updated.about,
        });

        setIsUpdating(false);
        setIsSaving(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Failed to update profile. Please try again.');
      setIsSaving(false);
    }
  };

  const handleLike = (uId, postId) => {
    socket.emit('postLiked', { userId: uId, postId });
  };

  const handleUnLike = (uId, postId) => {
    socket.emit('postUnLiked', { userId: uId, postId });
  };

  const handleFollow = (targetUserId) => {
    socket.emit('followUser', {
      ownId: userId,
      followingUserId: targetUserId,
    });
  };

  const handleUnFollow = (targetUserId) => {
    socket.emit('unFollowUser', {
      ownId: userId,
      followingUserId: targetUserId,
    });
  };

  const handleComment = (postId, username) => {
    socket.emit('makeComment', { postId, username, comment });
    setComment('');
  };

  const handleDeletePost = (postId) => {
    socket.emit('delete-post', { postId });
  };

  const userPosts = posts.filter((post) => post.userId === id);
  const followingList = localStorage.getItem('following') || '';
  const isFollowing = followingList.includes(id);

  const displayPic =
    userProfile?.profilePic && userProfile.profilePic !== ''
      ? userProfile.profilePic
      : isOwnProfile && localStorage.getItem('profilePic')
      ? localStorage.getItem('profilePic')
      : navProfile;

  const displayUsername =
    userProfile?.username || (isOwnProfile ? localStorage.getItem('username') : 'User');

  const displayAbout =
    userProfile?.about || (isOwnProfile ? 'Welcome to my profile' : 'No bio yet');

  return (
    <div className="profilePage">
      <HomeLogo />
      <Navbar />

      {/* Profile Info Display Card */}
      <div className="profileCard" style={isUpdating ? { display: 'none' } : { display: 'flex' }}>
        <img src={displayPic} alt="Profile" className="profileHeaderImg" />
        <h4>{displayUsername}</h4>
        <p>{displayAbout}</p>

        <div className="profileDetailCounts">
          <div className="postsCount">
            <p>Posts</p>
            <p><strong>{userPosts.length}</strong></p>
          </div>
          <div className="followersCount">
            <p>Followers</p>
            <p><strong>{userProfile?.followers ? userProfile.followers.length : 0}</strong></p>
          </div>
          <div className="followingCounts">
            <p>Following</p>
            <p><strong>{userProfile?.following ? userProfile.following.length : 0}</strong></p>
          </div>
        </div>

        <div className="profileControls">
          {isOwnProfile ? (
            <div className="profileControlBtns">
              <button className="btn btn-outline-danger" onClick={async () => await logout()}>
                Logout
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsUpdating(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="profileControlBtns">
              {isFollowing ? (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleUnFollow(id)}
                    style={{ backgroundColor: 'rgb(224, 42, 42)' }}
                  >
                    Unfollow
                  </button>
                  <button className="btn btn-secondary">Message</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => handleFollow(id)}>
                  Follow
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Card (With Device File Upload) */}
      <div
        className="profileEditCard"
        style={!isUpdating ? { display: 'none' } : { display: 'flex' }}
      >
        <form onSubmit={handleUpdate}>
          <div className="mb-3">
            <label htmlFor="editProfilePicFile" className="form-label">
              Choose Profile Picture from Device
            </label>
            <input
              type="file"
              className="form-control"
              id="editProfilePicFile"
              accept="image/*"
              onChange={(e) => setUpdateProfilePicFile(e.target.files[0])}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="editUsername" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="editUsername"
              onChange={(e) => setUpdateProfileUsername(e.target.value)}
              value={updateProfileUsername}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="editAbout" className="form-label">
              About Bio
            </label>
            <input
              type="text"
              className="form-control"
              id="editAbout"
              onChange={(e) => setUpdateProfileAbout(e.target.value)}
              value={updateProfileAbout}
            />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Uploading to Cloudinary...' : 'Save Changes'}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setIsUpdating(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Posts Section */}
      <div className="profilePostsContainer">
        {userPosts.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#777' }}>
            No posts shared yet.
          </p>
        ) : (
          userPosts.map((post) => (
            <div className="Post" key={post._id}>
              <div className="postTop">
                <div className="postTopDetails">
                  <img src={post.userPic || navProfile} alt="" className="userpic" />
                  <h3 className="usernameTop">{post.userName}</h3>
                </div>
                {post.userId === userId && (
                  <button
                    className="btn btn-danger deletePost"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              {post.fileType === 'photo' ? (
                <img src={post.file} className="postimg" alt="Post content" />
              ) : (
                <video id="videoPlayer" className="postimg" controls autoPlay muted>
                  <source src={post.file} />
                </video>
              )}

              <div className="postReact">
                <div className="supliconcol">
                  {post.likes?.includes(userId) ? (
                    <AiTwotoneHeart
                      className="support reactbtn"
                      style={{ color: '#e63946' }}
                      onClick={() => handleUnLike(userId, post._id)}
                    />
                  ) : (
                    <AiOutlineHeart
                      className="support reactbtn"
                      onClick={() => handleLike(userId, post._id)}
                    />
                  )}
                  <label className="supportCount">{post.likes?.length || 0}</label>
                </div>
                <BiCommentDetail className="comment reactbtn" />
                {post.location && (
                  <div className="placeiconcol">
                    <FaGlobeAmericas className="placeicon reactbtn" />
                    <label className="place">{post.location}</label>
                  </div>
                )}
              </div>

              <div className="detail">
                <div className="descdataWithBtn">
                  <span style={{ fontWeight: 'bold' }}>{post.userName}</span> &nbsp;
                  <span>{post.description}</span>
                </div>
              </div>

              <div className="commentsContainer">
                <div className="makeComment">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={comment.trim().length === 0}
                    onClick={() => handleComment(post._id, localStorage.getItem('username'))}
                  >
                    Post
                  </button>
                </div>
                <div className="commentsBody">
                  <div className="comments">
                    {post.comments?.map((c, index) => (
                      <p key={index}>
                        <b>{Array.isArray(c) ? c[0] : c.username}</b>{' '}
                        {Array.isArray(c) ? c[1] : c.text || c.comment}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;