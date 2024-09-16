import React from 'react';

const Grafana = () => {
  // Use the view-only URL or kiosk mode for embedding
  const grafanaUrl = "http://116.203.226.4:3000/public-dashboards/40f332fc82d240298d2c3618eb761ab0";

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
