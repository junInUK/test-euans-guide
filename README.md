## Euan's Guide Chat Bot.
A Facebook chatbot for the charity Euan's Guide to help users leave reviews through Facebook as well as their website. The bot sends the user questions for the review as messages takes the responses then emails them to a given email address.

### Connecting to Heroku.
Switching Github account: After forking project:
In Heroku, click account settings (top right corner) => applications => revoke access, then add new github account

Deploying using Heroku: In Heroku, click deploy tab and check application is connected to github.
You can use 'manual deploy' to deploy any branch in your repository. Please don't rely on automatic deploy to master like the group before us, keep development to develop branch!

When testing, console logs and other useful information will appear in the Heroku console (on the right, <view more> => view logs).

Don't expect the "open app" button to do anything, the bot lives on Facebook.

Heroku will wipe all local app files every deploy and also every 24 hours.

#### Make sure the config vars are updated so that the access keys are pointing to the correct email, AWS bucket and Mailgun.

### Facebook for developers
You will need to access 'Facebook for Developers' to access the Euan's Guide app and add Facebook accounts as testers/developers. The developer website uses normal Facebook accounts to log in.
The off/on button on this page will switch the app to 'live' mode allowing users to see it. You do not need the bot in 'live' mode for testing! The 'get started!' button will not appear to users not added as testers/developers while in development modes.

### Messenger Profile API
To change things like the 'get started' info text, send POST requests to the Messenger Profile API (we used Insomnia).
The request looked like this:
https://graph.facebook.com/v4.0/me/messenger_profile?access_token= [access token goes here!!!]

{
	"greeting":[
		{
			"locale":"default",
			"text":"Hello {{user_full_name}}. You are chatting with a facebook bot, not a person! Click get started to get started. blah blah blah info text"
		}
	]
}


The access token is found in Heroku => Settings => Config Vars  (you want page_access_token). You will need to do this process again when connecting this bot to the real Euan's Guide page.


### Using the bot.
Make sure the account you are using is added as a Developer or Tester on the Facebook App then go to the page the bot is connected to, for this app it is: https://www.facebook.com/clancodeeuan/ then click the Send Message button at the top right. 

<img src="https://github.com/gadgetguy82/euans_guide_chatbot/blob/feature/readme/Images/Screenshot%202019-09-09%20at%2012.47.52%20pm.png?raw=true" width="250" height="300" alt="Get Started Button">

Once the get started button has been clicked the messenger will open and the bot will ask if the user wants to leave a review or chat. 

<img src="https://github.com/gadgetguy82/euans_guide_chatbot/blob/feature/readme/Images/Screenshot%202019-09-09%20at%201.29.20%20pm.png?raw=true" width="250" height="300" alt="ChatOrReview">

Currently the chat does nothing else than tell the user that the staff will get back to them. If the user clicks Review the bot sends the questions one at a time to the user then waits for a response.

### Recieving Email Reviews

Reviews were not coming through on gmail but the setting having now been enabled to allow the bot to login and recieve emails.  These articles below show the steps to take.

https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer
https://community.nodemailer.com/using-gmail/

This may not be a permanent solution and 2FA maybe required but this is getting the reviews working for now
