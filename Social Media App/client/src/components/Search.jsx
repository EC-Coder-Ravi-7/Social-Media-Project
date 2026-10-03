import React from 'react'
import '../styles/SearchContainer.css';
import { useNavigate } from 'react-router-dom';
import navProfile from '../images/nav-profile.avif';

const Search = ({ searchedUser, setSearchedUser }) => {
  const navigate = useNavigate();

  return (
    <div className="searchContainer">

      {searchedUser && (
        <div
          className="searchedUserInfo"
          onClick={() => {
            navigate(`/profile/${searchedUser._id}`);
            setSearchedUser();
          }}
        >
          <img
            src={searchedUser.profilePic || navProfile}
            alt={searchedUser.username}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = navProfile;
            }}
          />

          <div className="searchedUserChatInfo">
            <span>{searchedUser.username}</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default Search;