# AWS Social Messaging Documentation

Crawled: 20 pages
Generated: 2026-01-20 21:08:14

---

## What is AWS End User Messaging Social? - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/what-is-service.html

What is AWS End User Messaging Social?
AWS End User Messaging Social, also referred to as Social messaging, is a messaging service that allows
  developers to integrate WhatsApp into their applications. It provides access to WhatsApp's
  messaging capabilities, enabling the creation of branded, interactive content with images, videos,
  and buttons. By using this service, you can add WhatsApp messaging functionality to your
  applications alongside existing channels like SMS and push notifications. This allows you to
  engage with customers through their preferred communication channel.
To get started, either create a new WhatsApp Business Account (WABA) using the self-guided onboarding process in
  the AWS End User Messaging Social console, or link an existing WABA to the service.
Topics
Are you a first-time AWS End User Messaging Social user?
Features of AWS End User Messaging Social
Related services
Accessing AWS End User Messaging Social
Regional availability
Are you a first-time AWS End User Messaging Social user?
If you are a first-time user of AWS End User Messaging Social, we recommend that you begin by reading the
   following sections:
Setting up AWS End User Messaging Social
Getting started with AWS End User Messaging Social
Best practices for AWS End User Messaging Social
Features of AWS End User Messaging Social
AWS End User Messaging Social provides the following features and capabilities:
Design consistent messages and reuse content more effectively by
creating and using message templates
. A message template
     contains content and settings that you want to reuse in messages that you send.
Access to rich messaging capabilities for a more engaging experience. Beyond text and
     media, you can send locations and interactive messages.
Receive incoming text and media messages from your customers.
Build trust with your customers by verifying your business identity through Meta.
Related services
AWS offers other messaging services that can be used together in a multi-channel
   workflow:
Use
AWS End User Messaging SMS
to send SMS messages
Use
AWS End User Messaging Push
to send push notifications
Use
Amazon SES
to send
     email
Accessing AWS End User Messaging Social
You can access AWS End User Messaging Social using the following:
AWS End User Messaging Social console
The web interface where you
create
and manage resources.
AWS Command Line Interface
Interact with AWS services using commands in your command line shell. The AWS Command Line Interface is
      supported on Windows, macOS, and Linux. For more information about the AWS CLI, see
AWS Command Line Interface User Guide
. You can find the AWS End User Messaging Social commands in the
AWS CLI Command Reference
.
AWS SDKs
If you prefer to build applications using language-specific APIs instead of submitting a
      request over HTTP or HTTPS, use the libraries, sample code, tutorials, and other resources
      provided by AWS. These libraries provide basic functions that automate tasks, such as
      cryptographically signing your requests, retrying requests, and handling error responses.
      These functions make it more efficient for you to get started. For more information, see
Tools to Build on AWS
.
Regional availability
AWS End User Messaging Social is available in several AWS Regions in North America, Europe, Asia, and Oceania.
   In each Region, AWS maintains multiple Availability Zones. These Availability Zones are
   physically isolated from each other, but are united by private, low-latency, high-throughput, and
   highly redundant network connections. These Availability Zones are used to provide high levels of
   availability and redundancy, while also minimizing latency.
To learn more about AWS Regions, see
Specify which
    AWS Regions your account can use
in the
Amazon Web Services General Reference
. For a list of all the Regions where AWS End User Messaging Social is currently
   available and the endpoint for each Region, see
Endpoints and
    quotas
for AWS End User Messaging Social API and
AWS
    service endpoints
in the
Amazon Web Services General Reference
, or the
   following table. To learn more about the number of Availability Zones that are available in each
   Region, see
AWS global
    infrastructure
.
Region availability
Region name
Region
Endpoint
WhatsApp API version
US East (N. Virginia)
us-east-1
social-messaging.us-east-1.amazonaws.com
social-messaging.us-east-1.api.aws
social-messaging-fips.us-east-1.amazonaws.com
social-messaging-fips.us-east-1.api.aws
Version 20 and later
US East (Ohio)
us-east-2
social-messaging.us-east-2.amazonaws.com
social-messaging.us-east-2.api.aws
social-messaging-fips.us-east-2.amazonaws.com
social-messaging-fips.us-east-2.api.aws
Version 20 and later
US West (Oregon)
us-west-2
social-messaging.us-west-2.amazonaws.com
social-messaging.us-west-2.api.aws
social-messaging-fips.us-west-2.amazonaws.com
social-messaging-fips.us-west-2.api.aws
Version 20 and later
Canada (Central)
ca-central-1
social-messaging.ca-central-1.amazonaws.com
social-messaging.ca-central-1.api.aws
social-messaging-fips.ca-central-1.amazonaws.com
social-messaging-fips.ca-central-1.api.aws
Version 20 and later
Africa (Cape Town)
af-south-1
social-messaging.af-south-1.amazonaws.com
social-messaging.af-south-1.api.aws
Version 20 and later
Asia Pacific (Tokyo)
ap-northeast-1
social-messaging.ap-northeast-1.amazonaws.com
social-messaging.ap-northeast-1.api.aws
Version 20 and later
Asia Pacific (Seoul)
ap-northeast-2
social-messaging.ap-northeast-2.amazonaws.com
social-messaging.ap-northeast-2.api.aws
Version 20 and later
Asia Pacific (Mumbai)
ap-south-1
social-messaging.ap-south-1.amazonaws.com
social-messaging.ap-south-1.api.aws
Version 20 and later
Asia Pacific (Hyderabad)
ap-south-2
social-messaging.ap-south-2.amazonaws.com
social-messaging.ap-south-2.api.aws
Version 20 and later
Asia Pacific (Singapore)
ap-southeast-1
social-messaging.ap-southeast-1.amazonaws.com
social-messaging.ap-southeast-1.api.aws
Version 20 and later
Asia Pacific (Sydney)
ap-southeast-2
social-messaging.ap-southeast-2.amazonaws.com
social-messaging.ap-southeast-2.api.aws
Version 20 and later
Europe (Frankfurt)
eu-central-1
social-messaging.eu-central-1.amazonaws.com
social-messaging.eu-central-1.api.aws
Version 20 and later
Europe (Spain)
eu-south-2
social-messaging.eu-south-2.amazonaws.com
social-messaging.eu-south-2.api.aws
Version 20 and later
Europe (Ireland)
eu-west-1
social-messaging.eu-west-1.amazonaws.com
social-messaging.eu-west-1.api.aws
Version 20 and later
Europe (London)
eu-west-2
social-messaging.eu-west-2.amazonaws.com
social-messaging.eu-west-2.api.aws
Version 20 and later
South America (SÃ£o Paulo)
sa-east-1
social-messaging.sa-east-1.amazonaws.com
social-messaging.sa-east-1.api.aws
Version 20 and later
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Setting up AWS End User Messaging Social

---

## Getting started with AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/getting-started-whatsapp.html

Getting started with AWS End User Messaging Social
These topics guide you through the steps to link or migrate your WhatsApp Business Account (WABA) to
  AWS End User Messaging Social.
Topics
Signing up for WhatsApp
Signing up for WhatsApp
A WhatsApp Business Account (WABA) allows your business to use the WhatsApp Business Platform to send messages
   directly to your customers. All of your WABAs are part of your Meta business portfolio. A WABA
   contains your customer facing assets, like phone number, templates, and WhatsApp Business
   Profile. A WhatsApp Business Profile contains your business's contact information that users see.
   For more information on WABAs, see
