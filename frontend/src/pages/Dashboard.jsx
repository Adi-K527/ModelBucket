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
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">My Projects</h3>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project.id}
              className="cursor-pointer text-lg font-medium text-blue-600 hover:underline"
              onClick={() => handleProjectClick(project.project_id)}
            >
              {project.projectname}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-6">
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          onClick={() => setCreateProject(!createProject)}
        >
          {createProject ? "Cancel" : "Create new project"}
        </button>
        {createProject && (
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Submit
            </button>
          </form>
        )}
        <button
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          onClick={handleGenerateKey}
        >
          Generate Key
        </button>
        {apiKey && (
          <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">
            <p className="text-sm font-mono">{apiKey}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
