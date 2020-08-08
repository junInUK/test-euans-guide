require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
fetch = require("node-fetch"),

// *** ADDITIONAL FILES *** //

questions = require("./additional/questions"),

/****************************/

api_key = process.env.MAILGUN_ACTIVE_API_KEY,
domain = process.env.MAILGUN_DOMAIN,
fs = require('fs'),
mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
request = require('request');
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3({region: 'eu-west-2'});

class chatBot {
  constructor (userId) {
    this.userId = userId;
    this.userAnswers = {};
    this.currentQuestion = "";
    this.currentQuestionData = null;
    this.place = "";
    this.rating = "";
    this.covid_confident = "";
    this.images = [];
    this.submitAllowed = false;
    this.photosLater = false;
    this.stop_question = "";
    this.tempAnswer = {};
    this.imgUrls = [];
    this.attachments = [];
    this.imgCounter = 0;
  }

  // *** MESSAGE HANDLER ASSISTING METHODS *** //

  reset() {
    if (this.userAnswers["username"])
      this.tempAnswer["username"] = this.userAnswers["username"];
    else if (this.userAnswers["new-user"])
      this.tempAnswer["new-user"] = this.userAnswers["new-user"];
      this.userAnswers = this.tempAnswer;
      this.tempAnswer = {};
      this.images = [];
      this.submitAllowed = false;
      this.photosLater = false;
      this.stop_question = "";
      this.imgUrls = [];
      this.attachments = [];
      this.imgCounter = 0;
  }

  setStartPoint() {
    if (this.isEmpty(this.userAnswers))
      this.currentQuestion = "account";
    else
      this.currentQuestion = "visited";
  }

  isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  checkSkip(message) {
    return message.text.slice(0, 4) === "Skip";
  }

  isARatingNumber(text) {
    return (!isNaN(text)) && (text >= 0) && (text <= 5);
  }