WhatsApp Business Account (WABA) in AWS End User Messaging Social
.
Follow the steps in this section to get started with AWS End User Messaging Social. Use the embedded sign-up
   process to either create a new WhatsApp Business Account (WABA) or migrate an existing WABA to AWS End User Messaging Social.
Prerequisites
Important
Working with Meta/WhatsApp
Your use of the WhatsApp Business Solution is subject to the terms and conditions of the
WhatsApp Business Terms of
        Service
, the
WhatsApp Business Solution Terms
, the
WhatsApp Business Messaging Policy
, the
WhatsApp Messaging
        Guidelines
, and all other terms, policies, or guidelines incorporated therein by
       reference (as each may be updated from time to time).
Meta or WhatsApp may at any time prohibit your use of the WhatsApp Business
       Solution.
You must create a WhatsApp Business Account ("WABA") with Meta and WhatsApp.
You must create a Business Manager account with Meta and link it to your WABA.
You must provide control of your WABA to us. At your request, we will transfer control
       of your WABA back to you in a reasonable and timely manner using the methods Meta makes
       available to us.
In connection with your use of the WhatsApp Business Solution, you will not submit any
       content, information, or data that is subject to safeguarding and/or limitations on
       distribution pursuant to applicable laws and/or regulation.
WhatsAppâs pricing for use of the WhatsApp Business Solution can be found at
Conversation-Based Pricing
.
To create a WhatsApp Business Account (WABA), your business needs a
Meta Business Account
. Check if your company already has a Meta Business Account. If
      you don't have a Meta Business Account, you can create one during the sign-up process.
To use a phone number that's already in use with the WhatsApp Messenger application or
      WhatsApp Business application, you must delete it first.
A phone number that can receive either an SMS or a voice One-Time Passcode (OTP). The
      phone number used for sign-up becomes associated with your WhatsApp account and the phone
      number is used when you send messages. The phone number can still be used for SMS, MMS, and
      voice messaging.
If you are importing an existing WABA, you need the PINs for all the phone numbers
      associated with the imported WABA. To reset a lost or forgotten PIN, follow the directions in
Updating PIN
in the
WhatsApp Business Platform Cloud API
       Reference
.
The following prerequisites must be met to use either an Amazon SNS topic or Amazon Connect instance as
        a message and event destination.
Amazon SNS topic
An Amazon SNS topic has been
created
and
permissions
have been
            added.
Note
Amazon SNS FIFO topics are not supported.
(Optional)
To use an Amazon SNS topic that is encrypted
            using AWS KMS keys you have to grant AWS End User Messaging Social permissions to the
existing key policy
.
Amazon Connect instance
An Amazon Connect instances has been
created
and
permissions
have been added.
Sign up through the console
Follow these directions to create a new WhatsApp account, migrate your existing account, or
    add a phone number to an existing WABA. As part of the sign-up process, you give AWS End User Messaging Social
    access to your WABA. You also allow AWS End User Messaging Social to bill you for messages. For more information
    on WABAs, see
Understanding WhatsApp business account types
.
Open the AWS End User Messaging Social console at
https://console.aws.amazon.com/social-messaging/
.
Choose
Business accounts
.
On the
Link business account
page, choose
Launch Facebook
       portal
. A new login window from Meta will appear.
In the Meta login window, enter your Facebook account credentials.
On the
WhatsApp business account
page, choose
Add WhatsApp
       phone number
. On the
Add WhatsApp phone number
page, choose
Launch Facebook portal
. A new login window from Meta will appear.
In the Meta login window, enter your Facebook account credentials.
As part of the sign-up process, you give AWS End User Messaging Social access to your WhatsApp Business Account (WABA). You also
      allow AWS End User Messaging Social to bill you for messages. Choose
Continue
.
For
Meta Business account
, choose an existing Meta business account
      or
Create a Meta Business account
.
(Optional) If you need to create a Meta Business account, follow these steps:
For
Business name
, enter the name of your business.
For
Business website or profile page
, enter either the URL for
        your company's website, or if your company doesn't have a website, enter the URL to your
        social media page.
For
Country
, choose the country your business is located
        in.
(Optional) Choose
Add address
and enter your business's address.
Choose
Next
.
For
Choose a WhatsApp Business Account
, choose an existing
      WhatsApp Business Account (WABA), or if you need to create an account, choose
Create a WhatsApp Business
       Account
.
For
Create or Select a WhatsApp Business Profile
, choose an existing
      WhatsApp business profile, or
Create a new WhatsApp Business Profile
.
Choose
Next
.
For
Create a Business Profile
, enter the following information:
For
WhatsApp Business Account Name
, enter a name for your
        account. This field is not customer facing.
For
WhatsApp Business Profile display name
, enter the name to
        display to your customers when they receive a message from you. We recommend that you use
        your company name as the display name. The name is reviewed by Meta and must comply with
WhatsApp
         display name rules
. To use a brand name that is different from your company name,
        there must be an externally published association between your company and the brand. This
        association must be displayed on your website and on the brand represented by the display
        name's website.
Once you complete registration, Meta performs a review of your display name. Meta
        sends you an email telling you whether the display name has been approved or rejected. If
        your display name is rejected, your per day messaging limit is lowered and you could be
        disconnected from WhatsApp.
Important
To change your display name, you have to create a ticket with Meta support.
For
Timezone
, choose the time zone the business is located in.
For
Category
, choose a category that best aligns with your
        business. Customers can view the category you as part of your contact information.
For
Business Description
, enter a description of your company.
        Customers can view your business description as part of your contact information.
For
Website
, enter your company's website. Customers can view
        your website as part of your contact information.
Choose
Next
.
For
Add a phone number for WhatsApp
, enter a phone number to
      register. This phone number is displayed to your customers when you send them a message.
For
Choose how you would like to verify your number
, choose either
Text message
or
Phone call
.
Once you are ready to receive the verification code, choose
Next
.
Enter the verification code, and then choose
Next
.
Once your number has been verified, you can choose
Next
to close the
      window from Meta.
For
WhatsApp business account
expand
Tags - optional
to add tags to your WhatsApp business account.
Tags are pairs of keys and values that you can optionally apply to your AWS resources to
      control access or usage. Choose
Add new tag
and enter a key-value pair to
      attach.
A WABA can have one message and event destination to log events for the WABA and all
      resources associated to the WABA. To enable event logging in Amazon SNS, including logging of
      receiving a customer message, you must turn on
Message and event
       publishing
. For more information, see
Message and event destinations in AWS End User Messaging Social
.
Important
To be able to respond to customer messages, you must enable
Message and event
        publishing
.
In the
Message and event destination details
section, turn on
Event publishing
. For Amazon SNS, choose either
New Amazon SNS standard
       topic
and enter a name in
Topic name
, or choose
Existing Amazon SNS standard topic
and choose a topic from the
Topic arn
dropdown list.
Under
Phone numbers
:
For each phone number under
WhatsApp Phone numbers
:
For
Phone number verification
, enter the existing PIN or enter a
        new PIN code. To reset a lost or forgotten PIN, follow the directions in
Updating PIN
in the
WhatsApp Business Platform Cloud API
         Reference
.
For
Additional setting
:
For
Data localization region - optional
choose one of Meta's
        regions in which to store your data at rest. For more information on Meta's data privacy policies,
        see
