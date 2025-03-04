class Router {
    constructor() {
      this.routes = [];
      this.middleware = [];
      
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
      methods.forEach(method => {
        this[method] = (path, ...handlers) => {
          this.routes.push({
            method: method.toUpperCase(),
            path,
            handlers: handlers.flat()
          });
          return this;
        };
      });
    }
    
    use(path, middleware) {
      if (typeof path === 'function') {
        middleware = path;
        path = '/';
      }
      
      this.middleware.push({ path, middleware });
      return this;
    }

    getRoutes() {
      return this.routes;
    }
    
    getMiddleware() {
      return this.middleware;
    }
  }
  
  module.exports = Router;