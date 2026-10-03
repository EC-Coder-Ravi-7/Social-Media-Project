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
            src={
              searchedUser.profilePic &&
              searchedUser.profilePic !== 'undefined' &&
              searchedUser.profilePic !== ''
                ? searchedUser.profilePic
                : navProfile
            }
            alt={searchedUser.username}
            className="searchedUserPic"
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