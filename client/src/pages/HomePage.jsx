import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '@/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { VscGitCommit } from "react-icons/vsc";
import axios from 'axios';

const HomePage = () => {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [isFolder, setIsFolder] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:4000/projects/list');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/projects/create', {
                name: newProjectName,
                isFolder
            });
            setNewProjectName('');
            setIsFormVisible(false);
            fetchProjects();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const handleNavigate = (projectId, event) => {
        event.stopPropagation();
        navigate(`/commit/${projectId}`);
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} border-b transition-all duration-300`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                            CodeCollab
                        </h1>
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

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Create Project Button */}
                <div className="mb-8">
                    <button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        <span className={`transform transition-transform duration-300 ${isFormVisible ? 'rotate-45' : ''}`}>+</span>
                        New Project
                    </button>
                </div>

                {/* Create Project Form */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className={`p-6 rounded-xl mb-8 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="Enter project name..."
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 transform hover:scale-[1.01] ${
                                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
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
                                    <span className="ml-3">Create as folder</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                            >
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <div
                            key={project._id}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className={`${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                            } rounded-xl shadow-lg p-6 cursor-pointer 
                            hover:shadow-xl transition-all duration-300 transform hover:scale-105
                            hover:border-blue-500 border-2 border-transparent
                            animate-fadeIn relative`}
                            onClick={() => navigate(`/project/${project._id}`)}
                        >
                            <button 
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                onClick={(event) => handleNavigate(project._id, event)}
                            >
                                <VscGitCommit className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                            </button>
                            <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {project.isFolder ? 'Folder' : 'File'}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomePage;