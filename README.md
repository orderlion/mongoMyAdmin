<p align="center">
  <img src="public/images/logo_white_bg.png" width="320" />
</p>

# mongoMyAdmin

We all loved phpMyAdmin, didn't we?

Here is your go to **admin frontend for your mongoDB** for the 21st century!

## Setup:

Nothing fancy ... if you know your way around [nextjs](https://nextjs.org/), it should all seem pretty familiar. We are already using next' new "app router" (as of June 2023).

- Initial Setup: `git clone https://github.com/orderlion/mongoMyAdmin.git`
- Install packages: `yarn install`
- Make sure that your mondoDB is running
- Update your `mongoMyAdmin.config.js` file accordingly (or make sure to set the `MONGO_URL` env var)
- ???
- Profit!

## Usage:

Very straightforward. You can pass the `MONGO_URL` either as environment variable or define it in the config file: `mongoMyAdmin.config.js`.

```sh
MONGO_URL="mongodb://localhost:27017/yourdb" yarn run dev
```

If you want to run in even quicker production mode, just run:

```sh
MONGO_URL="mongodb://localhost:27017/yourdb" yarn run build
MONGO_URL="mongodb://localhost:27017/yourdb" yarn run start
```

At the moment, the config file `mongoMyAdmin.config.js` (in root) only supports 2 options, but we are planning to extend this in the future.

```js
{
  mongoUrl: String // instead of passing the MONGO_URL as env variable, just put your connection string here.
  excludeCollections: [String] // Array of collection names which should be hidden in the UI - useful to hide "internal collections".
}
```

## Docker usage:

Of course, first make sure that docker is properly setup on your machine. We prepared some helper functions for you:

```sh
yarn run docker-build
MONGO_URL="mongodb://localhost:27017/yourdb" yarn run docker-run
```

We are automatically replacing `localhost` in your mongoDb connection string with `172.17.0.1` (your host's local IP to access it from inside the docker container).

Please make sure to add `172.17.0.1` to your `bindIp` setting inside your [`mongod.conf` file](https://www.mongodb.com/docs/manual/reference/configuration-options/).

Without this setting, you will not be able to connect to your host's mongoDB instance from inside the container.

If you want to use **`docker-compose.yml`**, a simple usage might look a bit like this:

```yml
version: "3"
services:

  # ... all your other services go here!

  mongomyadmin:
    build:
      context: ./path/to/your/mongoMyAdmin
      args: 
        # We need the MONGO_URL also as ARG at build time
        - MONGO_URL=mongodb://user:password@host.mongodb.net/yourdb
    container_name: mongomyadmin
    environment:
      # the actual MONGO_URL used at run time
      - MONGO_URL=mongodb://user:password@host.mongodb.net/yourdb
    restart: unless-stopped
```

---
# But why? (Features)

<img src="public/images/butwhy.gif" width="320" />

We checked pretty much *all* solutions out there, but not a single one covered our use case:

- proper quick pagination
- easy to use JSON query and JSON doc editor (Monaco)
- auto-repairs JSONs with missing quotation marks
- can be self-hosted
- can be dockerized
- easy to modify
- uses up-to-date techstack including mondern `mongodb` driver
- can handle big collections including proper counts/pagination
- can directly link to single documents via their `_id` (in the url)

---
### Screenshots

<p align="left">
  <img src="public/screenshots/collection.png" width="320" /> <img src="public/screenshots/document.png" width="320" />
</p>

---

### Planned upcoming features

- CRUD indexes
- change page size of pagination
- support for multiple dbs

---

Have fun! Made with ❤️ in Vienna, by <a href="https://orderlion.com" target="_blank">Orderlion</a>.