Data Privacy & Security
and
Cloud
         API Local Storage
in the
WhatsApp Business Platform Cloud API
         Reference
.
Tags are pairs of keys and values that you can optionally apply to your AWS resources
          to control access or usage. Choose
Add new tag
and enter a key-value
          pair to attach.
A WABA can have one message and event destination to log events for the WABA and all
            resources associated to the WABA. To enable event logging , including logging of
            receiving a customer message, you need to turn on
Message and event
              publishing
. For more information, see
Message and event destinations in AWS End User Messaging Social
.
Important
You must enable
Message and event publishing
to be able to respond to customer messages.
In the
Message and event destination details
section, turn on
Event publishing
.
For
Destination type
choose either Amazon SNS or Amazon Connect
To send your events to an Amazon SNS destination, enter an existing topic ARN in
Topic ARN
. For example IAM policies, see
IAM policies for Amazon SNS topics
.
For Amazon Connect
For
Connect instance
choose an instance from the drop down.
For Role ARN, choose either:
Choose existing IAM role
â Choose an existing IAM policy from the
Existing IAM roles
drop down. For example IAM policies, see
IAM policies for Amazon Connect
.
Enter IAM role ARN
â Enter the ARN of the IAM policy into
Use existing IAM role Arn
. For example IAM policies, see
IAM policies for Amazon Connect
.
To complete setup, choose
Add phone number
.
Next steps
Once you've completed sign-up, you can start sending messages. When you're ready to start
    sending messages at scale, complete
Business Verification
.
    Now that your WABA and AWS End User Messaging Social accounts are linked, see the following topics:
Learn about
event destination
to log events and receive incoming messages.
Learn how to create
message templates
.
Learn how to
send a text or media message
.
Learn how to
receive a message
.
Learn about
Official Business Accounts
to have a green check mark beside your display name and
      increase your message throughput.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Setting up AWS End User Messaging Social
WhatsApp Business Account (WABA)

---

## Using message templates in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-templates.html

Using message templates in AWS End User Messaging Social
Important
Starting on 4/1/2025 Meta will block marketing message templates sent to the US
            country code of
+1
. For more information, see
Per-User Marketing Template Message Limits
in the
WhatsApp
                Business Platform Cloud API Reference
.
You can use message templates to create message types that you use frequently, such as weekly
        newsletters or appointment reminders. Template messages are the only type of message that
        can be sent to customers who have yet to message you, or who have not sent you a message in
        the last 24 hours.
Meta assigns each template a quality rating and status. The quality rating impacts a
        template's status and lowers a template's pacing or sending rate.
Templates are associated with your WhatsApp Business Account (WABA), can be managed through the
        AWS End User Messaging Social console, and are reviewed by WhatsApp.
You can send the following template types:
Text-based
Media-based
Interactive message
Location-based
Authentication templates with one-time password buttons
Multi-Product Message templates
Meta provides pre-approved sample templates. To learn more, see
Sample message
            templates
.
For more information on the types of message templates, see
Message template
in the
WhatsApp Business Platform Cloud API
            Reference
.
Using message templates in the AWS Console
Create and manage your WhatsApp message templates directly in the AWS End User Messaging Social console.
Open the AWS End User Messaging Social console at
https://console.aws.amazon.com/social-messaging/
.
Choose
Business account
, and then choose a WABA.
On the
Message templates
tab, you can:
Create new templates
by choosing
Create template
and following the template creation workflow
View template status
to see which templates are approved, pending, or rejected
Edit existing templates
by selecting a template and choosing
Edit
Delete templates
that are no longer needed
Templates must be approved by Meta before they can be used to send messages to your customers. You can monitor the approval status of your templates in the console.
Next steps
Once you've created or edited a template, you must submit it for review with WhatsApp.
            Meta's review can take up to 24 hours. Meta sends an email to your Business Manager
            admin and updates the template status. You can check the status of your template in the AWS End User Messaging Social console.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Understanding phone number quality rating
Manage templates in the AWS Console

---

## Setting up AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/setting-up.html

Setting up AWS End User Messaging Social
Before you can use AWS End User Messaging Social for the first time, you must complete the following steps.
Topics
Sign up for an AWS account
Create a user with administrative access
Next steps
Sign up for an AWS account
If you do not have an AWS account, complete the following steps to create one.
To sign up for an AWS account
Open
https://portal.aws.amazon.com/billing/signup
.
Follow the online instructions.
Part of the sign-up procedure involves receiving a phone call or text message and entering 
  a verification code on the phone keypad.
When you sign up for an AWS account, an
AWS account root user
is created. The root user has access to all AWS services
  and resources in the account. As a security best practice, assign administrative access to a user, and use only the root user to perform
tasks that require root user access
.
AWS sends you a confirmation email after the sign-up process is
complete. At any time, you can view your current account activity and manage your account by
going to
https://aws.amazon.com/
and choosing
My
  Account
.
Create a user with administrative access
After you sign up for an AWS account, secure your AWS account root user, enable AWS IAM Identity Center, and create an administrative user so that you 
don't use the root user for everyday tasks.
Secure your AWS account root user
Sign in to the
AWS Management Console
as the account owner by choosing
Root user
and entering your AWS account email address. On the next page, enter your password.
For help signing in by using root user, see
Signing in as the root user
in the
AWS Sign-In User Guide
.
Turn on multi-factor authentication (MFA) for your root user.
For instructions, see
Enable a virtual MFA device for your AWS account root user (console)
in the
IAM User Guide
.
Create a user with administrative access
Enable IAM Identity Center.
For instructions, see
Enabling
 AWS IAM Identity Center
in the
AWS IAM Identity Center User Guide
.
In IAM Identity Center, grant administrative access to a user.
For a tutorial about using the IAM Identity Center directory as your identity source, see
Configure user access with the default IAM Identity Center directory
in the
AWS IAM Identity Center User Guide
.
Sign in as the user with administrative access
To sign in with your IAM Identity Center user, use the sign-in URL that was sent to your email address when you created the IAM Identity Center user.
For help signing in using an IAM Identity Center user, see
Signing in to the AWS access portal
in the
AWS Sign-In User Guide
.
Assign access to additional users
In IAM Identity Center, create a permission set that follows the best practice of applying least-privilege permissions.
For instructions, see
Create a permission set
in the
AWS IAM Identity Center User Guide
.
Assign users to a group, and then assign single sign-on access to the group.
For instructions, see
Add groups
in the
AWS IAM Identity Center User Guide
.
Next steps
Now that you're prepared to work with AWS End User Messaging Social, see
Getting started with AWS End User Messaging Social
for creating your WhatsApp Business Account (WABA) or
   migrating your existing WABA.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
What is AWS End User Messaging Social?
Getting started

---

## Best practices for AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/whatsapp-best-practices.html

Best practices for AWS End User Messaging Social
This section describes several best practices that might help you improve your customer
        engagement and avoid account suspension. However, note that this section doesn't contain legal
        advice. Always consult an attorney to obtain legal advice.
For the most recent list of WhatsApp best practices, see the
WhatsApp Business Messaging Policy
.
Topics
Up-to-date business profile
Obtain permission
Prohibited message content
Audit your customer lists
Adjust your sending based on
                engagement
Send at appropriate times
Up-to-date business profile
Maintain an accurate and up-to-date WhatsApp Business profile that includes customer
            support contact information, such as an email address, website address, or telephone
            number. Ensure that the information provided is truthful and does not misrepresent or
            impersonate another business.
