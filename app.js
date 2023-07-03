//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const homeStartingContent = "Unlock the secrets of the written word, with our literary expressions website, where metaphors and similes dance, and prose takes flight like a bird. Explore the depths of language's might, and discover a world that's magically bright!";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride('_method'));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true });

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res) {
  try {
    const posts = await Post.find({});
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  } catch (err) {
    console.error(err);
  }
});

app.get("/compose", function(req, res) {
  res.render("compose", { title: "", content: "" });
});

app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
    });
});

app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId })
    .then(post => {
      res.render("post", {
        title: post.title,
        content: post.content,
        _id: post._id  // Pass the _id property to the template
      });
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.findByIdAndDelete(requestedPostId)
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/posts/:postId/edit", function(req, res) {
  const requestedPostId = req.params.postId;
  console.log(requestedPostId);
  Post.findOne({ _id: requestedPostId })
    .then(post => {
      res.render("compose", {
        title: post.title,
        content: post.content,
        postId: post._id,
        editMode: true
      });
    })
    .catch(err => {
      console.log(err);
    });
  Post.findByIdAndDelete(requestedPostId)
  .then(() => {
    console.log("deleted");
  })
  .catch(err => {
    console.log(err);
  });  
});


app.post("/posts/:postId/edit", function(req, res) {
  const postId = req.params.postId;
  console.log(postId);
  const updatedTitle = req.body.postTitle;
  const updatedContent = req.body.postBody;

    Post.findByIdAndUpdate(
    postId,
    { title: updatedTitle, content: updatedContent },
    { new: true }
    ).then(updatedPost => {
      console.log("Post updated:", updatedPost);
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
    });
});

app.get("/about", function(req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function(req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