  handleAttachment(received_message) {
    let attachment_url = received_message.attachments[0].payload.url;
    this.images.push(attachment_url);
    console.log("IMAGES:", this.images);
    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Is this the right picture?",
            subtitle: "Tap a button to answer.",
            image_url: attachment_url,
            buttons: [{
                type: "postback",
                title: "Yes",
                payload: "yes"
              },
              {
                type: "postback",
                title: "No",
                payload: "no"
              }
            ]
          }]
        }
      }
    }
  }

  endReview() {
    this.currentQuestion = "end";
    console.log("endReview userAnswers:", this.userAnswers)
    let promises = this.images.map(url => this.UploadFromUrlToS3(url))
    Promise.all(promises)
      .then((data) => {
        console.log("DATATATATA:", data)
        this.sendEmail(this.userAnswers)
      })
    // this.reset();
  }

  /************************************/

  // *** PRIMARY MESSAGE HANDLER *** //

  handleMessage(received_message) {
    if (received_message.is_echo === true) {
      return null;
    } else if (received_message.text && received_message.text.toLowerCase() === "stop") {
      this.stop_question = this.currentQuestion;
      this.currentQuestion = "user-stop";
    } else if (received_message.text && received_message.text.toLowerCase() === "submit" && this.submitAllowed) {
      this.currentQuestion = "user-submit";
    }

    let attachment_response = null;

    // SWITCH STATEMENT CONTAINING RESPONSE LOGIC

    switch (this.currentQuestion) {
      case "hello":
        if (received_message.text === "Review")
          this.currentQuestion = "account";
        // change image ^^ to account - just for testing we did that
        else if (received_message.text === "Chat")
          this.currentQuestion = "chat";
        break;
      case "chat":
        if (received_message.text === "Start a new review") {
          this.reset();
          this.currentQuestion = "account";
        } else {
          this.sendChatEmail(received_message.text);
          this.currentQuestion = "chat2";
        }
        break;
      case "chat2":
        if (received_message.text === "End chat") {
          this.currentQuestion = "stop-end"
        }
        break;
      case "account":
        if (received_message.text.includes("No"))
          this.currentQuestion = "new-user";
        else
          this.currentQuestion = "username";
        break;
      case "username":
      case "new-user": this.currentQuestion = "visited";
        break;
      case "visited":
        this.place = received_message.text;
        this.currentQuestion = "city";
        break;
      case "city":
        this.currentQuestion = "date-of-visit";
        break;
      case "date-of-visit":
        this.currentQuestion = "user-needs";
        break;
      case "user-needs":
        this.currentQuestion = "image";
        break;
      case "image":
      case "image2":
        if (["Upload photos now", "Yes"].includes(received_message.text))
          this.currentQuestion = "upload-image";
        else if (this.photosLater) {
          this.endReview();
          this.currentQuestion = "end";
        }
        else {
          if (received_message.text.includes("later")) {
            this.photosLater = true;
            questions.changeShowUpload();
          }
          this.currentQuestion = "title";
        }
        break;
      case "upload-image":
        if (received_message.attachments) {
          attachment_response = this.handleAttachment(received_message);
        }
        break;
      case "title": this.currentQuestion = "overall-rating";
        break;
      case "overall-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "overall-summary";
        }
        break;
      case "overall-summary": this.currentQuestion = "continue-or-finish";
        break;
      case "continue-or-finish":
        this.submitAllowed = true;
        if (received_message.text === "Add more information")
          this.currentQuestion = "transport";
        else
          this.endReview();
        break;
      case "transport":
        if (this.checkSkip(received_message))
          this.currentQuestion = "access-skip";
        else
          this.currentQuestion = "transport-rating";
        break;
      case "transport-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "transport-summary";
        }
        break;
      case "transport-summary": this.currentQuestion = "access";
        break;
      case "access":
        if (this.checkSkip(received_message))
          this.currentQuestion = "toilet-skip";
        else
          this.currentQuestion = "access-rating";
        break;
      case "access-skip":
        if (this.checkSkip(received_message))
          this.currentQuestion = "toilet-skip";
        else
          this.currentQuestion = "access-rating";
        break;
      case "access-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "access-summary";
        }
        break;
      case "access-summary": this.currentQuestion = "toilet";
        break;
      case "toilet":
        if (this.checkSkip(received_message))
          this.currentQuestion = "staff-skip";
        else
          this.currentQuestion = "toilet-rating";
        break;
      case "toilet-skip":
        if (this.checkSkip(received_message))
          this.currentQuestion = "staff-skip";
        else
          this.currentQuestion = "toilet-rating";
        break;
      case "toilet-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "toilet-summary";
        }
        break;
      case "toilet-summary": this.currentQuestion = "staff";
        break;
      case "staff":
        if (this.checkSkip(received_message))
          this.currentQuestion = "covid-confident";
        else
          this.currentQuestion = "staff-rating";
        break;
      case "staff-skip":
        if (this.checkSkip(received_message))
          this.currentQuestion = "covid-confident";
        else
          this.currentQuestion = "staff-rating";
        break;
      case "staff-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "staff-summary";
        }
        break;
      case "staff-summary": this.currentQuestion = "covid-confident";
        break;
      case "covid-confident":
        if (this.checkSkip(received_message))
          this.currentQuestion = "anything-else";
        else
          this.covid_confident = received_message.text;
        this.currentQuestion = "anything-else";
        break;
      case "anything-else":
        if (this.photosLater)
          this.currentQuestion = "image-last";
        else
          this.endReview();
        break;
      case "image-last":
        if (received_message.text.slice(0, 6) === "Submit")
          this.endReview();
        else
          this.currentQuestion = "upload-image";
        break;
      case "user-stop": this.currentQuestion = "stop";
        break;
      case "stop":
        if (received_message.text === "Continue my review") {
          this.currentQuestion = this.stop_question;
        }
        else if (received_message.text === "Submit my review") {
          if (this.submitAllowed) {
            this.endReview()
          }
          else {
            this.currentQuestion = "stop-end";
          }
        }
        else if (received_message.text === "Abandon my review") {
          this.currentQuestion = "stop-end";
        }
        break;
      case "end":
      case "stop-end":
        if (received_message.text === "Chat to us") {
          this.reset();
          this.currentQuestion = "chat";
        } else {
          this.reset();
          this.setStartPoint();
        }
        break;
      case "user-submit": this.endReview();
        break;
    }

    if (attachment_response != null)
      this.currentQuestionData = attachment_response;
    else
      this.currentQuestionData = questions.getQuestionData(this.currentQuestion, this.place, this.rating);

    this.callSendAPI(this.currentQuestionData);
  };

  /******************************************/

  // *** PRIMARY POSTBACK HANDLER *** //

  handlePostback(received_postback) {
    let response;
    let payload = received_postback.payload;

    if (payload === "Get Started") {
      response = questions.getQuestionData("hello");
      this.currentQuestion = "hello";
    } else if (payload === "yes") {
      response = questions.getQuestionData("image2");
      this.currentQuestion = "image2";
    } else if (payload === "no") {
      this.images.pop();
      response = {text: "Please try to submit the image again."};
    }
    // Send the message to acknowledge the postback
    // setCurrentQuestion(response);
    this.callSendAPI(response);
  }

  /*************************************/

  callSendAPI(response) {
    if (this.currentQuestion === "delete") {
      return null;
    }
    // Construct the message body
    let request_body = {
      recipient: {
        id: this.userId
      },
      message: response
    };
    fetch( `https://graph.facebook.com/v4.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, 
        {
          method: "POST",
          body: JSON.stringify(request_body),
          headers: { 'Content-Type': 'application/json'}
        },
        (err, res, body) => {
          if (err) {
            console.error("Unable to send message:" + err);
          } else if (body.includes("recipient_id")) {
            console.log("message sent", body);
          }
        }
    );
  }

  // *** IMAGE HANDLING METHODS *** //

  urlGen(key) {
    return `https://${process.env.S3_BUCKET}.s3.eu-west-2.amazonaws.com/${key}`
  }

  UploadFromUrlToS3(url){
      const timeStamp = Date.now().toString()
      const imgKey = timeStamp + this.imgCounter + '.jpg' 
      this.imgCounter++
      this.imgUrls.push(this.urlGen(imgKey))
      console.log("IMGURLS", this.imgUrls)
    return new Promise((resolve,reject)=> {
        request({
            url: url,
            encoding: null
        }, function(err, res, body) {
            if (err){
                reject(err);
            }
            var objectParams = {
                ContentType: res.headers['content-type'],
                ContentLength: res.headers['content-length'],
                Key : imgKey,
                Bucket: process.env.S3_BUCKET,
                Body: body,
                ACL: 'public-read'
            };
            resolve(s3.putObject(objectParams, (err, data)=>{
              if (err) {
                console.log("error:",err)
              }
              if (data) {
              console.log("data:",data)
              }
            })
            .promise().then(data => console.log("putObject Promise:" , data)))
        });
    });
  }

  /**********************************/

  // *** EMAIL HANDLING METHODS *** //

  sendEmail(reviewObject) {
    console.log("REVIEW OBJECT:", reviewObject)
    let reviewAsString = JSON.stringify(reviewObject);
    reviewAsString = reviewAsString.replace(/",/g, "\n");
    reviewAsString = reviewAsString.replace(/"/g, " ");
    reviewAsString = reviewAsString.replace(/{|}|\?/g, "");
    const review = this.formatBody(reviewAsString);

    console.log("REVIEW:", review)
    const title = this.userAnswers["title"];

    const emailBody = {
      from: process.env.EMAIL_ACCOUNT,
      to: process.env.EMAIL_RECIPIENT,
      subject: "Facebook review title: " + title,
      text: review,
      attachment: this.imgUrls.map(url => request(url))
    };
    console.log("EMAIL DATA:", emailBody)
    mailgun.messages().send(emailBody, (error, body) => {
      console.log('email error: ', error)
      console.log('email body: ', body);
    });
    this.reset();
  }

  sendChatEmail(messageText){
    const data = {
      from: process.env.EMAIL_ACCOUNT,
      to: process.env.EMAIL_RECIPIENT,
      subject: "New chat message received",
      text: messageText
    };
    mailgun.messages().send(data, (error, body) => {
      console.log(body);
    });
  }

  formatBody(string) {
    const filterArray = ["hello :", "image :", "image2 :", "image-last :", "continue-or-finish :", "transport :", "access :", "access-skip :", "toilet :", "toilet-skip :", "staff :", "staff-skip :", "end :", "stop: ", "date-of-visit: ", "user-needs: ", ": Skip"];
    let formattedString = string.split("\n");

    formattedString = formattedString.filter(str => !filterArray.some(substring => str.includes(substring)));

    formattedString = formattedString.join("\n");

    return formattedString;
  }

  /********************************/

}

module.exports = chatBot;