Obtain permission
Never send messages to recipients who haven't explicitly asked to receive the specific
            types of messages that you plan to send. Maintain the following opt-in
            information:
The opt-in process must clearly inform the person that they are consenting to receive messages
                    or calls from your business over WhatsApp. You must explicitly state the name of
                    your business.
You are solely responsible for determining the method of obtaining opt-in consent. Ensure that
                    the opt-in process complies with all applicable laws governing your
                    communications. Provide all required notices and obtain all necessary
                    permissions under relevant laws.
For more information on WhatsApp Opt-in requirements, see
Get Opt-in for WhatsApp
If recipients can sign up to receive your messages by using an online form, prevent
            automated scripts from subscribing people without their knowledge. Also limit the number
            of times a user can submit a phone number in a single session.
Respect all requests made by a person, whether on or off WhatsApp, to block,
            discontinue, or otherwise opt out of communications, including removing that person from
            your contacts list.
Maintain records that include the date, time, and source of each opt-in request and
            confirmation. This can also help you perform routine audits of your customer list.
Prohibited message content
Important
Working with Meta/WhatsApp
Your use of the WhatsApp Business Solution is subject to the terms and conditions of the
WhatsApp Business Terms of
                            Service
, the
WhatsApp Business Solution Terms
, the
WhatsApp Business Messaging Policy
, the
WhatsApp Messaging
                                        Guidelines
, and all other terms, policies, or guidelines incorporated therein by
                        reference (as each may be updated from time to time).
Meta or WhatsApp may at any time prohibit your use of the WhatsApp Business
                        Solution.
In connection with your use of the WhatsApp Business Solution, you will
                        not submit any content, information, or data that is subject to safeguarding
                        or limitations on distribution according to applicable laws or
                        regulation.
If you violate the WhatsApp policy your account could be blocked from sending messages
            for a period of time, locked until you file an appeal, or permanently blocked. Meta will
            inform you if any of your accounts or assets have violated the policy, through email and
            the WhatsApp Business Manager. All appeals must be made to Meta. To view a policy
            violate or file an appeal with Meta, see
View policy violation
                details for your WhatsApp Business account
in the
Meta Business
                Help Center
. For the most recent list of prohibited message content, see
            the
WhatsApp Business Messaging
                Policy
.
The following are prohibited content categories for all message types globally. When
            sending a message with WhatsApp, follow these guidelines:
Category
Examples
Gambling
Casinos
Sweepstakes
App/Websites
High-risk financial services
Payday loans
Short-term high-interest loans
Auto loans
Mortgage loans
Student loans
Debt collection
Stock alerts
Cryptocurrency
Debt forgiveness
Debt consolidation
Debt reduction
Credit repair programs
Get-rich-quick schemes
Work-from-home programs
Risk-investment opportunities
Pyramid or multi-level marketing schemes
Illegal substances
Cannabis/CBD
Phishing/smishing
Attempts to get users to reveal personal
                                        information or website login information.
S.H.A.F.T.
Sex
Hate
Alcohol
Firearms
Tobacco/Vape
Third-Party Lead Generation
Companies that buy, sell, or share consumer
                                        information
Audit your customer lists
If you send recurring WhatsApp messages, audit your customer lists on a regular basis.
            Auditing your customer lists helps to make sure that the only customers who receive your
            messages are those who want to receive them.
When you audit your list, send each opted-in customer a message that reminds them that
            they're subscribed, and provides them with information about unsubscribing.
Adjust your sending based on
                engagement
Your customers' priorities can change over time. If customers no longer find your
            messages to be useful, they might opt out of your messages entirely, or even report your
            messages as unsolicited. For these reasons, it's important that you adjust your sending
            practices based on customer engagement.
For customers who rarely engage with your messages, you should adjust the frequency of
            your messages. For example, if you send weekly messages to engaged customers, you could
            create a separate monthly digest for customers who are less engaged.
Finally, remove customers who are completely unengaged from your customer lists. This
            step prevents customers from becoming frustrated with your messages. It also saves you
            money and helps protect your reputation as a sender.
Send at appropriate times
Send messages during normal daytime business hours. If you send messages at dinner
            time or in the middle of the night, there's a good chance that your customers will
            unsubscribe from your lists to avoid being disturbed. You might want to avoid sending
            WhatsApp messages when your customers can't respond to them immediately.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Monitoring with EventBridge
Security

---

## Add a message and event destination to AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-event-destinations-add.html

Add a message and event destination to AWS End User Messaging Social
When you turn on message and event publishing, all of the events generated by your
        WhatsApp Business Account (WABA) are sent to the Amazon SNS topic. This includes events for each phone number
        associated to a WABA. Your WABA can have one Amazon SNS topic associated with it.
Prerequisites
Before you begin, the following prerequisites must be met to use either an Amazon SNS topic
            or Amazon Connect instance as a message and event destination.
Amazon SNS topic
An Amazon SNS topic has been
created
and
permissions
have
                    been added.
Note
Amazon SNS FIFO topics are not supported.
(Optional)
To use an Amazon SNS topic that is
                    encrypted using AWS KMS keys you have to grant AWS End User Messaging Social permissions to the
existing key
                        policy
.
Amazon Connect instance
An Amazon Connect instances has been
created
and
permissions
have been added.
Add a message and event destination
Open the AWS End User Messaging Social console at
https://console.aws.amazon.com/social-messaging/
.
Choose
Business account
, and then choose a WABA.
On the
Event destination
tab, choose
Edit
                        destination
.
To turn on an event destination, choose
Enable
.
For
Destination type
choose either Amazon SNS or Amazon Connect
To send your events to an  Amazon SNS destination, enter  an existing topic
                            ARN in
Topic ARN
. For example IAM policies, see
IAM policies for Amazon SNS topics
.
For Amazon Connect
For
Connect instance
choose an instance from the drop down.
For
Two-way channel role
, choose either:
Choose existing IAM role
â Choose an existing IAM policy from the
Existing IAM roles
drop down. For example IAM policies, see
IAM policies for Amazon Connect
.
Enter IAM role ARN
â Enter the ARN of the IAM policy into
Use existing IAM role Arn
. For example IAM policies, see
IAM policies for Amazon Connect
.
Choose
Save changes
.
Encrypted Amazon SNS topic policies
You can use Amazon SNS topics that are encrypted using AWS KMS keys for an
            additional level of security. This added security can be helpful if your
            application handles private or sensitive data. For more information about
            encrypting Amazon SNS topics using AWS KMS keys, see
Enable compatibility between event sources from AWS services and
                encrypted topics
in the
Amazon Simple Notification Service Developer Guide
.
Note
Amazon SNS FIFO topics are not supported.
The example statement uses the, optional but recommended,
SourceAccount
and
SourceArn
conditions to
            avoid the confused deputy problem and only the AWS End User Messaging Social owner account has
            access. For more information on the confused deputy problem, see
The confused deputy problem
in the
IAM user guide
.
The key that you use must be
symmetric
. Encrypted Amazon SNS topics
            don't support asymmetric AWS KMS keys.
The key policy must be modified to allow AWS End User Messaging Social to use the key. Follow the
            directions in
Changing a key
                policy
