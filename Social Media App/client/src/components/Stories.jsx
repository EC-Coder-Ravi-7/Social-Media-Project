import React, { useContext, useEffect, useState } from 'react';
import '../styles/Stories.css';
import { AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import { GeneralContext } from '../context/GeneralContextProvider';
import navProfile from '../images/nav-profile.avif';
import axios from 'axios';

const Stories = () => {
  const { isCreatStoryOpen, setIsCreateStoryOpen } = useContext(GeneralContext);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  const userPic = localStorage.getItem('profilePic');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get('http://localhost:6001/fetchAllStories');
        setStories(res.data || []);
      } catch (err) {
        console.error('Fetch stories error:', err);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="StoriesContainer">
      <div className="Stories">
        <div className="Story" onClick={() => setIsCreateStoryOpen(!isCreatStoryOpen)}>
          <div className="storyUserImgWrapper">
            <img
              src={userPic && userPic !== 'undefined' && userPic !== '' ? userPic : navProfile}
              alt="Your Story"
              className="storyUserImg"
            />
            <div className="addStoryIconBadge">
              <AiOutlinePlus />
            </div>
          </div>
          <p>Your story</p>
        </div>

        {stories.map((story) => (
          <div
            className="Story"
            key={story.id || story._id}
            onClick={() => setActiveStory(story)}
          >
            <div className="storyUserImgWrapper">
              <img
                src={story.userPic || story.file || navProfile}
                alt="Story"
                className="storyUserImg"
              />
            </div>
            <p>{story.userName}</p>
          </div>
        ))}
      </div>

      {activeStory && (
        <div className="storyViewerOverlay" onClick={() => setActiveStory(null)}>
          <div className="storyViewerModal" onClick={(e) => e.stopPropagation()}>
            <div className="storyViewerHeader">
              <div className="storyViewerUser">
                <img
                  src={activeStory.userPic || navProfile}
                  alt={activeStory.userName}
                  className="storyViewerAvatar"
                />
                <span>{activeStory.userName}</span>
              </div>
              <button
                className="storyViewerCloseBtn"
                onClick={() => setActiveStory(null)}
              >
                <AiOutlineClose />
              </button>
            </div>
            <div className="storyViewerMediaContainer">
              {activeStory.fileType === 'video' ? (
                <video
                  src={activeStory.file}
                  className="storyViewerMedia"
                  autoPlay
                  controls
                />
              ) : (
                <img
                  src={activeStory.file}
                  alt="Story Content"
                  className="storyViewerMedia"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;