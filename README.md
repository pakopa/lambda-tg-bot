# Simple AWS Lambda based telegram bot

This project aims to provide the simplest (code-wise) possible platform to set up a telegram bot on a AWS Lambda (Node 8.10 environment).

The bot will receive updates through a webhook registered with telegram (real time communication, no polling).

It is composed by a very simple telegram api client (tgApi.js) that handles the http layer and a lambda handler (index.js) that parses received messages looking for a telegram command.

If a command is found it tries to run a module name <command>_cmd (The example command /dice is provided for reference).

## Why?

For some time I was thinking about the cheapest way to have a running bot knowing that it would not have to handle high loads but would have to be available 24/7. 
On demand execution seemed like a way to achieve this and AWS Lambda provides such service in a simple way. Also since telegram offers a fairly nice REST api I did not want to rely on libraries to handle it.

## How much will it cost me?

Probably less than a 1€ per month. 

A month is ~2.6 million seconds and who knows how many requests. This solution is for a bot that is going to handle a few hundred of thousands request per month. If you are receiving more requests than that, a cheap VPC becomes a cheaper solution. Even though, it is nice to have an estimate of what it the worst that could happen (Assuming you have correctly configured the environment) and it should be about 20€ it might hurt, but you will not be going to bankrupcy from this.

[AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/) has a free usage tier of 1 million requests per month (account-wide) and with the API usage limit of 2 request/second we are talking about 5.2 million maximun requests per month (this is really a worst case scenario). It would costs ~0.80€ and with 128MB of provisioned memory ~4.2€ in compute time. Since we are aiming to less than a million requests per month the cost is going to be 0€.

[AWS API Gateway Pricing](https://aws.amazon.com/api-gateway/pricing/) does not have a free tier usage (after the first year) so this will always cost you some (little) money. Worst case Scenario 15€/month and for the target usage it is going to be from 0.20-1€

[AWS CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/) The free tier includes "5 GB of Log Data Ingestion", thats a lot of log data for this bot. We should not be incurring charges in this section.


## Making a bot with this framework
    
The framework handles incoming requests and tries to load a module named <command>_cmd, so in order to implement your desired commands you have to create such module in the root directory. 

The module has to export a handler function that receives the [telegram Update object](https://core.telegram.org/bots/api#update) as the first argument and returns a promise that resolves after the command execution has finished (Failing to do so will result in the lambda execution finishing before your command processing and killing the execution). 
 
In order to set up a bot with this framework several manual steps have to be done, as for today this project only covers the AWS lambda function.
You will need an AWS account and a basic knowledge of AWS Lambda and AWS API Gateway.

1. Register a bot via telegrams @botfather [Creating a bot](https://core.telegram.org/bots#creating-a-new-bot)

2. Create a new lambda function. This project is based on Node 8.10
   Depending on what your commands do, you might need additional resource allocation but you can start with the minimal 128MB of memory and 3s timeout.
   You can also reserve and limit concurrency (i.e. 2) to limit the total monthly cpu-time consumed even in worst cases scenarios.
   
3. Configure your telegram api token as "tgToken" environment variable, you can also set up your bot name as an environment variable instead of just hardcoding it in the conf.js file.

4. Configure your lambda function CloudWatch logs so it does not stores them forever (a few days 3-7 should be enough)

5. Create a new REST API in AWS API Gateway
   Create a new POST Method and link it to your lambda function.
   Deploy your API (you will be prompted to create a new stage if you already have not)
   
6. In AWS API Gateway create a new usage plan and set up low rate and burst (i.e. 2, 4) to avoid malicious request causing unexpected costs.
   Add your previously created API stage to the usage plan.
   
7. We should now be able to test the REST API to check if everything is in place, 
   once we have our api endpoint (something like  https://randomstring1234.execute-api.eu-west-1.amazonaws.com/stagename/method)  
   we proceed to register it as the bot webhook as explained in [Set Webhook](https://core.telegram.org/bots/api#setwebhook)
   For this step you can use whatever tool you feel like i.e. CURL (I use postman to create a post request and executing it once to set the bot up)
   The endpoint should be kept secret so we do not receive updates that do not come from telegram.
   
8. Talk to your bot, it is waiting for you.

