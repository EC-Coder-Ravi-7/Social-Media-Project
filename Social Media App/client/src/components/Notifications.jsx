import React, { useContext, useEffect, useState } from "react";
import "../styles/Notifications.css";
import { RxCross2 } from "react-icons/rx";
import { GeneralContext } from "../context/GeneralContextProvider";
import navProfile from "../images/nav-profile.avif";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Notifications = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    socket,
    clearUnreadNotifications,
  } = useContext(GeneralContext);

  const navigate = useNavigate();

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const past = new Date(timestamp);

    const diffInSeconds = Math.max(
      0,
      Math.floor((now - past) / 1000)
    );

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(
      diffInSeconds / 60
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(
      diffInMinutes / 60
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(
      diffInHours / 24
    );

    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return past.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const [notifications, setNotifications] = useState(
    () => {
      const saved = localStorage.getItem(
        "socialx_notifications"
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(
            "Failed to parse notifications:",
            e
          );
        }
      }

      return [
        {
          id: 1,
          user: "SocialeX",
          userPic: navProfile,
          action:
            "welcome to the community!",
          createdAt: new Date().toISOString(),
        },
      ];
    }
  );

  /*
   * Save notifications locally
   */
  useEffect(() => {
    localStorage.setItem(
      "socialx_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  /*
   * Mark notification badge as read
   * whenever notification panel is opened.
   */
  useEffect(() => {
    if (isNotificationsOpen) {
      clearUnreadNotifications();
    }
  }, [
    isNotificationsOpen,
    clearUnreadNotifications,
  ]);

  /*
   * Receive new notifications.
   */
  useEffect(() => {
    if (!socket) return;

    const handleIncomingNotif = (notif) => {
      setNotifications((prev) => [
        {
          id:
            notif.id ||
            `${Date.now()}-${Math.random()}`,
          type: notif.type,
          followerId: notif.followerId,
          user:
            notif.user ||
            notif.senderName ||
            "Someone",
          userPic:
            notif.userPic ||
            navProfile,
          action:
            notif.action ||
            notif.text ||
            "interacted with your post",
          createdAt:
            notif.createdAt ||
            new Date().toISOString(),

          /*
           * This value will be corrected by
           * fetch-my-following below.
           */
          isFollowingBack:
            Boolean(notif.isFollowingBack),
        },
        ...prev,
      ]);
    };

    socket.on(
      "new-notification",
      handleIncomingNotif
    );

    socket.on(
      "notification-received",
      handleIncomingNotif
    );

    return () => {
      socket.off(
        "new-notification",
        handleIncomingNotif
      );

      socket.off(
        "notification-received",
        handleIncomingNotif
      );
    };
  }, [socket]);

  /*
   * Get the CURRENT following list from backend.
   *
   * This is the important part:
   *
   * If I already follow Ravi:
   *      Following
   *
   * If I don't follow Ravi:
   *      Follow Back
   */
  useEffect(() => {
    if (!socket) return;

    const handleMyFollowing = ({
      following,
    }) => {
      const followingSet = new Set(
        (following || []).map((id) =>
          String(id)
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => {
          if (
            notification.type !== "FOLLOW" ||
            !notification.followerId
          ) {
            return notification;
          }

          return {
            ...notification,
            isFollowingBack:
              followingSet.has(
                String(
                  notification.followerId
                )
              ),
          };
        })
      );
    };

    socket.on(
      "my-following-fetched",
      handleMyFollowing
    );

    /*
     * Fetch immediately when component loads.
     */
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("_id");

    if (userId) {
      socket.emit("fetch-my-following", {
        userId,
      });
    }

    return () => {
      socket.off(
        "my-following-fetched",
        handleMyFollowing
      );
    };
  }, [socket]);

  /*
   * Refresh following state whenever
   * notification panel is opened.
   *
   * This also handles:
   *
   * Unfollow → Follow
   *
   * and keeps the button correct.
   */
  useEffect(() => {
    if (
      !socket ||
      !isNotificationsOpen
    ) {
      return;
    }

    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("_id");

    if (!userId) return;

    socket.emit("fetch-my-following", {
      userId,
    });
  }, [
    socket,
    isNotificationsOpen,
  ]);

  /*
   * Follow Back
   */
  const handleFollowBack = async (
    notificationId,
    followerId
  ) => {
    try {
      const userId =
        localStorage.getItem("userId") ||
        localStorage.getItem("_id");

      if (!userId || !followerId) {
        console.error(
          "Missing userId or followerId"
        );
        return;
      }

      const res = await axios.post(
        "http://localhost:6001/toggleFollowUser",
        {
          userId,
          targetId: followerId,
        }
      );

      if (
        res.status === 200 &&
        res.data.isFollowing
      ) {
        /*
         * Immediately update UI.
         */
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  isFollowingBack: true,
                }
              : notification
          )
        );

        /*
         * Ask backend for the real current
         * following list.
         */
        socket.emit(
          "fetch-my-following",
          {
            userId,
          }
        );
      }
    } catch (err) {
      console.error(
        "Failed to follow back:",
        err
      );
    }
  };

  if (!isNotificationsOpen) {
    return null;
  }

  return (
    <div
      className="igNotifOverlay"
      onClick={() =>
        setIsNotificationsOpen(false)
      }
    >
      <div
        className="igNotifContainer"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="igNotifHeader">
          <h3>Notifications</h3>

          <RxCross2
            className="igNotifCloseIcon"
            onClick={() =>
              setIsNotificationsOpen(false)
            }
          />
        </div>

        <div className="igNotifList">
          <span className="igNotifSectionTitle">
            Recent
          </span>

          {notifications.map((n) => (
            <div
              className="igNotifItem"
              key={n.id}
              onClick={() => {
                if (n.followerId) {
                  setIsNotificationsOpen(
                    false
                  );

                  navigate(
                    `/profile/${n.followerId}`
                  );
                }
              }}
              style={{
                cursor: n.followerId
                  ? "pointer"
                  : "default",
              }}
            >
              <img
                src={
                  n.userPic || navProfile
                }
                alt={
                  n.user || "User"
                }
                className="igNotifAvatar"
              />

              <div className="igNotifText">
                <p>
                  <b>{n.user}</b>{" "}
                  {n.action}
                </p>

                <span className="igNotifTime">
                  {getRelativeTime(
                    n.createdAt
                  )}
                </span>

                {n.type === "FOLLOW" &&
                  n.followerId && (
                    <button
                      className={
                        n.isFollowingBack
                          ? "notificationFollowingBtn"
                          : "notificationFollowBackBtn"
                      }
                      onClick={(e) => {
                        e.stopPropagation();

                        if (
                          !n.isFollowingBack
                        ) {
                          handleFollowBack(
                            n.id,
                            n.followerId
                          );
                        }
                      }}
                    >
                      {n.isFollowingBack
                        ? "Following"
                        : "Follow Back"}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;