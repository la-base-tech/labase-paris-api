const fs = require('fs');
const config = require('./base.json');
const productionConfig = require('./production.json');

const name = process.argv[2];
const team = process.argv[3];
const branch = process.argv[4];

if (!team) {
  throw new Error('"team" arg is missing');
}

if (!branch) {
  throw new Error('"branch" arg is missing');
}

console.log(`Generate config for branch "${branch}" and team ${team}`);

config.alias = [];

// Add production alias
if (branch === 'master') {
  config.alias.push(`${name}-production-${team}`);
  Object.assign(config.env, productionConfig.env);
} else if (branch !== 'dev') {
  // Add staging alias
  if (branch === 'develop') {
    config.alias.push(`${name}-develop-${team}`);
  }
  Object.assign(config.env, stagingConfig.env);
}

// Generate file
const data = JSON.stringify(config, null, 2);
fs.writeFile('./now.json', data, err => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log('Config generated');
});
