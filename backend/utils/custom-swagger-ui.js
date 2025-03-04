const swaggerJsDoc = require('swagger-jsdoc');

const createSwaggerDocs = (options) => {
  return swaggerJsDoc(options);
};

const createCustomSwaggerUI = (swaggerDocs) => {
  return {
    serve: (req, res, next) => next(),
    setup: (req, res) => {
      const html = generateSwaggerHTML(swaggerDocs);
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    }
  };
};

const generateSwaggerHTML = (swaggerDocs) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>API Documentation</title>
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

module.exports = {
  createSwaggerDocs,
  createCustomSwaggerUI,
  generateSwaggerHTML
};