, in the
AWS Key Management Service Developer Guide
, to add the following
            permissions to the existing key policy:
{
"Effect": "Allow",
    "Principal":
{
"Service": "social-messaging.amazonaws.com"
    },
    "Action": [
        "kms:GenerateDataKey*",
        "kms:Decrypt"
    ],
    "Resource": "*",
    "Condition":
{
"StringEquals":
{
"aws:SourceAccount": "
{
ACCOUNT_ID}
"
        },
        "ArnLike":
{
"aws:SourceArn": "arn:
{
PARTITION}
:social-messaging:
{
REGION}
:
{
ACCOUNT_ID}
:*"
        }
     }
}
IAM policies for Amazon SNS topics
To use an existing IAM role or to create a new role,
            attach the following policy to that role so that AWS End User Messaging Social can assume it. For
            information about how to modify the trust relationship of a role, see
Modifying a Role
in the
IAM
                    user guide
.
The following is the
permission policy
for the IAM
            role. The permission policy allows for publishing to Amazon SNS topics.
In the following IAM permission policy, make the following changes:
Replace
{
PARTITION}
with the AWS partition that
                    you use AWS End User Messaging Social in.
Replace
{
REGION}
with the AWS Region that you use
                    AWS End User Messaging Social in.
Replace
{
ACCOUNT}
with the unique ID for your
                    AWS account.
Replace
{
TOPIC_NAME}
with the Amazon SNS topics that
                    will receive messages.
{
"Effect": "Allow",
    "Principal":
{
"Service": [
          "social-messaging.amazonaws.com"
        ]
       },
    "Action": "sns:Publish",
    "Resource": "arn:
{
PARTITION}
:sns:
{
REGION}
:
{
ACCOUNT}
:
{
TOPIC_NAME}
"
}
IAM policies for Amazon Connect
If you want AWS End User Messaging Social to use an existing IAM role or if you create a new role,
            attach the following policies to that role so that AWS End User Messaging Social can assume it. For
            information about how to modify an existing trust relationship of a role, see
Modifying a Role
in the
IAM
                    user guide
. This role is used for both sending events and
            importing phone numbers from AWS End User Messaging Social into Amazon Connect.
To create new IAM polices, do the following:
Create a new
permission policy
by following
                    the directions in
Creating policies using the JSON editor
in the
                    IAM User Guide.
In step 5 use the
permission policy
for the IAM role to allow for publishing to Amazon Connect.
JSON
{
"Version":"2012-10-17",		 	 	 
    "Statement": [
{
"Sid": "AllowOperationsForEventDelivery",
            "Effect": "Allow",
            "Action": [
                "connect:SendIntegrationEvent"
            ],
            "Resource": "*"
        },
{
"Sid": "AllowOperationsForPhoneNumberImport",
            "Effect": "Allow",
            "Action": [
                "connect:ImportPhoneNumber",
                "social-messaging:GetLinkedWhatsAppBusinessAccountPhoneNumber",
                "social-messaging:TagResource"
            ],
            "Resource": "*"
        }
    ]
}
Create a new
trust policy
by following the
                    directions in
Creating a role using custom trust policies
in
                    the IAM User Guide.
In step 4 use the
trust policy
for
                            the IAM role.
