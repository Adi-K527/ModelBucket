import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Grafana = () => {
  const { projID, modelID } = useParams();
  console.log(projID, modelID)
  const [token, setToken] = useState("");
  const [grafanaUrl, setGrafanaUrl] = useState("")

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

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/project/${projID}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          const data = await res.json();
          
          for (let i = 0; i < data.modelData.length; i++) {
            if (data.modelData[i].id === modelID) {
              const url = data.modelData[i].model_url
              console.log('https://' + url.split('/')[2] + ':4000')
              setGrafanaUrl("http://116.203.226.4:4000/public-dashboards/4e5fe3661e2d484eb26d8e4e06a9b6de")
            }
          }

          console.log(data)

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
  }, []);

  //const grafanaUrl = "http://116.203.226.4:4000/public-dashboards/4e5fe3661e2d484eb26d8e4e06a9b6de";  "http://116.203.226.4:4000/api/search?type=dash-db"
 
  return (
    <div style={{
      width: '100vw',      // Full viewport width
      height: '100vh',     // Full viewport height
      display: 'flex',     // Flexbox for centering
      alignItems: 'center',  // Vertically center the iframe
      justifyContent: 'center',  // Horizontally center the iframe
      margin: 0,           // Remove margins
      padding: 0,          // Remove padding
      overflow: 'hidden'   // Hide overflow to avoid scrollbars
    }}>
      <iframe
        src={grafanaUrl}
        target="_parent"
        style={{
          width:  '100%',     // Full width of the container
          height: '100%',    // Full height of the container
          border: 'none'     // Remove iframe border
        }}
        title="Grafana Dashboard"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>
  );
};

export default Grafana;
