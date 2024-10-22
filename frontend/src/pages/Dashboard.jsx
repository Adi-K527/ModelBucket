import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [createProject, setCreateProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [token, setToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getCreds = async () => {
      try {
        const cookies = document.cookie.split(";");
        let token = "";
        for (let i = 0; i < cookies.length; i++) {
          if (cookies[i].startsWith("AUTH_TOKEN")) {
            token = cookies[i].split("=")[1];
          }
        }

        setToken(token);

        const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/user/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          const data = await res.json();
          setProjects(data.data);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error(error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const checkCookieAndFetch = () => {
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      const hasCookie = cookies.some(cookie => cookie.includes('AUTH_TOKEN'));

      if (hasCookie) {
        getCreds();
      } else {
        navigate('/login');
      }
    };

    checkCookieAndFetch();
  }, [createProject, navigate]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(import.meta.env.VITE_BACKEND_URI + "/api/project/create", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          "projectname": projectName,
        }),
      });
      setCreateProject(false);
      setProjectName("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleGenerateKey = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/user/createKey", {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      setApiKey(data.key);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>

      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">My Projects</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500">You don't have any projects yet. Start by creating a new project.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="cursor-pointer bg-white shadow-md rounded-lg p-6 transition duration-300 hover:shadow-lg hover:bg-blue-50"
                onClick={() => handleProjectClick(project.project_id)}
              >
                <div className="text-xl font-semibold text-blue-600 mb-2">{project.projectname}</div>
                <p className="text-gray-600">{project.description || "No description available"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col space-y-4 items-start">
          <button
            className="bg-blue-600 text-white py-2 px-4 w-full max-w-xs rounded-md transition duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg"
            onClick={() => setCreateProject(!createProject)}
          >
            {createProject ? "Cancel" : "Create New Project"}
          </button>

          {createProject && (
            <form onSubmit={handleProjectSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 w-full max-w-xs rounded-md transition duration-300 hover:bg-green-700 shadow-md hover:shadow-lg"
              >
                Submit
              </button>
            </form>
          )}

          <button
            className="bg-gray-600 text-white py-2 px-4 w-full max-w-xs rounded-md transition duration-300 hover:bg-gray-700 shadow-md hover:shadow-lg"
            onClick={handleGenerateKey}
          >
            Generate API Key
          </button>
        </div>

        {apiKey && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <p className="text-sm font-mono text-gray-800">{apiKey}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
