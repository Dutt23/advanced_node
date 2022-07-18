const mongoose = require('mongoose');
const redis = require('redis');
const util =  require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

// With arrow function this, will be undefined or globalThis
// That's why function

mongoose.Query.prototype.cache = function( options = {}){
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};

  mongoose.Query.prototype.exec = async function(){
   console.log(this.useCache);
    if(!this.useCache)
    return exec.apply(this, arguments);
    // Cannot modify this.getQuery(), will modify query itself
    const cachedKey = JSON.stringify(Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    }));

    const cacheValue = await client.hget(this.hashKey, cachedKey);

    if(cacheValue) {
      console.log("FETCHED FROM CACHE")
      const doc = JSON.parse(cacheValue);
      return Array.isArray(doc) 
      ? doc.map(d => this.model(d))
      : new this.model(doc)
    }

    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, cachedKey, JSON.stringify(result), 'EX', 10);
    return result;
  }

  module.exports = {
    clearHash(key) {
      client.del(JSON.stringify(key));
    }
  }