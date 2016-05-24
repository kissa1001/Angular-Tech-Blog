var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  tags: String,
  upvotes: {type: Number, default: 0},
  date: { type : String, default: new Date().toUTCString() },
  content: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

PostSchema.methods.downvote = function (cb) {
  this.upvotes -= 1;
  this.save(cb);
};
mongoose.model('Post', PostSchema);