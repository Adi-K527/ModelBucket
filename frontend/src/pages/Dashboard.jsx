import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading,       setLoading]       = useState(true);
  const [createProject, setCreateProject] = useState(0);
  const [projectName,   setProjectName]   = useState("");
  const [projects, setProjects] = useState([]);
  const [token, setToken] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    const getCreds = async () => {
      try {
        const cookies = document.cookie.split(";")
        let token = ""
        for (let i = 0; i < cookies.length; i++) {
          if (cookies[i].startsWith("AUTH_TOKEN")) {
            token = cookies[i].split("=")[1]
          }
        }

        setToken(token)

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
          console.log(projects)
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
        console.log('Cookie found, fetching credentials...');
        getCreds();
      } else {
        console.log('No cookie found, redirecting to login');
        navigate('/login');
      }
    };

    checkCookieAndFetch();
  }, [createProject, navigate]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/project/create", {
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
      setCreateProject(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault()

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
    }
    catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <hr />
      <br /><br /><br />
      <h3>My Projects</h3>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <p
              onClick={() => handleProjectClick(project.project_id)}
              style={{
                cursor: 'pointer',
                display: 'inline',
                margin: 0,
                color: 'black',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => e.target.style.color = 'blue'}
              onMouseOut={(e) => e.target.style.color = 'black'}
            >
              {project.projectname}
            </p>
          </li>
        ))}
      </ul>
      <br /><br /><br />
      <button onClick={() => setCreateProject(1)}>Create new project</button>
      {createProject === 1 && (
        <div>
          <form onSubmit={handleProjectSubmit}>
            <div>
              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
      <button onClick={handleGenerateKey}>Generate Key</button>
    </div>
  );
};

export default Dashboard;
