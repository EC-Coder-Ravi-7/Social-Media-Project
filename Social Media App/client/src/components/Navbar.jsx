import React, { useContext } from "react";
import "../styles/Navbar.css";
import { AiOutlineHome, AiOutlinePlusSquare } from "react-icons/ai";
import { BsChatDots } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import HomeLogo from "./HomeLogo";
import navProfile from "../images/nav-profile.avif";
import { GeneralContext } from "../context/GeneralContextProvider";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    setIsCreatePostOpen,
    setIsNotificationsOpen,
    totalUnreadMessages,
    unreadNotifications,
  } = useContext(GeneralContext);

  const userId = localStorage.getItem("userId") || localStorage.getItem("_id");
  const userPic = localStorage.getItem("profilePic");

  return (
    <>
      <header className="mobileTopHeader">
        <div className="mobileTopHeaderInner">
          <HomeLogo />
        </div>
      </header>

      <nav className="mobileBottomNav">
        <div className="mobileBottomNavInner">
          <AiOutlineHome
            className="bottomIcon"
            onClick={() => navigate("/")}
            title="Home"
          />
          <div className="messageNavWrapper">
            <BsChatDots
              className="bottomIcon"
              onClick={() => navigate("/chat")}
              title="Messages"
            />

            {totalUnreadMessages > 0 && (
              <span className="messageUnreadBadge">
                {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
              </span>
            )}
          </div>
          <AiOutlinePlusSquare
            className="bottomIcon"
            onClick={() => setIsCreatePostOpen(true)}
            title="Create Post"
          />
          <div className="notificationNavWrapper">
            <RiNotification3Line
              className="bottomIcon"
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
              }}
              title="Notifications"
            />

            {unreadNotifications > 0 && (
              <span className="notificationUnreadBadge">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </div>
          <div
            className="bottomProfileCircle"
            onClick={() => navigate(`/profile/${userId}`)}
            title="Profile"
          >
            <img
              src={
                userPic && userPic !== "undefined" && userPic !== ""
                  ? userPic
                  : navProfile
              }
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
