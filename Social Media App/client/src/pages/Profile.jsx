import React, { useContext, useEffect, useState } from 'react';
import '../styles/ProfilePage.css';
import Navbar from '../components/Navbar';
import navProfile from '../images/nav-profile.avif';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { BsGrid3X3, BsHeartFill, BsChatFill, BsGearWide, BsPlus } from 'react-icons/bs';
import { RxCross2 } from 'react-icons/rx';
import axios from 'axios';

const Profile = () => {
  const { logout } = useContext(AuthenticationContext);
  const { socket } = useContext(GeneralContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId') || localStorage.getItem('_id');
  const isOwnProfile = id === userId;

  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPostModal, setSelectedPostModal] = useState(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState('followers');
  const [followListUsers, setFollowListUsers] = useState([]);    

  const [isEditing, setIsEditing] = useState(false);
  const [editPicFile, setEditPicFile] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleProfileFetched = ({ profile }) => {
      if (profile) {
        setUserProfile(profile);
        setEditUsername(profile.username || '');
        setEditFullName(profile.fullName || profile.username || '');
        setEditAbout(profile.about || '');

        const followers = profile.followers || [];
        setFollowersCount(followers.length);
        setIsFollowing(followers.includes(userId));
      }
    };

    socket.on('profile-fetched', handleProfileFetched);
    socket.emit('fetch-profile', { _id: id });

    return () => {
      socket.off('profile-fetched', handleProfileFetched);
    };
  }, [socket, id, userId]);


  useEffect(() => {
    if (!socket) return;

    const handleFollowListFetched = ({ type, users }) => {
      setFollowListType(type);
      setFollowListUsers(users || []);
    };

    socket.on('follow-list-fetched', handleFollowListFetched);

    return () => {
      socket.off('follow-list-fetched', handleFollowListFetched);
    };
  }, [socket]);

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

  const handleToggleFollow = async () => {
    try {
      const res = await axios.post('http://localhost:6001/toggleFollowUser', {
        userId,
        targetId: id,
      });

      if (res.status === 200) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount((prev) => (res.data.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleDirectMessage = () => {
    navigate(`/chat?userId=${id}`);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('username', editUsername);
      formData.append('fullName', editFullName);
      formData.append('about', editAbout);
      if (editPicFile) {
        formData.append('profilePic', editPicFile);
      }

      const res = await axios.post('http://localhost:6001/updateProfile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200 && res.data) {
        const updated = res.data.user || res.data;
        if (updated.profilePic) {
          localStorage.setItem('profilePic', updated.profilePic);
        }
        if (updated.username) {
          localStorage.setItem('username', updated.username);
        }
        if (updated.fullName) {
          localStorage.setItem('fullName', updated.fullName);
        }
        setUserProfile((prev) => ({ ...prev, ...updated }));
        setIsEditing(false);
        setIsSaving(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating profile');
      setIsSaving(false);
    }
  };

  const handleDeletePost = (postId) => {
    if (!socket) return;
    socket.emit('delete-post', { postId });
    setSelectedPostModal(null);
    setPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'RECENTLY';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'RECENTLY'
      : date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase();
  };

  const userPosts = posts.filter(
    (p) => String(p.userId) === String(id) || String(p.authorId) === String(id)
  );

  const displayPic =
    userProfile?.profilePic && userProfile.profilePic !== ''
      ? userProfile.profilePic
      : isOwnProfile && localStorage.getItem('profilePic')
      ? localStorage.getItem('profilePic')
      : navProfile;

  const displayUsername =
    userProfile?.username || (isOwnProfile ? localStorage.getItem('username') : 'username');

  const displayFullName =
    userProfile?.fullName ||
    (isOwnProfile ? localStorage.getItem('fullName') : null) ||
    displayUsername;

  const displayAbout =
    userProfile?.about || (isOwnProfile ? 'Hey there! I am using SocialX.' : 'No bio yet.');


  const handleFollowList = (type) => {
    if (!socket || !userProfile) return;

    const userIds =
      type === 'followers'
        ? userProfile.followers || []
        : userProfile.following || [];

    setFollowListType(type);
    setShowFollowList(true);

    if (userIds.length === 0) {
      setFollowListUsers([]);
      return;
    }

    socket.emit('fetch-follow-list', {
      userIds,
      type,
    });
  };

  return (
    <div className="igProfileRoot">
      <Navbar />

      <main className="igProfileMain">
        <header className="igProfileHeader">
          <div className="igAvatarColumn">
            <div className="igAvatarWrapper">
              <img src={displayPic} alt="Profile avatar" className="igAvatarImg" />
            </div>
          </div>

          <section className="igDetailsColumn">
            <div className="igUsernameRow">
              <h2 className="igProfileUsername">{displayUsername}</h2>
              {isOwnProfile && <BsGearWide className="igSettingsIcon" onClick={() => setIsEditing(true)} />}
            </div>

            <div className="igProfileActionsBar">
              {isOwnProfile ? (
                <>
                  <button className="igActionBtn" onClick={() => setIsEditing(true)}>
                    Edit profile
                  </button>
                  <button className="igActionBtn" onClick={async () => await logout()}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`igActionBtn ${isFollowing ? '' : 'igActionBtnPrimary'}`}
                    onClick={handleToggleFollow}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="igActionBtn" onClick={handleDirectMessage}>
                    Message
                  </button>
                </>
              )}
            </div>

            <ul className="igStatsRow">
              <li>
                <span className="igStatCount">{userPosts.length}</span> posts
              </li>

              <li
                className="igClickableStat"
                onClick={() => handleFollowList('followers')}
              >
                <span className="igStatCount">{followersCount}</span> followers
              </li>

              <li
                className="igClickableStat"
                onClick={() => handleFollowList('following')}
              >
                <span className="igStatCount">
                  {userProfile?.following?.length || 0}
                </span>{' '}
                following
              </li>
            </ul>

            <div className="igBioSection">
              <span className="igFullName">{displayFullName}</span>
              <p className="igBioText">{displayAbout}</p>
            </div>
          </section>
        </header>

        <div className="igHighlightsContainer">
          <div className="igHighlightItem">
            <div className="igHighlightCircle">
              <img src={displayPic} alt="Highlight" />
            </div>
            <span className="igHighlightTitle">Highlights</span>
          </div>

          {isOwnProfile && (
            <div className="igHighlightItem" onClick={() => alert('Add story to highlights!')}>
              <div className="igHighlightAddCircle">
                <BsPlus className="igAddPlusIcon" />
              </div>
              <span className="igHighlightTitle">New</span>
            </div>
          )}
        </div>

        <div className="igProfileTabsNav">
          <div className="igTabItem active">
            <BsGrid3X3 />
            <span>POSTS</span>
          </div>
        </div>

        <section className="igGridSection">
          {userPosts.length === 0 ? (
            <div className="igEmptyGrid">
              <div className="igEmptyGridIcon">📷</div>
              <h3>No Posts Yet</h3>
              <p>When you share photos and videos, they will appear on your profile.</p>
            </div>
          ) : (
            <div className="igPostGrid">
              {userPosts.map((post) => (
                <article
                  className="igPostGridItem"
                  key={post.id || post._id}
                  onClick={() => setSelectedPostModal(post)}
                >
                  {post.fileType === 'video' ? (
                    <video src={post.file} className="igPostGridMedia" />
                  ) : (
                    <img src={post.file} alt="" className="igPostGridMedia" />
                  )}
                  <div className="igPostGridHover">
                    <span>
                      <BsHeartFill /> {post.likes?.length || 0}
                    </span>
                    <span>
                      <BsChatFill /> {post.comments?.length || 0}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {isEditing && (
        <div className="igModalOverlay" onClick={() => setIsEditing(false)}>
          <div className="igModalDialog" onClick={(e) => e.stopPropagation()}>
            <div className="igModalDialogHeader">
              <h3>Edit profile</h3>
              <RxCross2 className="igModalDialogClose" onClick={() => setIsEditing(false)} />
            </div>
            <form onSubmit={handleUpdateProfile} className="igEditProfileForm">
              <div className="igFormRow">
                <label>Change photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPicFile(e.target.files[0])}
                />
              </div>
              <div className="igFormRow">
                <label>Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>
              <div className="igFormRow">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="igFormRow">
                <label>Bio</label>
                <textarea
                  rows="3"
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  placeholder="Bio details..."
                />
              </div>
              <button type="submit" className="igFormSubmitBtn" disabled={isSaving}>
                {isSaving ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showFollowList && (
        <div
          className="igModalOverlay"
          onClick={() => setShowFollowList(false)}
        >
          <div
            className="igFollowListDialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="igFollowListHeader">
              <h3>
                {followListType === 'followers'
                  ? 'Followers'
                  : 'Following'}
              </h3>

              <RxCross2
                className="igModalDialogClose"
                onClick={() => setShowFollowList(false)}
              />
            </div>

            <div className="igFollowList">
              {followListUsers.length === 0 ? (
                <p className="igNoFollowUsers">
                  {followListType === 'followers'
                    ? 'No followers yet'
                    : 'Not following anyone yet'}
                </p>
              ) : (
                followListUsers.map((user) => (
                  <div
                    key={user.id}
                    className="igFollowUserItem"
                    onClick={() => {
                      setShowFollowList(false);
                      navigate(`/profile/${user.id}`);
                    }}
                  >
                    <img
                      src={user.profilePic || navProfile}
                      alt={user.username}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = navProfile;
                      }}
                    />

                    <div className="igFollowUserInfo">
                      <span className="igFollowUsername">
                        {user.username}
                      </span>

                      <span className="igFollowFullName">
                        {user.fullName || ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedPostModal && (
        <div className="igModalOverlay" onClick={() => setSelectedPostModal(null)}>
          <div className="igPostDetailDialog" onClick={(e) => e.stopPropagation()}>
            <button className="igPostDetailClose" onClick={() => setSelectedPostModal(null)}>
              <RxCross2 />
            </button>
            <div className="igDetailMediaWrapper">
              {selectedPostModal.fileType === 'video' ? (
                <video src={selectedPostModal.file} controls autoPlay />
              ) : (
                <img src={selectedPostModal.file} alt="" />
              )}
            </div>
            <div className="igDetailSidebar">
              <div className="igDetailAuthorHeader">
                <img
                  src={selectedPostModal.userPic || navProfile}
                  alt=""
                  className="igDetailAuthorAvatar"
                />
                <span className="igDetailAuthorName">{selectedPostModal.userName}</span>
                {isOwnProfile && (
                  <button
                    className="igDetailDeleteBtn"
                    onClick={() => handleDeletePost(selectedPostModal.id || selectedPostModal._id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="igDetailCaptionArea">
                <p>
                  <b>{selectedPostModal.userName}</b> {selectedPostModal.description}
                </p>
                <time className="igDetailDate">
                  {formatDate(selectedPostModal.createdAt)}
                </time>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;