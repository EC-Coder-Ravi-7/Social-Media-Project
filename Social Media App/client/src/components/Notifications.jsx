import React, { useContext, useEffect, useState } from 'react';
import '../styles/Notifications.css';
import { RxCross2 } from 'react-icons/rx';
import { GeneralContext } from '../context/GeneralContextProvider';
import navProfile from '../images/nav-profile.avif';

const Notifications = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, socket } = useContext(GeneralContext);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      user: 'ravi_7',
      userPic: navProfile,
      action: 'liked your post',
      time: '2h ago',
    },
    {
      id: 2,
      user: 'SocialeX',
      userPic: navProfile,
      action: 'welcome to the community!',
      time: '1d ago',
    },
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('new-notification', handleIncomingNotif);
    return () => socket.off('new-notification', handleIncomingNotif);
  }, [socket]);

  if (!isNotificationsOpen) return null;

  return (
    <div className="igNotifOverlay" onClick={() => setIsNotificationsOpen(false)}>
      <div className="igNotifContainer" onClick={(e) => e.stopPropagation()}>
        <div className="igNotifHeader">
          <h3>Notifications</h3>
          <RxCross2
            className="igNotifCloseIcon"
            onClick={() => setIsNotificationsOpen(false)}
          />
        </div>

        <div className="igNotifList">
          <span className="igNotifSectionTitle">This Week</span>
          {notifications.map((n) => (
            <div className="igNotifItem" key={n.id}>
              <img src={n.userPic || navProfile} alt="" className="igNotifAvatar" />
              <div className="igNotifText">
                <p>
                  <b>{n.user}</b> {n.action}
                </p>
                <span className="igNotifTime">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;