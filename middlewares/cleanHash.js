const { clearHash }  = require('../services/cache')

const userId = '6101678586bbbf01e816bd04';

module.exports = async (req, res, next) =>{
  await next();

  // Get user id from req.user.id
  clearHash(userId);
}