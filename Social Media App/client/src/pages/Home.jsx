import React from 'react';
import '../styles/Home.css';
import Navbar from '../components/Navbar';
import Stories from '../components/Stories';
import Post from '../components/Post';

const Home = () => {
  return (
    <div className="homePage">
      <Navbar />
      <div className="homeFeedWrapper">
        <Stories />
        <Post />
      </div>
    </div>
  );
};

export default Home;