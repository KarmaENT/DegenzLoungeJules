import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaFile, FaFilePdf, FaFileWord, FaFileAlt, FaCheck, FaTimes } from 'react-icons/fa';
import './DocumentUploader.css';

const DocumentUploader = ({ repositoryId, onClose, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    // Filter for allowed file types
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'text/csv', 'application/json'];
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.csv', '.json'];
    
    const validFiles = newFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(file.type) || allowedExtensions.includes(extension);
    });
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Initialize progress and status for each file
    const initialProgress = {};
    const initialStatus = {};
    files.forEach((file, index) => {
      initialProgress[index] = 0;
      initialStatus[index] = 'uploading';
    });
    setUploadProgress(initialProgress);
    setUploadStatus(initialStatus);
    
    // Upload each file
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadFile(files[i], i);
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error);
        setUploadStatus(prev => ({
          ...prev,
          [i]: 'error'
        }));
      }
    }
    
    // After all uploads, wait a moment then call the completion handler
    setTimeout(() => {
      onUploadComplete();
    }, 1500);
  };

  const uploadFile = async (file, index) => {
    // In a real implementation, this would use the actual API
    // Simulate upload progress
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('repository_id', repositoryId);
      
      // Simulate upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        setUploadProgress(prev => ({
          ...prev,
          [index]: Math.floor(progress)
        }));
        
        if (progress === 100) {
          clearInterval(interval);
          setUploadStatus(prev => ({
            ...prev,
            [index]: 'success'
          }));
          resolve();
        }
      }, 500);
      
      // Simulate random failure (10% chance)
      if (Math.random() < 0.1) {
        setTimeout(() => {
          clearInterval(interval);
          setUploadStatus(prev => ({
            ...prev,
            [index]: 'error'
          }));
          reject(new Error('Upload failed'));
        }, 2000);
      }
    });
  };

  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />;
      case 'docx':
      case 'doc':
        return <FaFileWord className="file-icon docx" />;
      case 'txt':
      case 'md':
      case 'csv':
      case 'json':
        return <FaFileAlt className="file-icon txt" />;
      default:
        return <FaFile className="file-icon" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheck className="status-icon success" />;
      case 'error':
        return <FaTimes className="status-icon error" />;
      default:
        return null;
    }
  };

  return (
    <div className="document-uploader-overlay">
      <div className="document-uploader-modal">
        <div className="modal-header">
          <h3>Upload Documents</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div 
          className="drop-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <FaUpload className="upload-icon" />
          <p>Drag and drop files here, or click to select files</p>
          <p className="file-types">Supported formats: PDF, DOCX, TXT, MD, CSV, JSON</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
            accept=".pdf,.docx,.txt,.md,.csv,.json"
          />
        </div>
        
        {files.length > 0 && (
          <div className="file-list">
            <h4>Selected Files</h4>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  {getFileIcon(file)}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                
                {uploading ? (
                  <div className="upload-progress-container">
                    <div 
                      className="upload-progress-bar"
                      style={{ width: `${uploadProgress[index] || 0}%` }}
                    ></div>
                    <span className="upload-progress-text">
                      {uploadStatus[index] === 'uploading' ? `${uploadProgress[index] || 0}%` : ''}
                      {getStatusIcon(uploadStatus[index])}
                    </span>
                  </div>
                ) : (
                  <button 
                    className="remove-file-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="modal-footer">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            className="upload-button"
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
