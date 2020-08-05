
// *** RESPONSE LOGIC FUNCTIONS *** //

function overallResponse(rating, place) {
  if (rating < 3)
   return "Sorry to hear that, please can you tell us more about " + place + "?\n";
  else if (rating == 3)
    return "Disabled access at the " + place + " sounds ok - we're looking forward to hearing more!\n";
  else
    return "That's a great rating! People are going to love reading about " + place + "!\n"
}

function transportResponse(rating) {
  if (rating < 3)
   return "That doesn't sound great.\n";
  else if (rating == 3)
    return "That sounds like it could've been better...\n";
  else
    return "That sounds convenient!\n"
}

function accessResponse(rating) {
  if (rating < 3)
   return "That's not a good rating...\n";
  else if (rating == 3)
    return "That sounds like it could've been better...\n";
  else
    return rating + "* is a great rating!\n"
}

function toiletResponse(rating) {
  if (rating < 3)
   return "They don't sound very good\n";
  else if (rating == 3)
    return "The loos sound like they could've been better...\n";
  else
    return "Wow! They sound great! We'd love to hear some more!\n"
}

function staffResponse(rating) {
  if (rating < 4)
   return "That's useful to know...\n";
  else
    return "That's great to know!\n"
}

/******************************/

// *** CHATBOT OPTIONS *** //

function chatbotOption(title, payload) {
  return {
    content_type: "text",
    title: title,
    payload: payload
  }
}

const ratings = [
  chatbotOption("1", "one"),
  chatbotOption("2", "two"),
  chatbotOption("3", "three"),
  chatbotOption("4", "four"),
  chatbotOption("5", "five")
];

const infoOrSkip = [
  chatbotOption("Yes, add info", "add_review"),
  chatbotOption("Skip this question", "skip_question")
];

const skip = [chatbotOption("Skip this question", "skip_question")];

const start = [
  chatbotOption("Start a new review", "review"),
  chatbotOption("Chat to us", "chat")
];

const uploadPhotos = [
  chatbotOption("Skip to photo upload", "skip_question"),
  chatbotOption("Submit my review", "finish_option_question")
];

let show = false;

function changeShowUpload() {
  show = !show;
}

function showOrHideUpload() {
  return (show ? uploadPhotos : [uploadPhotos[1]]);
}

/******************************/

// *** CHATBOT QUESTIONS *** //

