# chameleon project

> Client application for smart TVs and set-top boxes.

## Build Setup

First of all, make sure you have [Node.js and Yarn installed](https://unitedcloud.atlassian.net/wiki/display/SMARTTV/Setting+up+Node.js+and+Yarn).

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build

# run unit tests
yarn run unit

# run e2e tests
yarn run e2e

# run all tests
yarn test

# lint code in command line
yarn run lint

# create zipped packed application which is ready for tv deployment
yarn make platform web env provider path version
```

# specify platform, environment, provider, path version:
yarn run dev web prod uc v1

platforms:
  web (for development in browser)
  androidtv
  samsung
  lg

environment:
  dev
  qa
  stage
  prod

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

### Configuration

Everything should pretty much work out of the box. After running `yarn run dev` for the first time, a private config will be generated in `config/private.json`. Edit that file if you wish to customize your dev environment.
