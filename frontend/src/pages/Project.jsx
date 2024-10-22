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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {model.deploymenttype === 'TIER 2' ? (
                      <div>
                        <a href={`/model-dashboard/${id}/${model.id}`} className="text-blue-500 hover:underline">
                          {model.modelname}
                        </a>
                      </div>) : (
                      <div>
                        {model.modelname}
                      </div>
                    )}

                  </td>
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
            <form onSubmit={handleModelSubmit} className="mt-6 bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Model Name</label>
                <input
                  type="text"
                  placeholder="Enter model name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>

              <div className="mb-6">
                <span className="block text-gray-700 font-semibold mb-2">Model Tier</span>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setModelTier("TIER 1")}
                    className={`flex-1 p-4 rounded-lg border-2 transition duration-200 ${
                      modelTier === "TIER 1"
                        ? "bg-blue-500 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    TIER 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelTier("TIER 2")}
                    className={`flex-1 p-4 rounded-lg border-2 transition duration-200 ${
                      modelTier === "TIER 2"
                        ? "bg-blue-500 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    TIER 2
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200 shadow-md hover:shadow-lg"
              >
                Submit
              </button>
            </form>

          )}
        </div>
      </section>
    </div>
  );
};

export default Project;
