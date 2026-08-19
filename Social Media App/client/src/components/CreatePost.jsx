import React, { useContext, useState } from 'react';
import '../styles/CreatePosts.css';
import { RxCross2 } from 'react-icons/rx';
import { GeneralContext } from '../context/GeneralContextProvider';
import axios from 'axios';

const CreatePost = () => {
  const { isCreatPostOpen, setIsCreatePostOpen } = useContext(GeneralContext);

  const [postType, setPostType] = useState('photo');
  const [postDescription, setPostDescription] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePostUpload = async (e) => {
    if (e) e.preventDefault();

    if (!postFile) {
      alert('Please choose a file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      // Build FormData payload
      const formData = new FormData();
      formData.append('postFile', postFile);
      formData.append('userId', localStorage.getItem('userId'));
      formData.append('userName', localStorage.getItem('username'));
      formData.append('userPic', localStorage.getItem('profilePic') || '');
      formData.append('fileType', postType);
      formData.append('description', postDescription);
      formData.append('location', postLocation);

      const res = await axios.post('http://localhost:6001/createPost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 201 || res.status === 200) {
        setPostDescription('');
        setPostLocation('');
        setPostFile(null);
        setIsUploading(false);
        setIsCreatePostOpen(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Post upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div
      className="createPostModalBg"
      style={isCreatPostOpen ? { display: 'contents' } : { display: 'none' }}
    >
      <div className="createPostContainer">
        <RxCross2 className="closeCreatePost" onClick={() => setIsCreatePostOpen(false)} />
        <h2 className="createPostTitle">Create post</h2>
        <hr className="createPostHr" />

        <div className="createPostBody">
          <form onSubmit={handlePostUpload}>
            <select
              className="form-select"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>

            <div className="uploadBox">
              <input
                type="file"
                name="postFile"
                id="uploadPostFile"
                accept={postType === 'photo' ? 'image/*' : 'video/*'}
                onChange={(e) => setPostFile(e.target.files[0])}
                required
              />
            </div>

            <div className="form-floating mb-3 authFormInputs descriptionInput">
              <input
                type="text"
                className="form-control descriptionInput"
                id="floatingDescription"
                placeholder="Description"
                onChange={(e) => setPostDescription(e.target.value)}
                value={postDescription}
                required
              />
              <label htmlFor="floatingDescription">Description</label>
            </div>

            <div className="form-floating mb-3 authFormInputs postLocation">
              <input
                type="text"
                className="form-control postLocation"
                id="floatingLocation"
                placeholder="Location"
                onChange={(e) => setPostLocation(e.target.value)}
                value={postLocation}
              />
              <label htmlFor="floatingLocation">Location</label>
            </div>

            {isUploading ? (
              <button type="button" disabled>
                Uploading to Cloudinary...
              </button>
            ) : (
              <button type="submit">Upload</button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;