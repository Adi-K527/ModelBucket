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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/project/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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

  return (
    <div>
      <h1>Project {project[0].projectname}</h1>
      <hr/>
      <br/><br/>
      <h2>Models:</h2>
      <ul>
        {models.map((model) => (
            <div>
                <li>
                    <p>{model.modelname} | {model.deploymenttype}</p>
                </li>
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
              <label style={{ color: 'grey' }}>
                <input
                  type="radio"
                  name="tier"
                  value="TIER 2"
                  checked={modelTier === "TIER 2"}
                  onChange={(e) => setModelTier(e.target.value)}
                  disabled
                />
                TIER 2 (Coming Soon)
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
