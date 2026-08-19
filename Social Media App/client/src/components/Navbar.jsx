import React, { useContext } from 'react';
import '../styles/Navbar.css';
import { AiOutlineHome, AiOutlinePlusSquare } from 'react-icons/ai';
import { BiMessageSquareDetail } from 'react-router-dom';
import { BsChatDots } from 'react-icons/bs';
import { RiNotification3Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import HomeLogo from './HomeLogo';
import navProfile from '../images/nav-profile.avif';
import { GeneralContext } from '../context/GeneralContextProvider';

const Navbar = () => {
  const navigate = useNavigate();
  const {
    setIsCreatePostOpen,
    setIsNotificationsOpen,
    isNotificationsOpen,
  } = useContext(GeneralContext);

  const userId = localStorage.getItem('userId') || localStorage.getItem('_id');
  const userPic = localStorage.getItem('profilePic');

  return (
    <>
      {/* Top Header - uses ONLY HomeLogo */}
      <header className="mobileTopHeader">
        <div className="mobileTopHeaderInner">
          <HomeLogo />
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="mobileBottomNav">
        <div className="mobileBottomNavInner">
          <AiOutlineHome
            className="bottomIcon"
            onClick={() => navigate('/')}
            title="Home"
          />
          <BsChatDots
            className="bottomIcon"
            onClick={() => navigate('/chat')}
            title="Messages"
          />
          <AiOutlinePlusSquare
            className="bottomIcon"
            onClick={() => setIsCreatePostOpen(true)}
            title="Create Post"
          />
          <RiNotification3Line
            className="bottomIcon"
            onClick={() => {
              if (setIsNotificationsOpen) {
                setIsNotificationsOpen((prev) => !prev);
              }
            }}
            title="Notifications"
          />
          <div
            className="bottomProfileCircle"
            onClick={() => navigate(`/profile/${userId}`)}
            title="Profile"
          >
            <img
              src={userPic && userPic !== 'undefined' && userPic !== '' ? userPic : navProfile}
              alt="Profile"
              className="bottomProfileImg"
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;