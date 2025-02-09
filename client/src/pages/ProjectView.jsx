import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFolder, FaFile, FaChevronRight, FaFileCode } from "react-icons/fa";
import { ThemeContext } from '@/ThemeContext';
import { Sun, Moon } from 'lucide-react';

import axios from "axios";

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [items, setItems] = useState({ folders: [], files: [] });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isFolder, setIsFolder] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    fetchProjectContents();
  }, [projectId, currentFolderId]);

  const fetchProjectContents = async () => {
    try {
      const response = await axios.get(`/projects/${projectId}/contents`, {
        params: { currentFolderId }
      });
      setProject(response.data.project);
      setItems(response.data.contents);
      
      if (response.data.currentFolder && currentFolderId) {
        const folder = response.data.currentFolder;
        if (!breadcrumb.find(b => b.id === folder._id)) {
          setBreadcrumb([...breadcrumb, { id: folder._id, name: folder.name }]);
        }
      }
    } catch (error) {
      console.error('Error fetching project contents:', error);
    }
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setIsModalClosing(false);
    }, 300);
  };

  const handleCreateItem = async () => {
    try {
      await axios.post(`/projects/${projectId}/create`, {
        name: newItemName,
        isFolder,
        currentFolderId
      });
      closeModal();
      setNewItemName('');
      fetchProjectContents();
    } catch (error) {
      console.error('Error creating item:', error);
      alert(error.response?.data?.message || 'Error creating item');
    }
  };

  const handleItemClick = (item) => {
    if (item.isFolder) {
      setCurrentFolderId(item._id);
    } else {
      navigate(`/editor/${projectId}/${item._id}`);
    }
  };

  const navigateToBreadcrumb = (index) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setBreadcrumb([]);
    } else {
      setCurrentFolderId(breadcrumb[index].id);
      setBreadcrumb(breadcrumb.slice(0, index + 1));
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <header className={`sticky top-0 z-50 backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} border-b transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2">
              <span
                className="flex items-center gap-2 text-3xl font-bold cursor-pointer transform hover:scale-105 transition-all duration-300"
                onClick={() => navigateToBreadcrumb(-1)}
              >
                <FaFolder className="w-6 h-6 text-yellow-500 animate-bounce" />
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {project?.name}
                </span>
              </span>
              {breadcrumb.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <FaChevronRight className="w-5 h-5 text-gray-400 animate-pulse" />
                  <span
                    className="flex items-center gap-2 text-xl font-semibold cursor-pointer hover:text-blue-500 transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigateToBreadcrumb(index)}
                  >
                    <FaFolder className="w-5 h-5 text-yellow-500" />
                    {folder.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
            >
              {theme === 'dark' ? 
                <Sun className="h-5 w-5" /> : 
                <Moon className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
      </header>

      <div className="flex justify-center mb-8 mt-8">
        <button
          className="group mb-4 flex items-center px-10 py-6 text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-3xl transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
          onClick={() => setShowCreateModal(true)}
        >
          <FaFileCode size={30} className="m-2 group-hover:rotate-12 transition-transform duration-300" />
          Create New
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.folders.map((folder, index) => (
            <div
              key={folder._id}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105
                animate-fadeIn border-2 hover:shadow-xl
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-500'}`}
              onClick={() => handleItemClick(folder)}
            >
              <div className="flex items-center gap-3">
                <FaFolder className="w-6 h-6 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
                <h3 className="font-bold text-lg">{folder.name}</h3>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Folder</p>
            </div>
          ))}
          {items.files.map((file, index) => (
            <div
              key={file._id}
              style={{ animationDelay: `${(items.folders.length + index) * 100}ms` }}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105
                animate-fadeIn border-2 hover:shadow-xl
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-500'}`}
              onClick={() => handleItemClick(file)}
            >
              <div className="flex items-center gap-3">
                <FaFile className="w-6 h-6 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                <h3 className="font-bold text-lg">{file.name}</h3>
              </div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>File</p>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300
            ${isModalClosing ? 'opacity-0' : 'opacity-100'}`}
          onClick={closeModal}
        >
          <div 
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl w-96 shadow-2xl
              transform transition-all duration-300 ${isModalClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            onClick={e => e.stopPropagation()}
          >
            <h2 className={`text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
              Create New Item
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Name"
                className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:scale-[1.02]
                  ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
              />
              <label className={`flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isFolder}
                    onChange={(e) => setIsFolder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500 
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full ${
                      theme === 'dark' ? 'bg-gray-600 peer-checked:bg-blue-500' : 'bg-gray-300 peer-checked:bg-blue-600'
                    }`}
                  />
                </div>
                Is Folder
              </label>
              <div className="flex justify-end gap-4">
                <button
                  className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105
                    ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg
                    transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={handleCreateItem}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;