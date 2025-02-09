import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { VscGitCommit, VscSourceControl } from "react-icons/vsc";
import { FiClock, FiUsers, FiGitBranch, FiRefreshCw } from "react-icons/fi";
import axios from "axios";

const CommitsPage = () => {
  const [commits, setCommits] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("master");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { projectId } = useParams();

  const fetchCommits = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`http://localhost:4000/api/commit/getCommits/${projectId}`);
      
      if (response.data.success && Array.isArray(response.data.commit)) {
        const formattedCommits = response.data.commit.map(commit => ({
          id: commit.id,
          content: commit.content || 'No message',
          date: new Date().toISOString(),
        }));
        setCommits(formattedCommits);
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
      setCommits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, []);

  const handleRevert = async (commitId) => {
    try {
      await axios.delete("/api/commit/revert", {
        data: { commitId }
      });
      fetchCommits();
    } catch (error) {
      console.error("Error reverting commit:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VscSourceControl className="w-8 h-8 text-blue-400 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Commit History
            </h1>
          </div>
          <button
            onClick={fetchCommits}
            className={`p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110 ${refreshing ? 'animate-spin' : ''}`}
          >
            <FiRefreshCw className="w-5 h-5 text-blue-400" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 group">
            <FiGitBranch className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-2 
                focus:border-blue-500 focus:outline-none transition-all duration-300
                hover:border-gray-600"
            >
              <option value="master">master</option>
              <option value="develop">develop</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 group">
              <FiUsers className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <select
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value)}
                className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-2 
                  focus:border-blue-500 focus:outline-none transition-all duration-300
                  hover:border-gray-600"
              >
                <option value="all">All users</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-bounce">
              <VscGitCommit className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {commits.map((commit, index) => (
              <div
                key={commit.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 p-6 rounded-xl
                  transform transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50
                  animate-fadeIn hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <VscGitCommit className="w-5 h-5 text-blue-400 transform transition-transform duration-300 group-hover:rotate-180" />
                      <p className="font-medium text-lg">{commit.content}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiClock className="w-4 h-4" />
                      {new Date(commit.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRevert(commit.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg
                      transition-all duration-300 hover:bg-red-500 hover:text-white
                      transform hover:scale-105 focus:outline-none focus:ring-2 
                      focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Revert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitsPage;
