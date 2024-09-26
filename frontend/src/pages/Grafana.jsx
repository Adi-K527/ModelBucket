import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Grafana = () => {
  const grafanaUrl = "http://116.203.226.4:3000/d/bdyzo1dntbd34c/model-dashboard?theme=light";  

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
