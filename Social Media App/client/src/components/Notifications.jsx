import React, { useContext, useEffect, useState } from 'react';
import '../styles/Notifications.css';
import { RxCross2 } from 'react-icons/rx';
import { GeneralContext } from '../context/GeneralContextProvider';
import navProfile from '../images/nav-profile.avif';

const Notifications = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, socket } = useContext(GeneralContext);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.max(0, Math.floor((now - past) / 1000));

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('socialx_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        user: 'SocialeX',
        userPic: navProfile,
        action: 'welcome to the community!',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('socialx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingNotif = (notif) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          user: notif.user || notif.senderName || 'Someone',
          userPic: notif.userPic || navProfile,
          action: notif.action || notif.text || 'interacted with your post',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    };

    socket.on('new-notification', handleIncomingNotif);
    socket.on('notification-received', handleIncomingNotif);
    return () => {
      socket.off('new-notification', handleIncomingNotif);
      socket.off('notification-received', handleIncomingNotif);
    };
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
          <span className="igNotifSectionTitle">Recent</span>
          {notifications.map((n) => (
            <div className="igNotifItem" key={n.id}>
              <img src={n.userPic || navProfile} alt="" className="igNotifAvatar" />
              <div className="igNotifText">
                <p>
                  <b>{n.user}</b> {n.action}
                </p>
                <span className="igNotifTime">{getRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;