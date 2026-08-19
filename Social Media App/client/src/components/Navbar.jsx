import React, { useContext } from 'react';
import "../styles/Navbar.css";
import { BiHomeAlt } from "react-icons/bi";
import { BsChatSquareText } from "react-icons/bs";
import { CgAddR } from "react-icons/cg";
import { TbNotification } from "react-icons/tb";
import navProfile from '../images/nav-profile.avif';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const {
    isCreatPostOpen,
    setIsCreatePostOpen,
    setIsCreateStoryOpen,
    isNotificationsOpen,
    setNotificationsOpen,
  } = useContext(GeneralContext);

  const navigate = useNavigate();

  const profilePic = localStorage.getItem('profilePic');
  const userId = localStorage.getItem('userId');

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="Navbar">
      <BiHomeAlt 
        className="homebtn btns" 
        onClick={() => navigate('/')} 
      />
      <BsChatSquareText 
        className="chatbtn btns" 
        onClick={() => navigate('/chat')} 
      />
      <CgAddR 
        className="createPostbtn btns" 
        onClick={() => {
          setIsCreatePostOpen(!isCreatPostOpen);
          setIsCreateStoryOpen(false);
        }} 
      />
      <TbNotification 
        className="Notifybtn btns" 
        onClick={() => setNotificationsOpen(!isNotificationsOpen)} 
      />
      <img 
        className="profile" 
        src={profilePic && profilePic !== "undefined" ? profilePic : navProfile} 
        alt="Profile" 
        onClick={handleProfileClick} 
      />
    </div>
  );
};

export default Navbar;