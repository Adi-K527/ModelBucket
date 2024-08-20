import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [models, setModels] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModel, setCreateModel] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelTier, setModelTier] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const cookies = document.cookie.split(";");
        let token = "";
        for (let i = 0; i < cookies.length; i++) {
          if (cookies[i].startsWith("AUTH_TOKEN")) {
            token = cookies[i].split("=")[1];
          }
        }

        setToken(token);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/project/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          const data = await res.json();
          setProject(data.projectData[0]);
          setModels(data.modelData);
          setMembers(data.userData);
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

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/model/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          "modelname": modelName,
          "project_id": id,
          "deploymentType": modelTier,
        }),
      });
      setCreateModel(false);
      setModelName("");
      setModelTier("");
    } catch (error) {
      console.error(error);
    }
  };

  const terminateModel = async (project_id, model_id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/model/terminate`, {
      method: "PUT",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "model_id": model_id,
        "project_id": project_id,
      }),
    });
    window.location.reload();
  };

  const deleteModel = async (project_id, model_id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/model/delete`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "model_id": model_id,
        "project_id": project_id,
      }),
    });
    window.location.reload();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100';
      case 'STOPPED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl font-semibold">Loading...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen text-xl font-semibold">Project not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Project: {project.projectname}</h1>
        <p className="mt-2 text-gray-600">Manage your project models, members, and more.</p>
        <hr className="mt-4" />
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Models</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-medium text-gray-700">Model Name</th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-medium text-gray-700">Deployment Type</th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-medium text-gray-700">URL</th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{model.modelname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{model.deploymenttype}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(model.state)}`}>
                      {model.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                    {model.state === 'ACTIVE' && (
                      <a href={model.model_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {model.model_url}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 mr-2"
                      onClick={() => terminateModel(id, model.id)}
                    >
                      Terminate
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={() => deleteModel(id, model.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            onClick={() => setCreateModel(true)}
          >
            Create New Model
          </button>
          {createModel && (
            <form onSubmit={handleModelSubmit} className="mt-6 bg-gray-100 p-6 rounded-lg shadow-sm">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Model Name</label>
                <input
                  type="text"
                  placeholder="Enter model name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <span className="block text-gray-700 font-medium mb-2">Model Tier</span>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tier"
                      value="TIER 1"
                      checked={modelTier === "TIER 1"}
                      onChange={(e) => setModelTier(e.target.value)}
                      className="form-radio text-blue-500"
                    />
                    <span className="ml-2 text-gray-700">TIER 1</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tier"
                      value="TIER 2"
                      checked={modelTier === "TIER 2"}
                      onChange={(e) => setModelTier(e.target.value)}
                      className="form-radio text-blue-500"
                    />
                    <span className="ml-2 text-gray-700">TIER 2 (DEVELOPMENT)</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Submit
              </button>
            </form>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Members</h2>
        <ul className="space-y-2">
          {members
            .filter(member => member.status === 'OWNER' || member.status === 'MEMBER')
            .map((member) => (
              <li key={member.name} className="p-4 border rounded-md bg-gray-100">
                <p>{member.name} | {member.status}</p>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
};

export default Project;