JSON
{
"Version":"2012-10-17",		 	 	 
    "Statement": [
{
"Effect": "Allow",
            "Principal":
{
"Service": [
                    "social-messaging.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
In step 10 add the
permission policy
that you created in the previous step.
Next steps
Once you have set up your Amazon SNS topic, you must subscribe an endpoint to the topic.
            The endpoint will start to receive messages published to the associated topic. For more
            information on subscribing to a topic, see
Subscribing to an Amazon SNS topic
in the
Amazon SNS Developer Guide
.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Message and event destinations
Message and event format

---

## Message and event destinations in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-event-destinations.html

Message and event destinations in AWS End User Messaging Social
An event destination is an Amazon SNS topic or Amazon Connect instance that WhatsApp events are sent to. When you turn on
        event publishing, all of your send and receive events are sent to the
        message and event destination. Use events to monitor, track, and analyze the status of outbound messages and
        incoming customer communications.
Each WhatsApp Business Account (WABA) can have one event destination. All events from all resources associated
        to the WABA are logged to that event destination. For example, you could have a WABA
        with three phone numbers associated to it and all events from those phone numbers are logged
        to the one event destination.
Topics
Add a message and event destination to AWS End User Messaging Social
Message and event format in AWS End User Messaging Social
WhatsApp message status
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Reasons why a template is
                rejected
Add an event destination

---

## WhatsApp Business Account (WABA) in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-whatsapp-waba.html

WhatsApp Business Account (WABA) in AWS End User Messaging Social
With a WhatsApp Business Account (WABA), you can use the WhatsApp Business Platform to send messages directly to
        your customers. All of your WABAs are part of your
Meta Business Portfolio
. A WABA contains
        your customer facing assets like phone number, templates, and business contact information.
        A WABA can only exist in one AWS Region. For more information on WABAs, see
WhatsApp
            Business Accounts
in the
WhatsApp Business Platform Cloud API
            Reference
.
Important
Working with Meta/WhatsApp
Your use of the WhatsApp Business Solution is subject to the terms and
                    conditions of the
WhatsApp Business Terms of Service
, the
WhatsApp
                        Business Solution Terms
, the
WhatsApp Business Messaging
                        Policy
, the
WhatsApp Messaging
                        Guidelines
, and all other terms, policies, or guidelines
                    incorporated therein by reference. These might be updated from time to time.
Meta or WhatsApp may at any time prohibit your use of the WhatsApp Business
                    Solution.
You must create a WhatsApp Business Account (WABA) with Meta and
                    WhatsApp.
You must create a Business Manager account with Meta and link it to your WABA.
You must grant control of your WABA to us. At your request, we will transfer
                    control of your WABA back to you in a reasonable and timely manner using the
                    methods Meta makes available to us.
In connection with your use of the WhatsApp Business Solution, you will not
                    submit any content, information, or data that is subject to safeguarding or
                    limitations on distribution pursuant to applicable laws or regulations.
WhatsAppâs pricing for use of the WhatsApp Business Solution can be found at
https://developers.facebook.com/docs/whatsapp/pricing
.
Topics
View a WhatsApp Business Account (WABA) in AWS End User Messaging Social
Add a WhatsApp Business Account (WABA) in AWS End User Messaging Social
Understanding WhatsApp business account types
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Getting started
View a WABA

---

## Understanding WhatsApp business account types - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/whatsapp-business-account.html

Understanding WhatsApp business account types
Your WhatsApp business account determines how you appear to your customers. When you create a WhatsApp account, your account will be a
Business Account
. WhatsApp has
        two types of business accounts:
Business Account
: WhatsApp verifies the authenticity of every
                account on the WhatsApp Business Platform. If a business account has completed the
                Business Verification process, the business name will be visible to all users. This
                feature helps users identify verified business accounts on WhatsApp.
Official Business Account
: Along with the benefits of a
business account
, an official business account has a green
                checkmark badge in its profile and chat thread headers.
Approval for a WhatsApp Official Business Account (OBA) requires providing
                evidence that the business is well known and recognized by consumers, such as
                articles, blog posts, or independent reviews. Approval for a WhatsApp OBA is not
                guaranteed, even if the business provides the required documentation. The approval
                process is subject to review and approval by WhatsApp. WhatsApp does not publicly
                disclose the specific criteria they use to evaluate and approve applications for
                Official Business Accounts. The businesses seeking a WhatsApp OBA must demonstrate
                their reputation and recognition, but final approval is at the discretion of
                WhatsApp.
When you create a WhatsApp account, your account will be a
Business
            Account
. You can provide information to your customers about your business,
        such as website, address, and hours. For businesses that haven't completed WhatsApp Business
        Verification, the display name is shown in small text next to the phone number in the
        contacts view, not in the chat list or individual chat. Once the Meta Business Verification
        is completed, the WhatsApp Sender's display name will be shown in the chat list and
        individual chat threads.
Additional resources
For more information on
Business Account
and
Official Business Account
, see
Business Accounts
in the
WhatsApp Business Platform Cloud
                        API Reference
.
For more information on the Business Verification process, see
Business
                        Verification
in the
WhatsApp Business Platform Cloud API
                        Reference
.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Add a WABA
Phone numbers

---

## Responding to a message in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/whatsapp-receive-message.html

Responding to a message in AWS End User Messaging Social
Before you can receive a text or media message, you must have set up your WhatsApp
        Business Account (WABA) and an event destination. When you receive an incoming message, an
        event is saved in the event destination Amazon SNS topic. To receive a notification, you must
        subscribe to the Amazon SNS topics endpoint.
For an example event of a received media message, see
Example WhatsApp JSON for receiving a media message
. For more
        information on configuring the AWS CLI, see
Configure the
            AWS CLI
in the
AWS Command Line Interface User Guide
. For a list of
        supported media file types, see
Supported media file types and sizes in WhatsApp
.
Important
To receive incoming messages, you must have
event destinations
enabled for the WABA. For more information, see
Add a message and event destination to AWS End User Messaging Social
.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Sending a media message
Change a message's status to read

---

## Sending messages through WhatsApp with AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/whatsapp-send-message.html

Sending messages through WhatsApp with AWS End User Messaging Social
Before sending a message, you must set up your WhatsApp Business Account (WABA), and your
        user must opt in to receive messages from you. For more information, see
Obtain permission
.
When a user messages you, a 24-hour timer called a customer service window starts or
        refreshes. All message types, except for template messages, can only be sent when a customer
        service window is open between you and the user. Template messages can be sent at any time,
        as long as the user has opted in to receive messages from you.
For each message that you send or receive, a message status is generated and sent to the
        event destination. If your customer has not signed up for WhatsApp, an event is generated
        with a message status of
fail
. You must turn on a
message and event destination
to receive
        the
message status
.
For a list of
        message types, see
Messages
in the
WhatsApp Business Platform Cloud API Reference
.
Important
Working with Meta/WhatsApp
Your use of the WhatsApp Business Solution is subject to the terms and
                    conditions of the
WhatsApp Business Terms of Service
, the
WhatsApp
                        Business Solution Terms
, the
WhatsApp Business Messaging
                        Policy
, the
WhatsApp Messaging
                        Guidelines
, and all other terms, policies, or guidelines
                    incorporated therein by reference. These might be updated from time to time.
Meta or WhatsApp may at any time prohibit your use of the WhatsApp Business
                    Solution.
In connection with your use of the WhatsApp Business Solution, you will not
                    submit any content, information, or data that is subject to safeguarding or
                    limitations on distribution pursuant to applicable laws or regulations.
Topics
Example of sending a template message in AWS End User Messaging Social
Example of sending a media message in
                AWS End User Messaging Social
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Message types
Send a template message

---

## Message and event format in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-event-destination-dlrs.html

Message and event format in AWS End User Messaging Social
The JSON object for an event contains the AWS event header and WhatsApp JSON payload.
        For a list of the JSON WhatsApp notification payload and values, see
Webhooks Notification Payload Reference
and
Message Status
in the
WhatsApp Business Platform Cloud API Reference
.
AWS End User Messaging Social event header
The JSON object for an event contains the AWS event header and WhatsApp JSON. The
      header contains the AWS identifiers and ARNs of your WhatsApp Business Account (WABA) and
      phone number.
{
"context":
{
"MetaWabaIds": [
{
"wabaId": "1234567890abcde",
        "arn": "arn:aws:social-messaging:us-east-1:123456789012:waba/fb2594b8a7974770b128a409e2example"
      }
    ],
    "MetaPhoneNumberIds": [
{
"metaPhoneNumberId": "abcde1234567890",
        "arn": "arn:aws:social-messaging:us-east-1:123456789012:phone-number-id/976c72a700aac43eaf573ae050example"
      }
    ]
  },
  "whatsAppWebhookEntry": "
{
\"...JSON STRING....",
  "aws_account_id": "123456789012",
  "message_timestamp": "2025-01-08T23:30:43.271279391Z",
  "messageId": "6d69f07a-c317-4278-9d5c-6a84078419ec"
}
//Decoding the contents of whatsAppWebhookEntry
{
//WhatsApp notification payload
}
In the preceding example event:
1234567890abcde
is the WABA id from Meta.
abcde1234567890
is the phone number id from Meta.
fb2594b8a7974770b128a409e2example
is the ID of the WhatsApp Business Account (WABA).
976c72a700aac43eaf573ae050example
is the ID of the phone number.
Example WhatsApp JSON
        for receiving a message
The following shows the event record for an incoming message from WhatsApp. The JSON
      received from WhatsApp in the
whatsAppWebhookEntry
is received as a JSON string
      and can be converted to JSON. For a list of fields and their meaning, see
Webhooks
        Notification Payload Reference
in the
WhatsApp Business Platform Cloud API
        Reference
.
{
"context":
{
"MetaWabaIds": [
{
"wabaId": "1234567890abcde",
        "arn": "arn:aws:social-messaging:us-east-1:123456789012:waba/fb2594b8a7974770b128a409e2example"
      }
    ],
    "MetaPhoneNumberIds": [
{
"metaPhoneNumberId": "abcde1234567890",
        "arn": "arn:aws:social-messaging:us-east-1:123456789012:phone-number-id/976c72a700aac43eaf573ae050example"
      }
    ]
  },
  "whatsAppWebhookEntry": "
{
\"...JSON STRING....",
  "aws_account_id": "123456789012",
  "message_timestamp": "2025-01-08T23:30:43.271279391Z",
  "messageId": "6d69f07a-c317-4278-9d5c-6a84078419ec"
}
You can use a tool, such as
jq
, to convert the
      JSON string to JSON. The following is the
whatsAppWebhookEntry
in JSON
      form:
{
"id": "503131219501234",
  "changes": [
{
"value":
{
"messaging_product": "whatsapp",
        "metadata":
{
"display_phone_number": "14255550123",
          "phone_number_id": "46271669example"
        },
        "statuses": [
{
"id": "wamid.HBgLMTkxNzM5OTI3MzkVAgARGBJBMTM4NDdGRENEREI5Rexample",
            "status": "sent",
            "timestamp": "1736379042",
            "recipient_id": "01234567890",
            "conversation":
{
"id": "62374592e84cb58e52bdaed31example",
              "expiration_timestamp": "1736461020",
              "origin":
{
"type": "utility"
              }
            },
            "pricing":
{
"billable": true,
              "pricing_model": "CBP",
              "category": "utility"
            }
          }
        ]
      },
      "field": "messages"
    }
  ]
}
Example WhatsApp JSON for receiving a media message
The following shows the event record for an incoming media message. To retrieve the
      media file, use the GetWhatsAppMessageMedia API command. For a list of fields and their
      meaning, see
Webhooks
        Notification Payload Reference
{
//AWS End User Messaging Social header
}
//Decoding the contents of whatsAppWebhookEntry
{
"id": "365731266123456",
  "changes": [
{
"value":
{
"messaging_product": "whatsapp",
        "metadata":
{
"display_phone_number": "12065550100",
          "phone_number_id": "321010217760100"
        },
        "contacts": [
{
"profile":
{
"name": "Diego"
            },
            "wa_id": "12065550102"
          }
        ],
        "messages": [
{
"from": "14255550150",
            "id": "wamid.HBgLMTQyNTY5ODgzMDIVAgASGCBDNzBDRjM5MDU2ODEwMDkwREY4ODBDRDE0RjVGRkexample",
            "timestamp": "1723506230",
            "type": "image",
            "image":
{
"mime_type": "image/jpeg",
              "sha256": "BTD0xlqSZ7l02o+/upusiNStlEZhA/urkvKf143Uqjk=",
              "id": "530339869524171"
            }
          }
        ]
      },
      "field": "messages"
    }
  ]
}
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Add an event destination
Message status

---

## WhatsApp message status - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-event-destinations-status.html

WhatsApp message status
When you send a message, you receive status updates about the message. You have to enable
        event logging to receive these notifications, see
Message and event destinations in AWS End User Messaging Social
.
Message statuses
The following table contains possible message statuses.
Status name
Description
accepted
The message has been accepted by WhatsApp for processing.
deleted
The customer deleted the message, and you should also delete the
                            message if it was downloaded to your server.
delivered
The message was successfully delivered to the customer.
failed
The message failed to send.
read
The customer read the message. This status is only sent if the
                            customer has read receipts turned on.
sent
The message has been sent but is still in transit.
warning
The message contains an item that is unavailable or doesn't
                            exist.
Additional resources
For more information, see
Message Status
in the
WhatsApp Business Platform Cloud API
                Reference
.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Message and event format
Uploading media files

---

## Add a WhatsApp Business Account (WABA) in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-waba-add_steps.html

Add a WhatsApp Business Account (WABA) in AWS End User Messaging Social
Add a new WABA to your account if you already have a WhatsApp Business Profile. As
            part of creating a new WABA, you must add a
phone number
to the WABA.
To add a new WABA to your account, follow the steps in
Getting started with AWS End User Messaging Social
:
In step 8, choose your WhatsApp Business Profile, and then choose a
Create a new WhatsApp Business account
.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
View a WABA
WhatsApp business account types

---

## View a WhatsApp Business Account (WABA) in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-waba_steps.html

View a WhatsApp Business Account (WABA) in AWS End User Messaging Social
You can view the WABA associated with your AWS account.
To view the WABA associated with your account
Open the AWS End User Messaging Social console at
https://console.aws.amazon.com/social-messaging/
.
In
Business accounts
, choose a WABA.
On the
Phone numbers
tab, view your phone number, display name, quality
                    rating, and the number of business initiated conversations that you have left
                    for the day.
On the
Event destinations
tab, view your event destination.
                    To edit your event destination, follow the directions in
Message and event destinations in AWS End User Messaging Social
.
On the
Templates
tab, choose
Manage message
                        templates
to edit your WhatsApp templates through Meta. Each WABA
                    has a 250 template limit.
On the
Tags
tab, you can manage your WABA resource
                    tags.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsApp Business Account (WABA)
Add a WABA

---

## Supported media file types and sizes in WhatsApp - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/supported-media-types.html

Supported media file types and sizes in WhatsApp
When sending or receiving a media message, the file type must be supported and under the
        maximum file size. For more information, see
Supported Media Types
in the
WhatsApp Business Platform Cloud API
            Reference
.
Media file types
Audio formats
Audio Type
Extension
MIME Type
Max Size
AAC
.aac
audio/aac
16 MB
AMR
.amr
audio/amr
16 MB
MP3
.mp3
audio/mpeg
16 MB
MP4 Audio
.m4a
audio/mp4
16 MB
OGG Audio
.ogg
audio/ogg
16 MB
Document formats
Document Type
Extension
MIME Type
Max Size
Text
.text
text/plain
100 MB
Microsoft Excel
.xls, .xlsx
application/vnd.ms-excel,
                            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
100 MB
Microsoft Word
.doc, .docx
application/msword,
                            application/vnd.openxmlformats-officedocument.wordprocessingml.document
100 MB
Microsoft PowerPoint
.ppt, .pptx
application/vnd.ms-powerpoint,
                            application/vnd.openxmlformats-officedocument.presentationml.presentation
100 MB
PDF
.pdf
application/pdf
100 MB
Image formats
Image Type
Extension
MIME Type
Max Size
JPEG
.jpeg
image/jpeg
5 MB
PNG
.png
image/png
5 MB
Sticker formats
Sticker Type
Extension
MIME Type
Max Size
Animated sticker
.webp
image/webp
500 KB
Static sticker
.webp
image/webp
100 KB
Video formats
Video Type
Extension
MIME Type
Max Size
3GPP
.3gp
video/3gp
16 MB
MP4 Video
.mp4
video/mp4
16 MB
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Uploading media files
Message types

---

## Example of sending a media message in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/send-message-media.html

Example of sending a media message in
                AWS End User Messaging Social
The following example shows how to send a media message to your customer using the
            AWS CLI. For more information on configuring the AWS CLI, see
Configure
                the AWS CLI
in the
AWS Command Line Interface User Guide
. For a list of supported media file types,
            see
Supported media file types and sizes in WhatsApp
.
Note
WhatsApp stores media files for 30 days before deleting them, see
Upload Media
in the
WhatsApp Business Platform Cloud API
                    Reference
.
Upload the media file to an Amazon S3 bucket. For more information, see
Uploading media files to send with WhatsApp
.
Upload the media file to WhatsApp using the
post-whatsapp-message-media
command. On
                    successful completion, the command will return the
{
MEDIA_ID}
, which is required for sending the
                    media message.
aws socialmessaging post-whatsapp-message-media --origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
--source-s3-file bucketName=
{
BUCKET}
,key=
{
MEDIA_FILE}
In the preceding command, do the following:
Replace
{
ORIGINATION_PHONE_NUMBER_ID}
with
                            your phone number's ID.
Replace
{
BUCKET}
with the name of the Amazon S3
                            bucket.
Replace
{
MEDIA_FILE}
with the name of the
                            media file.
You can also upload using a
presign url
by using
--source-s3-presigned-url
instead
                    of
--source-s3-file
. You must add
Content-Type
in the
headers
field. If you use both then an
InvalidParameterException
is returned.
--source-s3-presigned-url headers=
{
"
Name
":"
Value
"},url=
https://BUCKET.s3.REGION/MEDIA_FILE
Use the
send-whatsapp-message
command to send the media
                    message.
aws socialmessaging send-whatsapp-message --message '
{
"messaging_product":"whatsapp","to":"'
{
PHONE_NUMBER}
'","type":"image","image":
{
"id":"'
{
MEDIA_ID}
'"}}' --origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
--meta-api-version v20.0
Note
You must specify base64 encoding when you use the AWS CLI version 2. This
                        can be done by adding the AWS CLI paramater
--cli-binary-format
                            raw-in-base64-out
or changing the AWS CLI global configuration file. For more
                        information, see
cli_binary_format
in the
AWS Command Line Interface User Guide for Version
                            2
.
aws socialmessaging send-whatsapp-message --message '
{
"messaging_product":"whatsapp","to":"'
{
PHONE_NUMBER}
'","type":"image","image":
{
"id":"'
{
MEDIA_ID}
'"}}' --origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
--meta-api-version v20.0 --cli-binary-format raw-in-base64-out
In the preceding command, do the following:
Replace
{
PHONE_NUMBER}
with your customer's
                            phone number.
Replace
{
ORIGINATION_PHONE_NUMBER_ID}
with
                            your phone number's ID.
Replace
{
MEDIA_ID}
with the media ID
                            returned from the previous step.
When you no longer need the media file, you can delete it from WhatsApp using
                    the
delete-whatsapp-message-media
command. This
                    only removes the media file from WhatsApp and not your Amazon S3 bucket.
aws socialmessaging delete-whatsapp-message-media --media-id
{
MEDIA_ID}
--origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
In the preceding command, do the following:
Replace
{
ORIGINATION_PHONE_NUMBER_ID}
with
                            your phone number's ID.
Replace
{
MEDIA_ID}
with the media ID.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Send a template message
Responding to a received message

---

## Example of sending a template message in AWS End User Messaging Social - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/send-message-text.html

Example of sending a template message in AWS End User Messaging Social
For more information on the types of message templates that can be sent, see
Message template
in the
WhatsApp Business Platform Cloud API
                Reference
. For a list of
            message types that can be sent, see
Messages
in the
WhatsApp Business Platform Cloud API Reference
.
The following example shows how to use a template to
send a message
to your customer using the AWS CLI. For
            more information on configuring the AWS CLI, see
Configure
                the AWS CLI
in the
AWS Command Line Interface User Guide
.
Note
You must specify base64 encoding when you use the AWS CLI version 2. This
                        can be done by adding the AWS CLI paramater
--cli-binary-format
                            raw-in-base64-out
or changing the AWS CLI global configuration file. For more
                        information, see
cli_binary_format
in the
AWS Command Line Interface User Guide for Version
                            2
.
aws socialmessaging send-whatsapp-message --message '
{
"messaging_product":"whatsapp","to":"'
{
PHONE_NUMBER}
'","type":"template","template":
{
"name":"statement","language":
{
"code":"en_US"},"components":[
{
"type":"body","parameters":[
{
"type":"text","text":"1000"}]}]}}' --origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
--meta-api-version v20.0
In the preceding command, do the following:
Replace
{
PHONE_NUMBER}
with your customer's phone
                    number.
Replace
{
ORIGINATION_PHONE_NUMBER_ID}
with your
                    phone number's ID.
The following example shows how to send a template message that doesn't contain any
            components.
aws socialmessaging send-whatsapp-message --message '
{
"messaging_product": "whatsapp","to": "'
{
PHONE_NUMBER}
'","type": "template","template":
{
"name":"simple_template","language":
{
"code": "en_US"}}}' --origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
--meta-api-version v20.0
Replace
{
PHONE_NUMBER}
with your customer's phone
                    number.
Replace
{
ORIGINATION_PHONE_NUMBER_ID}
with your
                    phone number's ID.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Sending messages
Sending a media message

---

## Phone number considerations for use with a WABA - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-phone-numbers_body.html

Phone number considerations for use with a WABA
When you link a phone number with your WhatsApp Business Account (WABA), you should consider the
            following:
Phone numbers can only be linked to one WABA at a time.
The phone number can still be used for SMS, MMS, and voice calls.
Each phone number has a quality rating from Meta.
You can obtain an SMS-capable phone number through AWS End User Messaging SMS by
            doing the following:
Make sure that the
country or region
for the phone number supports
                    two-way SMS.
Request the
phone number
. Depending on the country or
                    region, you may be required to register the phone number.
Enable two-way SMS messaging
for the phone number. Once setup is
                    complete, your incoming SMS messages are sent to an event destination.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Phone numbers
Add a phone number

---

## Uploading media files to send with WhatsApp - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-media-files-s3.html

Uploading media files to send with WhatsApp
When you send or receive a media file, it has to be stored in an Amazon S3 bucket and uploaded or retrieved from WhatsApp. The Amazon S3
        bucket must be in the same AWS account and AWS Region as your WhatsApp Business Account (WABA). These
        directions show how to create an Amazon S3 bucket, upload a file, and build the URL to the file.
        For more information on Amazon S3 commands, see
Use
            high-level (s3) commands with the AWS CLI
. For more information on configuring
        the AWS CLI, see
Configure the AWS CLI
in the
AWS Command Line Interface User Guide
, and
Creating a bucket
, and
Uploading
            objects
in the
Amazon S3 User Guide
.
Note
WhatsApp stores media files for 30 days before deleting them, see
Upload Media
in the
WhatsApp Business Platform Cloud API
                Reference
.
You can also create a
presigned URL
to the media file. With a presigned URL, you
        can grant time-limited access to objects and upload them without requiring another party to
        have AWS security credentials or permissions.
To create an Amazon S3 bucket, use the
create-bucket
AWS CLI command. At the command line, enter the following
        command:
aws s3api create-bucket --region '
us-east-1
' --bucket
BucketName
In the preceding command:
Replace
us-east-1
with the AWS Region that your WABA
                is in.
Replace
BucketName
with the name of the new bucket.
To copy a file to the Amazon S3 bucket, use the
cp
AWS CLI command. At the command line, enter the following
        command:
aws s3 cp
SourceFilePathAndName
s3://
BucketName
/
FileName
In the preceding command:
Replace
SourceFilePathAndName
with the file path and name
            of the file to copy.
Replace
BucketName
with the name of the bucket.
Replace
FileName
with the name to use for the file.
The url to use when sending is:
s3://
BucketName
/
FileName
To create a
presigned URL
, replace the
user input
            placeholders
with your own information.
aws s3 presign s3://
amzn-s3-demo-bucket1
/
mydoc.txt
--expires-in
604800
--region
af-south-1
--endpoint-url
https://s3.af-south-1.amazonaws.com
The returned URL will be:
https://amzn-s3-demo-bucket1.s3.af-south-1.amazonaws.com/mydoc.txt?
{
Headers}
Upload the media file to WhatsApp using the
post-whatsapp-message-media
command. On
            successful completion, the command will return the
{
MEDIA_ID}
, which is required for sending the
            media message.
aws socialmessaging post-whatsapp-message-media --origination-phone-number-id
{
ORIGINATION_PHONE_NUMBER_ID}
--source-s3-file bucketName=
{
BUCKET}
,key=
{
MEDIA_FILE}
In the preceding command, do the following:
Replace
{
ORIGINATION_PHONE_NUMBER_ID}
with
                        your phone number's ID.
Replace
{
BUCKET}
with the name of the Amazon S3
                        bucket.
Replace
{
MEDIA_FILE}
with the name of the
                        media file.
You can also upload using a
presign url
by using
--source-s3-presigned-url
instead
                of
--source-s3-file
. You must add
Content-Type
in the
headers
field. If you use both then an
InvalidParameterException
is returned.
--source-s3-presigned-url headers=
{
"
Name
":"
Value
"},url=
https://BUCKET.s3.REGION/MEDIA_FILE
On successful completion the
MEDIA_ID
is returned. The
MEDIA_ID
is used to reference the media file when
sending a media message
.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Message status
Supported media file types

---

