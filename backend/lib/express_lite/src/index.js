const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const url = require("url");
const crypto = require("crypto");
const fsSync = require("fs");
const {
  getMimeType,
  findRoute,
  bodyParser,
  jsonParser,
  urlencodedParser,
  cors,
} = require("./utils");

class MyExpress {
  #server = null;
  #routes = [];
  #middleware = [];
  #errorMiddleware = [];
  #staticDir = null;

  constructor() {
    this.#server = http.createServer(this.#handleRequest.bind(this));
    this.#server.on("error", this.#handleServerError);
  }

  static(urlPath, dirPath, options = {}) {
    this.#staticDir = dirPath; // Store for SPA fallback
    const serveStatic = this.#createStaticMiddleware(urlPath, dirPath, options);
    this.use("/", serveStatic);
  }

  get = (url, ...cb) => this.route("GET", url, ...cb);
  post = (url, ...cb) => this.route("POST", url, ...cb);
  put = (url, ...cb) => this.route("PUT", url, ...cb);
  patch = (url, ...cb) => this.route("PATCH", url, ...cb);
  delete = (url, ...cb) => this.route("DELETE", url, ...cb);
  head = (url, ...cb) => this.route("HEAD", url, ...cb);
  options = (url, ...cb) => this.route("OPTIONS", url, ...cb);
  trace = (url, ...cb) => this.route("TRACE", url, ...cb);
  connect = (url, ...cb) => this.route("CONNECT", url, ...cb);
  all = (url, ...cb) => {
    const methods = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
      "TRACE",
      "CONNECT",
    ];
    methods.forEach((method) => this.route(method, url, ...cb));
  };

  route = (method, url, ...handlers) => {
    this.#routes.push({ method, url, handlers: handlers.flat() });
  };

  listen = (port, url, cb) => {
    this.#server.listen(port, url, cb);
  };

  // Private methods
  #handleServerError = (error) => {
    console.error("Server error:", error);
  };

  #addMiddleware = (path, middleware) => {
    if (middleware.length === 4) {
      this.#errorMiddleware.push({ path, middleware });
    } else {
      this.#middleware.push({ path, middleware });
    }
  };

  #handleRequest = async (req, res) => {
    this.#setupRequest(req);
    this.#setupResponse(res);

    await this.#executeMiddleware(req, res);
  };

  use(path, ...handlers) {
    if (typeof path === "function") {
      handlers = [path, ...handlers];
      path = "/";
    }

    // Check for routers (looking for getRoutes method or router property)
    const router = handlers.find(
      (h) => h.router || h.getRoutes || h.routes || h.stack
    );

    if (router) {
      // If it's a router, extract its routes
      const routes =
        router.routes || (router.router && router.router.routes) || [];

      if (routes.length) {
        // Add each route with the proper prefix
        for (const route of routes) {
          const fullPath = this.#combinePaths(path, route.path || route.url);
          console.log(`Adding route from router: ${route.method} ${fullPath}`);
          this.#routes.push({
            method: route.method,
            url: fullPath,
            handlers: route.handlers,
          });
        }
      } else if (router.stack) {
        // Handle Express Router objects which have a stack
        this.#handleExpressRouter(path, router);
      }
    }

    // Handle regular middleware
    for (const middleware of handlers) {
      if (typeof middleware === "function") {
        this.#addMiddleware(path, middleware);
      }
    }

    return this;
  }

  #combinePaths(prefix, routePath) {
    if (prefix === "/") return routePath;
    if (routePath === "/") return prefix;

    // Ensure prefix doesn't end with slash and route path starts with slash
    prefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
    routePath = routePath.startsWith("/") ? routePath : "/" + routePath;

    return prefix + routePath;
  }

  #handleExpressRouter(prefix, router) {
    if (!router.stack) return;

    for (const layer of router.stack) {
      if (layer.route) {
        // It's a route
        const route = layer.route;
        const path = this.#combinePaths(prefix, route.path);

        for (const method in route.methods) {
          if (route.methods[method]) {
            console.log(
              `Adding Express route: ${method.toUpperCase()} ${path}`
            );
            this.#routes.push({
              method: method.toUpperCase(),
              url: path,
              handlers: route.stack.map((s) => s.handle),
            });
          }
        }
      } else if (layer.name === "router" && layer.handle.stack) {
        // It's a nested router
        const nestedPrefix = this.#combinePaths(prefix, layer.regexp.source);
        this.#handleExpressRouter(nestedPrefix, layer.handle);
      }
    }
  }

  #setupRequest = (req) => {
    const protocol = req.connection?.encrypted ? "https" : "http";
    const host = req.headers.host || "localhost";

    const parsedUrl = new URL(req.url, `${protocol}://${host}`);

    req.pathname = parsedUrl.pathname;
    req.path = parsedUrl.pathname;

    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    req.searchParams = parsedUrl.searchParams;

    req.ip =
      req.socket?.remoteAddress || req.connection?.remoteAddress || "127.0.0.1";

    req.body = {};
  };

  #setupResponse = (res) => {
    res.status = (code) => this.#setStatus(res, code);
    res.sendFile = (filepath, options = {}) =>
      this.#sendFile(res, filepath, options);
    res.send = (data) => this.#sendResponse(res, data);
    res.json = (data) => this.#jsonResponse(res, data);
    res.set = (header, value) => {
      res.setHeader(header, value);
    };
  };

  #createStaticMiddleware = (urlPath, dirPath, options) => {
    return async (req, res, next) => {
      try {
        const filePath = this.#resolveStaticFilePath(req, dirPath);
        await this.#serveStaticFile(res, filePath, options);
      } catch (error) {
        if (error.code === "ENOENT") return next();
        console.error("Static middleware error:", error);
        this.#sendErrorResponse(res, 500);
      }
    };
  };

  #resolveStaticFilePath = (req, dirPath) => {
    return req.url === "/" || req.url === ""
      ? path.join(process.cwd(), dirPath, "index.html")
      : path.join(process.cwd(), dirPath, req.url);
  };

  #serveStaticFile = async (res, filePath, options) => {
    const stat = await fs.stat(filePath);
    if (stat.isFile()) this.#sendFile(res, filePath, options);
    else throw new Error("Not a file");
  };

  #executeMiddleware = async (req, res) => {
    let middlewareIndex = 0;

    const next = async (error) => {
      if (res.writableEnded) return;

      if (error) return this.#executeErrorMiddleware(error, req, res, next);

      if (middlewareIndex < this.#middleware.length) {
        const { path, middleware } = this.#middleware[middlewareIndex++];
        await this.#handleMiddleware(req, res, next, path, middleware);
      } else {
        await this.#processRequest(req, res);
      }
    };
    await next();
  };

  #handleMiddleware = async (req, res, next, path, middleware) => {
    if (req.pathname.startsWith(path)) {
      try {
        await new Promise((resolve) => {
          middleware(req, res, (err) => {
            if (err) next(err);
            else resolve();
          });
        });
        await next();
      } catch (error) {
        next(error);
      }
    } else {
      await next();
    }
  };

  #executeErrorMiddleware = async (err, req, res, next) => {
    for (const { path, middleware } of this.#errorMiddleware) {
      if (req.url.startsWith(path)) {
        try {
          await middleware(err, req, res, next);
          if (res.writableEnded) return;
        } catch (newErr) {
          err = newErr;
        }
      }
    }
    if (!res.writableEnded) this.#sendErrorResponse(res, 500);
  };

  #processRequest = async (req, res) => {
    const routeMatch = findRoute(this.#routes, req);

    if (!routeMatch) {
      await this.#handleUnmatchedRoute(req, res);
      return;
    }

    req.params = { ...routeMatch.params };

    // Add hash to req if you want to use it
    if (routeMatch.hash) {
      req.hash = routeMatch.hash;
    }

    await this.#handleMatchedRoute(routeMatch, req, res);
  };

  #handleUnmatchedRoute = async (req, res) => {
    if (this.#staticDir) {
      const fallbackPath = path.join(
        process.cwd(),
        this.#staticDir,
        "index.html"
      );
      try {
        await this.#serveStaticFile(res, fallbackPath, {});
      } catch {
        this.#sendNotFoundResponse(res);
      }
    } else {
      this.#sendNotFoundResponse(res);
    }
  };

  #handleMatchedRoute = async (routeMatch, req, res) => {
    try {
      await this.#executeRouteHandlers(routeMatch, req, res);
    } catch (error) {
      await this.#executeErrorMiddleware(error, req, res, () => {});
    }
  };

  #executeRouteHandlers = async (route, req, res) => {
    let handlerIndex = 0;
    const next = async (error) => {
      if (error) return this.#executeErrorMiddleware(error, req, res, () => {});

      const handler = route.handlers[handlerIndex++];
      if (handler) await handler(req, res, next);
    };
    await next();
  };

  #setStatus = (res, code) => {
    res.statusCode = code;
    return res;
  };

  #sendFile = async (res, filePath, options = {}) => {
    const mimeType = options.mimeType || getMimeType(filePath); // Use custom MIME type if provided
    res.setHeader("Content-Type", mimeType);

    if (options.maxAge) {
      res.setHeader("Cache-Control", `public, max-age=${options.maxAge}`);
    }

    try {
      const fileHandle = await fs.open(filePath, "r");
      fileHandle.createReadStream().pipe(res);
    } catch (error) {
      console.error("Error serving file:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  };

  #sendResponse = (res, data) => {
    if (typeof data === "object") return this.#jsonResponse(res, data);

    res.setHeader("Content-Type", "text/plain");
    res.end(data);
  };

  #jsonResponse = (res, data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };

  #sendErrorResponse = (res, code) => {
    res.writeHead(code, { "Content-Type": "text/plain" });
    res.end(http.STATUS_CODES[code]);
  };

  #sendNotFoundResponse = (res) => {
    this.#sendErrorResponse(res, 404);
  };
  static json(options = {}) {
    return jsonParser;
  }

  static urlencoded(options = {}) {
    return urlencodedParser(options);
  }

  static cors(options = {}) {
    return cors(options);
  }
}

module.exports = { MyExpress, jsonParser, urlencodedParser };
