const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanHash');
const Blog = mongoose.model('Blog');

const userId = '6101678586bbbf01e816bd04';
module.exports = app => {
  app.get('/api/blogs/:id', async (req, res) => {
    const blog = await Blog.findOne({
      _user: {"_id":"6101678586bbbf01e816bd04","googleId":"112972055057559510619","displayName":"Shatyaki Dutt","__v":0},
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.find({ _user: userId }).cache({  key : userId });
    res.send(blogs);
  });

  app.post('/api/blogs', cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: userId
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
