import React, { useContext, useState } from 'react';
import '../styles/CreateStory.css';
import { RxCross2 } from 'react-icons/rx';
import { BsImages } from 'react-icons/bs';
import { GeneralContext } from '../context/GeneralContextProvider';
import axios from 'axios';

const CreateStory = () => {
  const { isCreateStoryOpen, setIsCreateStoryOpen } = useContext(GeneralContext);

  const [storyFile, setStoryFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState('photo');
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem('userId') || localStorage.getItem('_id') || '';
  const username = localStorage.getItem('username') || 'User';
  const userPic = localStorage.getItem('profilePic') || '';

  if (!isCreateStoryOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoryFile(file);
      setPreview(URL.createObjectURL(file));
      setFileType(file.type.startsWith('video') ? 'video' : 'photo');
    }
  };

  const handleClose = () => {
    setStoryFile(null);
    setPreview(null);
    setIsCreateStoryOpen(false);
  };

  const handleUploadStory = async (e) => {
    e.preventDefault();
    if (!storyFile) return alert('Please select a photo or video for your story.');

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('userName', username);
      formData.append('userPic', userPic);
      formData.append('fileType', fileType);
      formData.append('storyFile', storyFile);

      const res = await axios.post('http://localhost:6001/createStory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200 || res.status === 201) {
        setIsLoading(false);
        handleClose();
        window.location.reload();
      }
    } catch (err) {
      console.error('Story upload failed:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to upload story. Please check server logs.');
      setIsLoading(false);
    }
  };

  return (
    <div className="igStoryModalOverlay" onClick={handleClose}>
      <div className="igStoryModalDialog" onClick={(e) => e.stopPropagation()}>
        <div className="igStoryModalHeader">
          <button type="button" className="igStoryCloseBtn" onClick={handleClose}>
            <RxCross2 />
          </button>
          <h3>Add to story</h3>
          <button
            type="button"
            className="igStoryShareBtn"
            onClick={handleUploadStory}
            disabled={!storyFile || isLoading}
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </div>

        <div className="igStoryModalBody">
          {!preview ? (
            <div className="igStoryPickerArea">
              <BsImages className="igStoryPickerIcon" />
              <p>Select photo or video for your story</p>
              <label htmlFor="storyDeviceInput" className="igStorySelectBtn">
                Select from device
              </label>
              <input
                id="storyDeviceInput"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="igStoryPreviewContainer">
              {fileType === 'photo' ? (
                <img src={preview} alt="Story preview" className="igStoryPreviewMedia" />
              ) : (
                <video src={preview} controls autoPlay className="igStoryPreviewMedia" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStory;