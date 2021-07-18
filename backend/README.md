# short-list-supplier App - Backend

The short-list-supplier app backend consists of the following main components:

1. Node API
2. MongoDB database

### How to setup development environment

#### Docker
- Clone the repository and go to folder "short-list-supplier"
- Run `docker-compose up`


---

After the server is setup, the api will be up and running at http://localhost:3001.
The API will be useable from the documentation available at http://localhost:3001/docs. The MongoDB database server will be accessible at http://127.0.0.1:27018. Once can use MongoDB compass to connect it using below connection string:

mongodb://127.0.0.1:27018/?authSource=app&readPreference=primary&appname=MongoDB%20Compass&ssl=false

---

### Available Scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `build:watch` - interactive watch mode to automatically transpile source files,
+ `lint` - lint source files and tests,
+ `test` - run tests,
+ `test:watch` - interactive watch mode to automatically re-run tests
+ `watch` - automatically restart the application when file changes in the directory are detected

