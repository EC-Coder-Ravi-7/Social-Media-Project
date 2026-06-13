import React, { useContext, useEffect, useState } from 'react';
import '../styles/ProfilePage.css';
import '../styles/Posts.css';
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { BiCommentDetail } from "react-icons/bi";
import { FaGlobeAmericas } from "react-icons/fa";
import HomeLogo from '../components/HomeLogo';
import Navbar from '../components/Navbar';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { logout } = useContext(AuthenticationContext);
  const { socket } = useContext(GeneralContext);
  const { id } = useParams();
  const localUserId = localStorage.getItem("userId");

  // State for profile
  const [userProfile, setUserProfile] = useState({});
  const [updateProfilePic, setUpdateProfilePic] = useState('');
  const [updateProfileUsername, setUpdateProfileUsername] = useState('');
  const [updateProfileAbout, setUpdateProfileAbout] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // State for posts and comments
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState('');



  // Fetch profile using socket
  useEffect(() => {
    if (socket) {
      socket.emit("fetch-profile", { _id: id });
      socket.on("profile-fetched", ({ profile }) => {
        if (profile) {
          setUserProfile(profile);
          setUpdateProfilePic(profile.profilePic || '');
          setUpdateProfileUsername(profile.username || '');
          setUpdateProfileAbout(profile.about || '');
        }
      });
    }
    // Cleanup socket event listener on unmount
    return () => {
      if (socket) {
        socket.off("profile-fetched");
      }
    };
  }, [socket, id]);

  // Fetch posts via axios from backend REST API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://socialx-backend-g765.onrender.com/fetchAllPosts');
        if (response.data) {
          setPosts(response.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Listen for post deletion updates
  useEffect(() => {
    if (socket) {
      socket.on('post-deleted', ({ posts }) => {
        setPosts(posts);
      });
    }
    return () => {
      if (socket) {
        socket.off('post-deleted');
      }
    };
  }, [socket]);

  // Listen for follow/unfollow updates
  useEffect(() => {
    if (socket) {
      socket.on('userFollowed', ({ following }) => {
        localStorage.setItem('following', following);
      });
      socket.on('userUnFollowed', ({ following }) => {
        localStorage.setItem('following', following);
      });
    }
    return () => {
      if (socket) {
        socket.off('userFollowed');
        socket.off('userUnFollowed');
      }
    };
  }, [socket]);

  // Handlers for updating profile
  const handleUpdate = () => {
    if (socket) {
      socket.emit('updateProfile', {
        userId: userProfile._id,
        profilePic: updateProfilePic,
        username: updateProfileUsername,
        about: updateProfileAbout
      });
      setIsUpdating(false);
    }
  };

  // Handlers for post likes
  const handleLike = (userId, postId) => {
    if (socket) {
      socket.emit('postLiked', { userId, postId });
    }
  };

  const handleUnLike = (userId, postId) => {
    if (socket) {
      socket.emit('postUnLiked', { userId, postId });
    }
  };

  // Handlers for follow/unfollow
  const handleFollow = (userId) => {
    if (socket) {
      socket.emit('followUser', { ownId: localUserId, followingUserId: userId });
    }
  };

  const handleUnFollow = (userId) => {
    if (socket) {
      socket.emit('unFollowUser', { ownId: localUserId, followingUserId: userId });
    }
  };

  // Handler for comments
  const handleComment = (postId, username) => {
    if (socket && comment.trim() !== '') {
      socket.emit('makeComment', { postId, username, comment });
      setComment('');
    }
  };

  // Handler for post deletion
  const handleDeletePost = (postId) => {
    if (socket) {
      socket.emit('delete-post', { postId });
    }
  };

  return (
    <div className="profilePage">
      <HomeLogo />
      <Navbar />

      {/* Profile Card (View Mode) */}
      <div className="profileCard" style={isUpdating ? { display: 'none' } : { display: "flex" }}>
        <img src={userProfile.profilePic} alt="Profile" />
        <h4>{userProfile.username}</h4>
        <p>{userProfile.about}</p>
        <div className="profileDetailCounts">
          <div className="followersCount">
            <p>Followers</p>
            <p>{userProfile.followers ? userProfile.followers.length : 0}</p>
          </div>
          <div className="followingCounts">
            <p>Following</p>
            <p>{userProfile.following ? userProfile.following.length : 0}</p>
          </div>
        </div>
        <div className="profileControls">
          {userProfile._id === localUserId ? (
            <div className="profileControlBtns">
              <button onClick={logout}>Logout</button>
              <button type="button" className="btn btn-primary" onClick={() => setIsUpdating(true)}>Edit</button>
            </div>
          ) : (
            <div className="profileControlBtns">
              {localStorage.getItem('following')?.includes(userProfile._id) ? (
                <>
                  <button onClick={() => handleUnFollow(userProfile._id)} style={{ backgroundColor: 'rgb(234, 37, 37)' }}>Unfollow</button>
                  <button>Message</button>
                </>
              ) : (
                <button onClick={() => handleFollow(userProfile._id)}>Follow</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Card */}
      <div className="profileEditCard" style={!isUpdating ? { display: 'none' } : { display: "flex" }}>
        <div className="mb-3">
          <label htmlFor="profilePic" className="form-label">Profile Image</label>
          <input
            type="text"
            className="form-control"
            id="profilePic"
            value={updateProfilePic}
            onChange={(e) => setUpdateProfilePic(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={updateProfileUsername}
            onChange={(e) => setUpdateProfileUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="about" className="form-label">About</label>
          <input
            type="text"
            className="form-control"
            id="about"
            value={updateProfileAbout}
            onChange={(e) => setUpdateProfileAbout(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
      </div>

      {/* Posts Container */}
      <div className="profilePostsContainer">
        {posts
          .filter((post) => post.userId === userProfile._id)
          .map((post) => (
            <div className="Post" key={post._id}>
              <div className="postTop">
                <div className="postTopDetails">
                  <img src={post.userPic} alt="User" className="userpic" />
                  <h3 className="usernameTop">{post.userName}</h3>
                </div>
                <button className="btn btn-danger deletePost" onClick={() => handleDeletePost(post._id)}>Delete</button>
              </div>

              {post.fileType === 'photo' ? (
                <img src={post.file} className="postimg" alt="Post" />
              ) : (
                <video id="videoPlayer" className="postimg" controls autoPlay muted>
                  <source src={post.file} />
                </video>
              )}

              <div className="postReact">
                <div className="supliconcol">
                  {post.likes.includes(localStorage.getItem('userId')) ? (
                    <AiTwotoneHeart className="support reactbtn" onClick={() => handleUnLike(localStorage.getItem('userId'), post._id)} />
                  ) : (
                    <AiOutlineHeart className="support reactbtn" onClick={() => handleLike(localStorage.getItem('userId'), post._id)} />
                  )}
                  <label className="supportCount">{post.likes.length}</label>
                </div>
                <BiCommentDetail className="comment reactbtn" />
                <div className="placeiconcol">
                  <FaGlobeAmericas className="placeicon reactbtn" />
                  <label className="place">{post.location}</label>
                </div>
              </div>

              <div className="detail">
                <div className="descdataWithBtn">
                  <label className="desc labeldata">
                    <span style={{ fontWeight: 'bold' }}>{post.userName}</span> {post.description}
                  </label>
                </div>
              </div>

              <div className="commentsContainer">
                <div className="makeComment">
                  <input
                    type="text"
                    placeholder="type something..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  {comment.trim().length === 0 ? (
                    <button className="btn btn-primary" disabled>Comment</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleComment(post._id, localStorage.getItem('username'))}>Comment</button>
                  )}
                </div>
                <div className="commentsBody">
                  <div className="comments">
                    {post.comments.map((c, index) => (
                      <p key={index}>
                        <b>{c[0]}</b> {c[1]}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Profile;
