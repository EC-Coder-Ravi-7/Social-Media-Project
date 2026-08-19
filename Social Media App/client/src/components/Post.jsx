import React, { useContext, useEffect, useState } from 'react';
import '../styles/Posts.css';
import { AiOutlineHeart, AiTwotoneHeart } from 'react-icons/ai';
import { BiCommentDetail } from 'react-icons/bi';
import { FaGlobeAmericas } from 'react-icons/fa';
import navProfile from '../images/nav-profile.avif';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Post = () => {
  const { socket } = useContext(GeneralContext);
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:6001/fetchAllPosts');
      setPosts(res.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePostLikedUpdated = ({ postId, likes }) => {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? { ...p, likes } : p))
      );
    };

    const handleCommentAdded = ({ postId, comments }) => {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? { ...p, comments } : p))
      );
    };

    const handlePostDeleted = ({ posts: updatedPosts }) => {
      setPosts(updatedPosts || []);
    };

    socket.on('post-liked-updated', handlePostLikedUpdated);
    socket.on('comment-added', handleCommentAdded);
    socket.on('post-deleted', handlePostDeleted);

    return () => {
      socket.off('post-liked-updated', handlePostLikedUpdated);
      socket.off('comment-added', handleCommentAdded);
      socket.off('post-deleted', handlePostDeleted);
    };
  }, [socket]);

  const handleLike = (postId) => {
    if (!userId || !socket) return;
    socket.emit('postLiked', { userId, postId });
  };

  const handleUnLike = (postId) => {
    if (!userId || !socket) return;
    socket.emit('postUnLiked', { userId, postId });
  };

  const handleComment = (postId) => {
    if (!comment.trim() || !socket) return;
    socket.emit('makeComment', { postId, username, comment });
    setComment('');
  };

  return (
    <div className="posts">
      {posts.map((post) => {
        const postLikes = Array.isArray(post.likes) ? post.likes : [];
        const isLiked = userId ? postLikes.includes(userId) : false;
        const postComments = Array.isArray(post.comments) ? post.comments : [];

        return (
          <div className="Post" key={post._id}>
            <div className="postTop">
              <div
                className="postTopDetails"
                onClick={() => navigate(`/profile/${post.userId}`)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={post.userPic || navProfile}
                  alt={post.userName}
                  className="userpic"
                />
                <h3 className="usernameTop">{post.userName}</h3>
              </div>
            </div>

            {post.fileType === 'video' ? (
              <video className="postimg" controls autoPlay muted>
                <source src={post.file} />
              </video>
            ) : (
              <img src={post.file} className="postimg" alt="Post" />
            )}

            <div className="postReact">
              <div className="supliconcol">
                {isLiked ? (
                  <AiTwotoneHeart
                    className="support reactbtn"
                    style={{ color: '#e63946' }}
                    onClick={() => handleUnLike(post._id)}
                  />
                ) : (
                  <AiOutlineHeart
                    className="support reactbtn"
                    onClick={() => handleLike(post._id)}
                  />
                )}
                <label className="supportCount">{postLikes.length}</label>
              </div>

              <BiCommentDetail
                className="comment reactbtn"
                onClick={() =>
                  setActiveCommentPostId(
                    activeCommentPostId === post._id ? null : post._id
                  )
                }
              />

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
                  value={activeCommentPostId === post._id ? comment : ''}
                  onChange={(e) => {
                    setActiveCommentPostId(post._id);
                    setComment(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleComment(post._id);
                  }}
                />
                <button
                  className="btn btn-primary"
                  disabled={
                    activeCommentPostId !== post._id || !comment.trim()
                  }
                  onClick={() => handleComment(post._id)}
                >
                  Post
                </button>
              </div>

              <div className="commentsBody">
                <div className="comments">
                  {postComments.map((c, idx) => (
                    <p key={idx}>
                      <b>{Array.isArray(c) ? c[0] : c.username}</b>{' '}
                      {Array.isArray(c) ? c[1] : c.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Post;