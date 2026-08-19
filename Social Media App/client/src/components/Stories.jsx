import React, { useContext, useEffect, useState } from 'react';
import '../styles/Stories.css';
import { AiOutlinePlus } from 'react-icons/ai';
import { GeneralContext } from '../context/GeneralContextProvider';
import navProfile from '../images/nav-profile.avif';
import axios from 'axios';

const Stories = () => {
  const { isCreatStoryOpen, setIsCreateStoryOpen } = useContext(GeneralContext);
  const [stories, setStories] = useState([]);

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
        {/* User Story Circle */}
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

        {/* Other Users' Stories */}
        {stories.map((story) => (
          <div className="Story" key={story.id || story._id}>
            <div className="storyUserImgWrapper">
              <img src={story.file || navProfile} alt="Story" className="storyUserImg" />
            </div>
            <p>{story.userName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;