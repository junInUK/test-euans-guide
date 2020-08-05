var chatBot = require('../models/chatbot.js')
var assert = require('assert')

describe('chatbot', function () {
  beforeEach(function () {
    chatbot = new chatBot()
    receivedMessage = {}
  });

  // write unit tests here in the form of "it should do something..."
  it('it has a sample test', function(){
    assert.equal(true, true)
  })

  it('Sets currentQuestion to stop when user types stop', function(){
    receivedMessage.text = "Stop"
    chatbot.handleMessage(receivedMessage)
    assert.equal(chatbot.currentQuestion, "stop")
  })

});
