import React, { useEffect, useState } from 'react';

const AdBanner = ({ dataKey, width, height }) => {
  const [adCode, setAdCode] = useState('');

  useEffect(() => {
    setAdCode(`
      <html>
        <head>
          <style>body { margin: 0; padding: 0; overflow: hidden; background: transparent; display: flex; justify-content: center; align-items: center; }</style>
        </head>
        <body>
          <script>
            atOptions = {
              'key' : '${dataKey}',
              'format' : 'iframe',
              'height' : ${height},
              'width' : ${width},
              'params' : {}
            };
          </script>
          <script src="https://www.highperformanceformat.com/${dataKey}/invoke.js"></script>
        </body>
      </html>
    `);
  }, [dataKey, width, height]);

  if (!adCode) return <div style={{ width, height, margin: '0 auto', background: 'rgba(0,0,0,0.05)' }}></div>;

  return (
    <div className="adsterra-banner-container" style={{ width: width, height: height, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
      <iframe
        title={`ad-${dataKey}`}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        srcDoc={adCode}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        style={{ border: 'none', overflow: 'hidden' }}
      ></iframe>
    </div>
  );
};

export default AdBanner;
