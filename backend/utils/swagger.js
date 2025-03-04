const swaggerJsDoc = require('swagger-jsdoc');

exports.setupSwagger = (port) => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'TaskFlow API',
        version: '1.0.0',
        description: 'API documentation for the TaskFlow task management application',
        contact: {
          name: 'API Support',
          email: 'support@taskflow.com'
        }
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://production.com/api' 
            : `http://localhost:${port}/api`,
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
        }
      ]
    },
    apis: ['./routes/*.js', './models/*.js', './swagger-docs.js']
  };

  return swaggerJsDoc(swaggerOptions);
};

exports.generateSwaggerHTML = (swaggerDocs) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>TaskFlow API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.5.0/swagger-ui.css" />
      <style>
        body {
          margin: 0;
          background: #fafafa;
        }
        #swagger-ui {
          margin: 0 auto;
          max-width: 1460px;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerDocs)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            validatorUrl: null
          });
        };
      </script>
    </body>
    </html>
  `;
};
