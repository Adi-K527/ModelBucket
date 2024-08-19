import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [models,  setModels]  = useState(null);
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModel, setCreateModel] = useState(0);
  const [modelName,   setModelName]   = useState("");
  const [modelTier,   setModelTier]   = useState("");
  const [token, setToken] = useState("")

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const cookies = document.cookie.split(";")
        let token = ""
        for (let i = 0; i < cookies.length; i++) {
          if (cookies[i].startsWith("AUTH_TOKEN")) {
            token = cookies[i].split("=")[1]
          }
        }

        setToken(token)

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/project/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (res.status === 200) {
          const data = await res.json()

          setProject(data.projectData)
          setModels(data.modelData)
          setMembers(data.userData)

        } else {
          console.error('Failed to fetch project');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, createModel]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/model/create", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "modelname": modelName,
                "project_id": id,
                "deploymentType": modelTier
            }),
        });
        setCreateModel(0);
    } catch (error) {
        console.error(error);
    }
  }

  const terminateModel = async (project_id, model_id) => {
    await fetch(import.meta.env.VITE_BACKEND_URI + "/api/model/terminate", {
      method: "PUT",
      credentials: "include",
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
          "model_id":   model_id,
          "project_id": project_id,
      }),
    });
  }

  const deleteModel = async (project_id, model_id) => {
    await fetch(import.meta.env.VITE_BACKEND_URI + "/api/model/delete", {
      method: "DELETE",
      credentials: "include",
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
          "model_id":   model_id,
          "project_id": project_id,
      }),
    });
  }

  return (
    <div>
      <h1>Project {project[0].projectname}</h1>
      <hr/>
      <br/><br/>
      <h2>Models:</h2>
      <ul>
      {models.map((model, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>{model.modelname}</h3>
          <p><strong>Deployment Type:</strong> {model.deploymenttype}</p>
          <p><strong>Status:</strong> {model.state}</p>
          {model.state === "ACTIVE" && <p><strong>URL:</strong> <a href={model.model_url} target="_blank" rel="noopener noreferrer">{model.model_url}</a></p>}
          <button onClick={(e) => {e.preventDefault(); terminateModel(id, model.id)}}>TERMINATE MODEL</button>
          <button onClick={(e) => {e.preventDefault(); deleteModel(id, model.id)}}>DELETE MODEL</button>
        </div>
      ))}
      </ul>
      <br/><br/><br/>
      <button onClick={() => setCreateModel(1)}>Create new model</button>
      {createModel === 1 && (
        <div>
          <form onSubmit={handleModelSubmit}>
            <div>
              <input
                type="text"
                placeholder="Enter model name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                required
              />
              <br/>
            <label>
                <input
                  type="radio"
                  name="tier"
                  value="TIER 1"
                  checked={modelTier === "TIER 1"}
                  onChange={(e) => setModelTier(e.target.value)}
                />
                TIER 1
              </label>
              <label>
                <input
                  type="radio"
                  name="tier"
                  value="TIER 2"
                  checked={modelTier === "TIER 2"}
                  onChange={(e) => setModelTier(e.target.value)}
                />
                TIER 2 (DEVLOPMENT)
              </label>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
      <br/><br/><br/>
      <h2>Members:</h2>
      <ul>
        {members.filter(member => member.status === 'OWNER' || member.status === 'MEMBER').map((member) => (
          <div key={member.name}>
            <li>
              <p>{member.name} | {member.status}</p>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Project;
