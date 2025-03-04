const path = require("path");
const querystring = require("querystring");
const { Writable } = require('stream');
const url = require("url");


const getMimeType = (filePath) => {
  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".xml": "application/xml",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".ico": "image/x-icon",
    ".zip": "application/zip"
  };
  return contentTypes[ext] || "application/octet-stream";
};

function findRoute(routes, req) {
  // Extract the pathname and search from the request
  const [urlWithoutHash, hash] = req.url.split('#');
  const [pathname, search] = urlWithoutHash.split('?');
  
  // Extract query parameters
  const query = Object.fromEntries(new URLSearchParams(search || ''));

  for (const route of routes) {
    if (route.method === req.method) {
      const routeParts = route.url.split("/");
      const urlParts = pathname.split("/");

      if (routeParts.length === urlParts.length) {
        const params = {};
        let match = true;

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(":")) {
            params[routeParts[i].slice(1)] = decodeURIComponent(urlParts[i]);
          } else if (routeParts[i] !== urlParts[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          return { 
            ...route, 
            params,
            query,
            hash: hash || undefined
          };
        }
      }
    }
  }
  return null;
}

async function bodyParser(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    writable.on('finish', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers["content-type"];
      
      try {
        if (contentType === "application/json") {
          resolve(JSON.parse(body.toString()));
        } else if (contentType === "application/x-www-form-urlencoded") {
          resolve(querystring.parse(body.toString()));
        } else {
          resolve(body);
        }
      } catch (error) {
        reject(error);
      }
    });

    writable.on('error', reject);

    req.pipe(writable);
  });
}

function parseQueryString(req) {
  const parsedUrl = url.parse(req.url, true);
  return parsedUrl.query;
}

function urlencodedParser(options = {}) {
  const defaultOptions = {
    extended: false,
    limit: 1024 * 1024 // 1MB default
  };

  const parserOptions = { ...defaultOptions, ...options };

  return (req, res, next) => {
    const contentType = req.headers['content-type'];

    if (
      contentType?.includes('application/x-www-form-urlencoded') &&
      !contentType.startsWith('multipart/form-data') &&
      !contentType.startsWith('video/')
    ) {
      let body = '';
      let receivedBytes = 0;

      req.on('data', (chunk) => {
        receivedBytes += chunk.length;
        
        // Check size limit
        if (receivedBytes > parserOptions.limit) {
          const error = new Error('Request entity too large');
          error.status = 413;
          next(error);
          req.destroy(); // Terminate the request
          return;
        }
        
        body += chunk.toString();
      });

      req.on('end', () => {
        if (req.destroyed) return; // Skip if request was destroyed
        
        try {
          req.body = querystring.parse(body);
          next();
        } catch (err) {
          err.status = 400;
          next(err);
        }
      });

      req.on('error', next);
    } else {
      next(); // Skip parsing for non-urlencoded requests
    }
  };
}

function jsonParser(req, res, next) {
  const contentType = req.headers['content-type'];

  if (
    contentType?.includes('application/json') &&
    !contentType.startsWith('multipart/form-data') // Skip if multipart
  ) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        next();
      } catch (err) {
        next(err);
      }
    });
  } else {
    next(); // Skip parsing for non-JSON requests
  }
}

function cors(options = {}) {
  const defaultOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false,
    allowedHeaders: 'Content-Type,Authorization'
  };

  const corsOptions = { ...defaultOptions, ...options };

  return (req, res, next) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
    
    if (corsOptions.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    if (corsOptions.exposedHeaders) {
      res.setHeader('Access-Control-Expose-Headers', corsOptions.exposedHeaders);
    }
    
    if (req.method === 'OPTIONS') {
      // Handle preflight requests
      res.setHeader('Access-Control-Allow-Methods', corsOptions.methods);
      res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders);
      
      // Set max age if provided
      if (corsOptions.maxAge) {
        res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);
      }
      
      if (!corsOptions.preflightContinue) {
        res.writeHead(corsOptions.optionsSuccessStatus);
        res.end();
        return;
      }
    }
    
    next();
  };
}

module.exports = { getMimeType, findRoute, bodyParser, parseQueryString , jsonParser, urlencodedParser, cors};