function getQuestionData(questionKey, place, rating) {
  const questionsData = {
    "hello": {
      text: "Hello! Thanks for clicking get started. Would you like to leave a review or chat to us?",
      quick_replies: [
        chatbotOption("Review", "review"),
        chatbotOption("Chat", "chat")
      ]
    },
    "chat": {
      text: "Great! Leave us a message and we will get back to you as soon as possible!",
      quick_replies: [chatbotOption("Start a new review", "review")]
    },
    "chat2": {
      text: "Thanks for your response.",
      quick_replies: [chatbotOption("End chat", "chat")]
    },
    "account": {
      text: "Thanks for choosing to share your experience with us, this shouldn't take too long!\n" +
      "Please can you start by telling us if you have a Euan's Guide account",
      quick_replies: [
        chatbotOption("Yes, I do", "yes"),
        chatbotOption("No, I do not", "no")
      ]
    },
    "username": {text: "Please enter your username or the associated email address so we can add this to your existing reviews."},
    "new-user": {text: "Please can you give us a username you would like us to associate with this review so that you can make changes to the review or add additional reviews at a later date from the same account. If the username is already taken we will try to assign you something similar to your request."},
    "visited": {text: "Firstly, please can you tell us the name of the place that you visited?\n" +
    "You can abandon the review at any time by typing STOP."},
    "city": {text: "Ok, great! Can you confirm which town or city " + place + " is in?"},
    "date-of-visit": {text: "And what date did you visit " + place + "?  Month and year is fine!"},
    "user-needs": {text: "Given your own personal experience, could you tell us who you think this review would be particularly useful for? For example, a wheelchair user, someone with an assistance dog, or who has experience of dementia." },
    "image": {
      text: "Do you have any photos or images you'd like to upload with your review?\n" +
      "By uploading images you agree that you are the creator and owner of the content you upload and that you are happy for the images to be used by Euan’s Guide.",
      quick_replies: [
        chatbotOption("Upload photos now", "yes"),
        chatbotOption("Upload photos later", "no"),
        chatbotOption("No photos to upload", "no")
      ]
    },
    "image2": {
      text: "Do you have any more images you'd like to share?",
      quick_replies: [
        chatbotOption("Yes", "yes"),
        chatbotOption("No", "no")
      ]
    },
    "upload-image": {text: "Great, to select an image to attach, click on the picture icon in the bottom left corner of the messenger and send it."},
    "title": {text: "Thanks! Now, what would you like to title your review? This will be the first thing people will see. \n " +
    "An example might be \"Accessible Museum in the heart of London\" or \"Great accessible cafe with delicious cakes!\""},
    "overall-rating": {
      text: "Great title! \n" +
      "\n" +
      "Now for a rating... Out of 5, where 5 is great and 1 is bad, how would you rate the disabled access overall?",
      quick_replies: ratings
    },
    "overall-summary": {text: overallResponse(rating, place) + "\nNow could you summarise your experience? \n" +
    "\n" +
    "Some things you might want to talk about include:\n\n" +
    "What did you do there?\n" +
    "What did you like about the place? \n" +
    "What wasn't quite right? \n" +
    "What made it special?"},
    "continue-or-finish": {
      text: "That's your review nearly complete! \n" +
      "\n" +
      "Some of our users do like to know some additional information before they visit. This focuses on 5 main areas:\n" +
      "\n" +
      "1) Getting there \n" +
      "2) Getting in and getting around\n" +
      "3) Toilets\n" +
      "4) Staff\n" +
      "5) COVID precautionary measures\n" +
      "These are all optional questions so if you don't have anything else to add then no problem! Would you like to finish and submit your review or add more information?\n" +
      "\n" +
      "(You can submit your review at any time simply by typing SUBMIT.)",
      quick_replies: [
        chatbotOption("Add more information", "continue_option_question"),
        chatbotOption("Finish and submit", "finish_option_question")
      ]
    },
    "transport": {
      text: "We'll start with getting there. Would you like to add any information on parking or transport?",
      quick_replies: infoOrSkip
    },
    "transport-rating": {
      text: "How would you rate the parking and transport options? (Where 5 is great and 1 is bad.)",
      quick_replies: ratings
    },
    "transport-summary": {
      text: transportResponse(rating) + "\nCould you give us some more information? Did you drive? If so, where did you park? If you travelled using public transport where was the nearest bus stop or train station?\n" +
      "What information would help others most?",
      quick_replies: skip
    },
    "access": {
      text: "Thank You! Now onto getting in and around " + place + ". Is there anything specific about Disabled Access you would like to add?",
      quick_replies: infoOrSkip
    },
    "access-skip": {
      text: "Ok, onto getting in and around " + place + ". Is there anything specific about Disabled Access you would like to add?",
      quick_replies: infoOrSkip
    },
    "access-rating": {
      text: "Ok, great! Let's start with a rating, again out of 5.",
      quick_replies: ratings
    },
    "access-summary": {
      text: accessResponse(rating) + "\nWould you be able to give any more detail on what you noticed?\n" +
      "\n" +
      "For example, do you have any comments on doors or ramps? Were there any lifts? What was the signage like? Were there any steps? Could you see everything you wanted to? Was there an induction loop? Was there any seating so you could stop and take a rest? Were there any alternative formats available such as braille, large print, easy read or BSL?",
      quick_replies: skip
    },
    "toilet": {
      text: "Thank you for taking the time to provide additional information on the disabled access at " + place + "!\n" + "\nNow, onto toilets. Our users consistently tell us how important both accessible toilets and information about toilets is. Are you able to tell us anything about the toilets at " + place + "?",
      quick_replies: infoOrSkip
    },
    "toilet-skip": {
      text: "Onto toilets. Our users consistently tell us how important both accessible toilets and information about toilets is. Are you able to tell us anything about the toilets at " + place + "?",
      quick_replies: infoOrSkip
    },
    "toilet-rating": {
      text: "Brilliant! We'd love to know more…\n Let's start with a rating…",
      quick_replies: ratings
    },
    "toilet-summary": {
      text: toiletResponse(rating) + "\nWould you be able to provide some more detail? Things to mention might include: Was there an accessible loo? How easy was it to find? Was there enough space to manoeuvre? Did it have grab rails? Was it clean and tidy? Was there space for a carer? Do you know if it was a certified Changing Places toilet?",
      quick_replies: skip
    },
    "staff": {
      text: "Thank you - that's such important information to share with people.\n" +
      "\n" +
      "Now we come to staff. Would you like to add any further information about the people you came across at " + place + "?",
      quick_replies: infoOrSkip
    },
    "staff-skip": {
      text: "Now to staff. Would you like to add any further information about the people you came across at " + place + "?",
      quick_replies: infoOrSkip
    },
    "staff-rating":  {
      text: "	Thank you! This will be the last time we ask you for a rating…",
      quick_replies: ratings
    },
    "staff-summary": {
      text: staffResponse(rating) + "\nWould you be able to tell us a bit more about the welcome you received?\n" +
      "Was there anyone who particularly who stood out? If so, what did they do to make it a memorable experience?",
      quick_replies: skip
    },
    "covid-confident": {
      text: "Did you feel 'COVID Confident' visiting this place?\n" +
      "(Please add more details about the COVID measures in the next section of the review.)",
      quick_replies: [
        chatbotOption("Yes", "yes"),
        chatbotOption("No", "no"),
        chatbotOption("Skip this question", "skip_question")
      ]
    },
    "anything-else": {
      text: "Thank you for your time!\n" +
      "Finally, please add details on any COVID precaution measures or anything else you'd like to say about your visit. Otherwise, just hit submit!",
      quick_replies: showOrHideUpload()
    },
    "image-last": {
      text: "Now is your final chance to upload any photos or images you took at " + place + ". Images are an important way of letting people see what a venue is like before they vist.\n" +
      "By uploading images you agree that you are the creator and owner of the content you upload and that you are happy for the images to be used by Euan’s Guide.",
      quick_replies: [
        chatbotOption("Upload photos", "yes"),
        chatbotOption("Submit my review", "finish_option_question")
      ]
    },
    "end": {
      text: "Thank you for taking the time to leave your review! We'll send you a message when it has gone live!",
      quick_replies: start
    },
    "stop": {
      text: "It looks like you want to stop writing a review. Is that correct? Please confirm what action you’d like to take.",
      quick_replies: [
        chatbotOption("Continue my review", "continue"),
        chatbotOption("Submit my review", "submit"),
        chatbotOption("Abandon my review", "abandon")
      ]
    },
    "stop-end": {
      text: "Thank you for your time. Is there anything else you’d like to do while you are here?",
      quick_replies: start
    },
    "delete": {text: "Uh oh. Something's went wrong. Try deleting the chat and starting again. Sorry!"}
  };
  return questionsData[questionKey];
}

/******************************/

module.exports = {getQuestionData, changeShowUpload};