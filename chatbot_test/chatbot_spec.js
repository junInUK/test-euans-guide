var chatBot = require('../models/chatbot.js')
var assert = require('assert')

// chatbot.js switch statement tests - for Jun to do

describe('chatbot messaging logic tests', function () {
  beforeEach(function () {
    chatbot = new chatBot()
    receivedMessage = {}
  });

  // write unit tests here in the form of "it should do something..."
  it('has a sample test', function () {
    assert.equal(true, true)
  })

  it('sets currentQuestion to stop when user types stop', function () {
    receivedMessage.text = "Stop"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "stop")
  })

  it('sets currentQuestion to account when user clicks Review on the hello question', function () {
    chatbot.currentQuestion = "hello"
    receivedMessage.text = "Review"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "account")
  })

  it('sets currentQuestion to chat when user clicks Chat on the hello question', function () {
    chatbot.currentQuestion = "hello"
    receivedMessage.text = "Chat"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "chat")
  })

  it('sets currentQuestion to account when user clicks Start a new review on the chat question', function () {
    chatbot.currentQuestion = "chat"
    receivedMessage.text = "Start a new review"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "account")
  })

  it('sets currentQuestion to chat2 when user does not click Start a new review on the chat question', function () {
    chatbot.currentQuestion = "chat"
    receivedMessage.text = "Something else"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "chat2")
  })

  it('sets currentQuestion to stop-end when user clicks End chat on the chat2 question', function () {
    chatbot.currentQuestion = "chat2"
    receivedMessage.text = "End chat"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "stop-end")
  })

  it('sets currentQuestion to new-user when user clicks No on the account question', function () {
    chatbot.currentQuestion = "account"
    receivedMessage.text = "No"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "new-user")
  })

  it('sets currentQuestion to username when user clicks Yes on the account question', function () {
    chatbot.currentQuestion = "account"
    receivedMessage.text = "Yes"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "username")
  })

});

// question.js tests - for Matthew to do

describe('chatbot messaging response tests', function () {
  beforeEach(function () {
    chatbot = new chatBot()
    receivedMessage = {}
  });

  // write unit tests here in the form of "it should do something..."
  it('has a sample test', function () {
    assert.equal(true, true)
  })

  it('returns correct response text when currentQuestion is account', function () {
    chatbot.currentQuestion = "chat"
    receivedMessage.text = "Start a new review"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestionData.text.includes("Euan's Guide account"), true)
  })

});
