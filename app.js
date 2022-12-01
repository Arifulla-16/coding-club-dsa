//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://harshak02:jntucse1234@cluster0.sttwkrc.mongodb.net/QuestionDB", {useNewUrlParser: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var topicName;

const CommentSchema = {
  name : String,
  rollNo : String,
  content : String
}

const Comment = mongoose.model("Comment",CommentSchema);

const QuestionSchema = {
  name : String,
  link : String,
  hint : String,
  topic : String,
  diff : Number,
  solution : String,
  state : Number,
  discussions : [CommentSchema]
}

const Question = mongoose.model("Question",QuestionSchema);

app.get("/", function(req, res){

  Question.find(function(err,QuestionDetails){
    if(err){
      console.log(err);
    }
    QuestionDetails.sort((s1,s2)=>s1.diff-s2.diff);
    res.render("home",{
      TopicName : topicName,
      Questions : QuestionDetails
    })
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){

  var diff = req.body.qDiff;
  var name = req.body.qName;
  var hint = req.body.hint;
  var link = req.body.hLink;
  var topic = req.body.qTopic;
  var qSol = req.body.qSol;
  var qState = req.body.qState;
  topicName = topic;

  const newQuestion = new Question({
    name : name,
    link : link,
    hint : hint,
    topic : topic,
    diff : diff,
    solution : qSol,
    state : qState
  });

  newQuestion.save(function(err){
    if(!err){
      res.redirect("/");
    }
  });

});

app.get("/post/:topicQ",function(req,res){
  
  var flag  = 0;
  var num = 0;

  Question.find(function(err,ques){
    if(err){
      console.log(err);
    }
    else{
      for(var i = 0;i<ques.length;i++){
        if( _.lowerCase(req.params.topicQ) == _.lowerCase(ques[i].name)){
          flag = 1; 
          num = i;
          break;
        }
      }
    
      if(flag==1){
        res.render("post",{que : ques[num]});
      }
      else{
        res.redirect("/");
      }
    }
  });
});

app.get("/commentPre",function(req,res){
  
});

app.post("/commentPre",function(req,res){
  var currQues = req.body.quesName;
  Question.findOne({name : currQues},function(err,foundList){
    res.render("comment",{
      Comments : foundList.discussions
    });
  });
});

app.post("/commentCreate",function(req,res){
  var currQues = req.body.quesName;
  var yName = req.body.yName;
  var yRoll = req.body.yRoll;
  var yComment = req.body.yComment;
  const newComment = new Comment({
    name : yName,
    rollNo : yRoll,
    content : yComment
  }); 
  Question.findOneAndUpdate({name : currQues},{$push : {discussions : newComment}},function(err,foundList){
    res.redirect("/post/"+currQues);  
  });
});

app.post("/homePrevious",function(req,res){
  
  Question.find(function(err,QuestionDetails){
    if(err){
      console.log(err);
    }
    QuestionDetails.sort((s1,s2)=>s1.state-s2.state);
    res.render("homePrev",{
      TopicName : "Last Weeks Questions : ",
      Questions : QuestionDetails
    });
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
