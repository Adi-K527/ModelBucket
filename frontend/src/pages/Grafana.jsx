import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Grafana = () => {
  const [grafanaUrl, setGrafanaURL] = useState("")
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const { project_id, model_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getCreds = async () => {
      try {
        const cookies = document.cookie.split(";").map(cookie => cookie.trim());
        let auth_token = cookies.find(cookie => cookie.startsWith("AUTH_TOKEN="));
        if (auth_token) {
          auth_token = auth_token.split("=")[1];
          setToken(auth_token);
        } else {
          navigate('/login');
          return;
        }
  
        const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/user/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth_token}`,
          },
        });
  
        if (res.status !== 200) {
          navigate('/login');
        }
      } catch (error) {
        console.error(error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
  
    const fetchURL = async () => {
      const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/model/" + project_id + "/" + model_id, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      setGrafanaURL(data.data[0].dashboard_url);
    };
  
    const checkCookieAndFetch = () => {
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      const hasCookie = cookies.some(cookie => cookie.startsWith('AUTH_TOKEN='));
  
      if (hasCookie) {
        getCreds();
      } else {
        navigate('/login');
      }
    };
  
    checkCookieAndFetch();
  
    if (token) {
      fetchURL();
    }
  }, [navigate, project_id, model_id, token]);
  
  
  return (
    <div style={{
      width: '100vw',     
      height: '100vh',     
      display: 'flex',     
      alignItems: 'center', 
      justifyContent: 'center', 
      margin: 0,  
      padding: 0,      
      overflow: 'hidden'
    }}>
      <iframe
        src={grafanaUrl}
        target="_parent"
        style={{
          width:  '100%',  
          height: '100%', 
          frameBorder:"0"
        }}
        title="Grafana Dashboard"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>
  );
};

export default Grafana;
