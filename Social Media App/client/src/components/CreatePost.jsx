import React, { useContext, useState } from 'react';
import '../styles/CreatePosts.css';
import { RxCross2 } from 'react-icons/rx';
import { BsImages } from 'react-icons/bs';
import { GeneralContext } from '../context/GeneralContextProvider';
import navProfile from '../images/nav-profile.avif';
import axios from 'axios';

const CreatePost = () => {
  const { isCreatePostOpen, setIsCreatePostOpen } = useContext(GeneralContext);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState('photo');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const userPic = localStorage.getItem('profilePic');

  if (!isCreatePostOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFileType(selectedFile.type.startsWith('video') ? 'video' : 'photo');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setDescription('');
    setLocation('');
    setIsCreatePostOpen(false);
  };

  const handleUploadPost = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an image or video to post');

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('userName', username);
      formData.append('userPic', userPic || '');
      formData.append('description', description);
      formData.append('location', location);
      formData.append('fileType', fileType);
      formData.append('postFile', file);

      const res = await axios.post('http://localhost:6001/createPost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201 || res.status === 200) {
        setIsLoading(false);
        handleClose();
        window.location.reload();
      }
    } catch (err) {
      console.error('Post creation error:', err);
      alert('Failed to upload post. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="igCreatePostOverlay" onClick={handleClose}>
      <div
        className="igCreatePostModal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="igModalHeader">
          <button type="button" className="igModalCloseBtn" onClick={handleClose}>
            <RxCross2 />
          </button>
          <h3>Create new post</h3>
          <button
            type="button"
            className="igModalShareBtn"
            onClick={handleUploadPost}
            disabled={!file || isLoading}
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="igModalContent">
          {!preview ? (
            /* Upload Initial Placeholder */
            <div className="igUploadPlaceholder">
              <BsImages className="igUploadMediaIcon" />
              <p>Select photos and videos from your device</p>
              <label htmlFor="igFileInput" className="igSelectBtn">
                Select from device
              </label>
              <input
                id="igFileInput"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            /* Preview & Details Editor */
            <div className="igEditorContainer">
              <div className="igMediaPreviewPane">
                {fileType === 'photo' ? (
                  <img src={preview} alt="Post preview" className="igPreviewMedia" />
                ) : (
                  <video src={preview} controls className="igPreviewMedia" />
                )}
              </div>

              <div className="igDetailsPane">
                <div className="igUserRow">
                  <img
                    src={userPic && userPic !== 'undefined' && userPic !== '' ? userPic : navProfile}
                    alt=""
                    className="igUserAvatar"
                  />
                  <span className="igUsername">{username}</span>
                </div>

                <textarea
                  className="igCaptionInput"
                  placeholder="Write a caption..."
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <input
                  type="text"
                  className="igLocationInput"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;