import React from 'react';

const Grafana = () => {
  // Use the view-only URL or kiosk mode for embedding
  const grafanaUrl = "http://localhost:3000/public-dashboards/97b93325ca884113bb822f548f1a779b";

  return (
    <div style={{
      width: '90vw',      // Adjust width to be 90% of viewport width
      height: '90vh',     // Adjust height to be 90% of viewport height
      margin: '5vh auto', // Center the container and add vertical margin
      padding: 0,         // Remove padding if needed
      overflow: 'hidden', // Hide overflow to avoid scrollbars
      display: 'flex',    // Center the iframe within the container
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <iframe
        src={grafanaUrl}
        style={{
          width: '100%',     // Make iframe full width of the container
          height: '100%',    // Make iframe full height of the container
          border: 'none'     // Remove iframe border
        }}
        title="Grafana Dashboard"
        // Optional: Add sandbox attribute to further restrict iframe functionality
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>
  );
};

export default Grafana;
