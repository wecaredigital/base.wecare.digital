# AWS Social Messaging API Reference - Complete

Crawled: 46 pages
Generated: 2026-01-20 21:39:07

---

## Welcome - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/Welcome.html

Welcome
AWS End User Messaging Social
, also referred to as Social messaging, is a messaging service that enables
         application developers to incorporate WhatsApp into their existing workflows. The
AWS End User Messaging Social API
provides information about the
AWS End User Messaging Social API
resources, including supported HTTP methods, parameters, and schemas.
The
AWS End User Messaging Social API
provides programmatic access to options that are unique to the WhatsApp Business Platform.
If you're new to the
AWS End User Messaging Social API
, it's also helpful to review
What is
               AWS End User Messaging Social
in the
AWS End User Messaging Social User Guide
. The
AWS End User Messaging Social User Guide
provides tutorials, code samples, and procedures that demonstrate how to use
AWS End User Messaging Social API
features programmatically and how to integrate functionality into applications.
         The guide also provides key information, such as integration with other AWS
         services, and the quotas that apply to use of the service.
Regional availability
The
AWS End User Messaging Social API
is available across several AWS Regions and it provides a dedicated endpoint for each of these Regions. For a list of
         all the Regions and endpoints where the API is currently available, see
AWS Service Endpoints
and
AWS End User Messaging endpoints and quotas
in the AWS General Reference. To learn more about AWS Regions, see
Managing
               AWS Regions
in the AWS General
         Reference.
In each Region, AWS maintains multiple Availability Zones. These
         Availability Zones are physically isolated from each other, but are united by private,
         low-latency, high-throughput, and highly redundant network connections. These Availability
         Zones enable us to provide very high levels of availability and redundancy, while also
         minimizing latency. To learn more about the number of Availability Zones that are available
         in each Region, see
AWS Global Infrastructure.
This document was last published on January 19, 2026.
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Actions

---

## Actions - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_Operations.html

Actions
The following actions are supported:
AssociateWhatsAppBusinessAccount
CreateWhatsAppMessageTemplate
CreateWhatsAppMessageTemplateFromLibrary
CreateWhatsAppMessageTemplateMedia
DeleteWhatsAppMessageMedia
DeleteWhatsAppMessageTemplate
DisassociateWhatsAppBusinessAccount
GetLinkedWhatsAppBusinessAccount
GetLinkedWhatsAppBusinessAccountPhoneNumber
GetWhatsAppMessageMedia
GetWhatsAppMessageTemplate
ListLinkedWhatsAppBusinessAccounts
ListTagsForResource
ListWhatsAppMessageTemplates
ListWhatsAppTemplateLibrary
PostWhatsAppMessageMedia
PutWhatsAppBusinessAccountEventDestinations
SendWhatsAppMessage
TagResource
UntagResource
UpdateWhatsAppMessageTemplate
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Welcome
AssociateWhatsAppBusinessAccount

---

## Data Types - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_Types.html

Data Types
The AWS End User Messaging Social API contains several data types that various actions use. This section describes each data type in detail.
Note
The order of each element in a data type structure is not guaranteed. Applications should not assume a particular order.
The following data types are supported:
LibraryTemplateBodyInputs
LibraryTemplateButtonInput
LibraryTemplateButtonList
LinkedWhatsAppBusinessAccount
LinkedWhatsAppBusinessAccountIdMetaData
LinkedWhatsAppBusinessAccountSummary
MetaLibraryTemplate
MetaLibraryTemplateDefinition
S3File
S3PresignedUrl
Tag
TemplateSummary
WabaPhoneNumberSetupFinalization
WabaSetupFinalization
WhatsAppBusinessAccountEventDestination
WhatsAppPhoneNumberDetail
WhatsAppPhoneNumberSummary
WhatsAppSetupFinalization
WhatsAppSignupCallback
WhatsAppSignupCallbackResult
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
UpdateWhatsAppMessageTemplate
LibraryTemplateBodyInputs

---

## Common Parameters - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/CommonParameters.html

Common Parameters
The following list contains the parameters that all actions use for signing Signature
    Version 4 requests with a query string. Any action-specific parameters are listed in the topic
    for that action. For more information about Signature Version 4, see
Signing AWS API requests
in the
IAM User Guide
.
Action
The action to be performed.
Type: string
Required: Yes
Version
The API version that the request is written for, expressed in the format YYYY-MM-DD.
Type: string
Required: Yes
X-Amz-Algorithm
The hash algorithm that you used to create the request signature.
Condition: Specify this parameter when you include authentication information in a query string instead of in the HTTP authorization header.
Type: string
Valid Values:
AWS4-HMAC-SHA256
Required: Conditional
X-Amz-Credential
The credential scope value, which is a string that includes your access key, the date, the region you are targeting, the service you are requesting, and a termination string ("aws4_request"). The value is expressed in the following format:
access_key
/
YYYYMMDD
/
region
/
service
/aws4_request.
For more information, see
Create a signed AWS API request
in the
IAM User Guide
.
Condition: Specify this parameter when you include authentication information in a query string instead of in the HTTP authorization header.
Type: string
Required: Conditional
X-Amz-Date
The date that is used to create the signature. The format must be ISO 8601 basic format (YYYYMMDD'T'HHMMSS'Z'). For example, the following date time is a valid X-Amz-Date value:
20120325T120000Z
.
Condition: X-Amz-Date is optional for all requests; it can be used to override the date used for signing requests. If the Date header is specified in the ISO 8601 basic format, X-Amz-Date is not required. When X-Amz-Date is used, it always
          overrides the value of the Date header. For more information, see
Elements of an AWS API request signature
in the
IAM User Guide
.
Type: string
Required: Conditional
X-Amz-Security-Token
The temporary security token that was obtained through a call to AWS Security Token Service (AWS STS). For a list of services that support temporary security credentials from
          AWS STS, see
AWS services that work with IAM
in the
IAM User Guide
.
Condition: If you're using temporary security credentials from AWS STS, you must include
          the security token.
Type: string
Required: Conditional
X-Amz-Signature
Specifies the hex-encoded signature that was calculated from the string to sign and the derived signing key.
Condition: Specify this parameter when you include authentication information in a query string instead of in the HTTP authorization header.
Type: string
Required: Conditional
X-Amz-SignedHeaders
Specifies all the HTTP headers that were included as part of the canonical request.
          For more information about specifying signed headers, see
Create a signed AWS API request
in the
IAM User Guide
.
Condition: Specify this parameter when you include authentication information in a query string instead of in the HTTP authorization header.
Type: string
Required: Conditional
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsAppSignupCallbackResult
Common Errors

---

## Common Errors - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/CommonErrors.html

Common Errors
This section lists the errors common to the API actions of all AWS services. For errors specific to an API action for this service, see the topic for that API action.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
ExpiredTokenException
The security token included in the request is expired
HTTP Status Code: 403
IncompleteSignature
The request signature does not conform to AWS standards.
HTTP Status Code: 403
InternalFailure
The request processing has failed because of an unknown error, exception or failure.
HTTP Status Code: 500
MalformedHttpRequestException
Problems with the request at the HTTP level, e.g. we can't decompress the body according to the decompression algorithm specified by the content-encoding.
HTTP Status Code: 400
NotAuthorized
You do not have permission to perform this action.
HTTP Status Code: 401
OptInRequired
The AWS access key ID needs a subscription for the service.
HTTP Status Code: 403
RequestAbortedException
Convenient exception that can be used when a request is aborted before a reply is sent back (e.g. client closed connection).
HTTP Status Code: 400
RequestEntityTooLargeException
Problems with the request at the HTTP level. The request entity is too large.
HTTP Status Code: 413
RequestExpired
The request reached the service more than 15 minutes after the date stamp on the request or more than 15 minutes after the request expiration date (such as for pre-signed URLs), or the date stamp on the request is more than 15 minutes in the
          future.
HTTP Status Code: 400
RequestTimeoutException
Problems with the request at the HTTP level. Reading the Request timed out.
HTTP Status Code: 408
ServiceUnavailable
The request has failed due to a temporary failure of the server.
HTTP Status Code: 503
ThrottlingException
The request was denied due to request throttling.
HTTP Status Code: 400
UnrecognizedClientException
The X.509 certificate or AWS access key ID provided does not exist in our records.
HTTP Status Code: 403
UnknownOperationException
The action or operation requested is invalid. Verify that the action is typed correctly.
HTTP Status Code: 404
ValidationError
The input fails to satisfy the constraints specified by an AWS service.
HTTP Status Code: 400
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Common Parameters

---

## AssociateWhatsAppBusinessAccount - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_AssociateWhatsAppBusinessAccount.html

AssociateWhatsAppBusinessAccount
This is only used through the AWS console during sign-up to associate your WhatsApp Business Account to your AWS account.
Request Syntax
POST /v1/whatsapp/signup HTTP/1.1
Content-type: application/json
{
"
setupFinalization
":
{
"
associateInProgressToken
": "
string
",
      "
phoneNumberParent
": "
string
",
      "
phoneNumbers
": [
{
"
dataLocalizationRegion
": "
string
",
            "
id
": "
string
",
            "
tags
": [
{
"
key
": "
string
",
                  "
value
": "
string
"
               }
            ],
            "
twoFactorPin
": "
string
"
         }
      ],
      "
waba
":
{
"
eventDestinations
": [
{
"
eventDestinationArn
": "
string
",
               "
roleArn
": "
string
"
            }
         ],
         "
id
": "
string
",
         "
tags
": [
{
"
key
": "
string
",
               "
value
": "
string
"
            }
         ]
      }
   },
   "
signupCallback
":
{
"
accessToken
": "
string
",
      "
callbackUrl
": "
string
"
   }
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
setupFinalization
A JSON object that contains the phone numbers and WhatsApp Business Account to link to your account.
Type:
WhatsAppSetupFinalization
object
Required: No
signupCallback
Contains the callback access token.
Type:
WhatsAppSignupCallback
object
Required: No
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
signupCallbackResult
":
{
"
associateInProgressToken
": "
string
",
      "
linkedAccountsWithIncompleteSetup
":
{
"
string
" :
{
"
accountName
": "
string
",
            "
registrationStatus
": "
string
",
            "
unregisteredWhatsAppPhoneNumbers
": [
{
"
arn
": "
string
",
                  "
dataLocalizationRegion
": "
string
",
                  "
displayPhoneNumber
": "
string
",
                  "
displayPhoneNumberName
": "
string
",
                  "
metaPhoneNumberId
": "
string
",
                  "
phoneNumber
": "
string
",
                  "
phoneNumberId
": "
string
",
                  "
qualityRating
": "
string
"
               }
            ],
            "
wabaId
": "
string
"
         }
      }
   },
   "
statusCode
":
number
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
signupCallbackResult
Contains your WhatsApp registration status.
Type:
WhatsAppSignupCallbackResult
object
statusCode
The status code for the response.
Type: Integer
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
LimitExceededException
The request was denied because it would exceed one or more service quotas or limits.
HTTP Status Code: 400
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Actions
CreateWhatsAppMessageTemplate

---

## CreateWhatsAppMessageTemplate - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_CreateWhatsAppMessageTemplate.html

CreateWhatsAppMessageTemplate
Creates a new WhatsApp message template from a custom definition.
Note
AWS End User Messaging Social does not store any WhatsApp message template content.
Request Syntax
POST /v1/whatsapp/template/put HTTP/1.1
Content-type: application/json
{
"
id
": "
string
",
   "
templateDefinition
":
blob
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
id
The ID of the WhatsApp Business Account to associate with this template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
templateDefinition
The complete template definition as a JSON blob.
Type: Base64-encoded binary data object
Length Constraints: Minimum length of 1. Maximum length of 6000.
Required: Yes
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
category
": "
string
",
   "
metaTemplateId
": "
string
",
   "
templateStatus
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
category
The category of the template, such as UTILITY or MARKETING.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
metaTemplateId
The numeric ID assigned to the template by Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
templateStatus
The status of the created template, such as PENDING or APPROVED..
Type: String
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
AssociateWhatsAppBusinessAccount
CreateWhatsAppMessageTemplateFromLibrary

---

## CreateWhatsAppMessageTemplateFromLibrary - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_CreateWhatsAppMessageTemplateFromLibrary.html

CreateWhatsAppMessageTemplateFromLibrary
Creates a new WhatsApp message template using a template from Meta's template library.
Request Syntax
POST /v1/whatsapp/template/create HTTP/1.1
Content-type: application/json
{
"
id
": "
string
",
   "
metaLibraryTemplate
":
{
"
libraryTemplateBodyInputs
":
{
"
addContactNumber
":
boolean
,
         "
addLearnMoreLink
":
boolean
,
         "
addSecurityRecommendation
":
boolean
,
         "
addTrackPackageLink
":
boolean
,
         "
codeExpirationMinutes
":
number
},
      "
libraryTemplateButtonInputs
": [
{
"
otpType
": "
string
",
            "
phoneNumber
": "
string
",
            "
supportedApps
": [
{
"
string
" : "
string
" 
               }
            ],
            "
type
": "
string
",
            "
url
":
{
"
string
" : "
string
" 
            },
            "
zeroTapTermsAccepted
":
boolean
}
      ],
      "
libraryTemplateName
": "
string
",
      "
templateCategory
": "
string
",
      "
templateLanguage
": "
string
",
      "
templateName
": "
string
"
   }
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
id
The ID of the WhatsApp Business Account to associate with this template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
metaLibraryTemplate
The template configuration from Meta's library, including customizations for buttons and body text.
Type:
MetaLibraryTemplate
object
Required: Yes
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
category
": "
string
",
   "
metaTemplateId
": "
string
",
   "
templateStatus
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
category
The category of the template (for example, UTILITY or MARKETING).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
metaTemplateId
The numeric ID assigned to the template by Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
templateStatus
The status of the created template (for example, PENDING or APPROVED).
Type: String
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
CreateWhatsAppMessageTemplate
CreateWhatsAppMessageTemplateMedia

---

## CreateWhatsAppMessageTemplateMedia - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_CreateWhatsAppMessageTemplateMedia.html

CreateWhatsAppMessageTemplateMedia
Uploads media for use in a WhatsApp message template.
Request Syntax
POST /v1/whatsapp/template/media HTTP/1.1
Content-type: application/json
{
"
id
": "
string
",
   "
sourceS3File
":
{
"
bucketName
": "
string
",
      "
key
": "
string
"
   }
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
id
The ID of the WhatsApp Business Account associated with this media upload.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
sourceS3File
Contains information for the S3 bucket that contains media files.
Type:
S3File
object
Required: No
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
metaHeaderHandle
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
metaHeaderHandle
The handle assigned to the uploaded media by Meta, used to reference the media in templates.
Type: String
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
CreateWhatsAppMessageTemplateFromLibrary
DeleteWhatsAppMessageMedia

---

## DeleteWhatsAppMessageMedia - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_DeleteWhatsAppMessageMedia.html

DeleteWhatsAppMessageMedia
Delete a media object from the WhatsApp service. If the object is still in an Amazon S3 bucket you should delete it from there too.
Request Syntax
DELETE /v1/whatsapp/media?mediaId=
mediaId
&originationPhoneNumberId=
originationPhoneNumberId
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
mediaId
The unique identifier of the media file to delete. Use the
mediaId
returned from
PostWhatsAppMessageMedia
.
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[A-Za-z0-9]+
Required: Yes
originationPhoneNumberId
The unique identifier of the originating phone number associated with the media. Phone
         number identifiers are formatted as
phone-number-id-01234567890123456789012345678901
. Use
GetLinkedWhatsAppBusinessAccount
to find a phone number's
         id.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
success
":
boolean
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
success
Success indicator for deleting the media file.
Type: Boolean
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedByMetaException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
CreateWhatsAppMessageTemplateMedia
DeleteWhatsAppMessageTemplate

---

## DeleteWhatsAppMessageTemplate - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_DeleteWhatsAppMessageTemplate.html

DeleteWhatsAppMessageTemplate
Deletes a WhatsApp message template.
Request Syntax
DELETE /v1/whatsapp/template?deleteAllTemplates=
deleteAllLanguages
&id=
id
&metaTemplateId=
metaTemplateId
&templateName=
templateName
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
deleteAllLanguages
If true, deletes all language versions of the template.
id
The ID of the WhatsApp Business Account associated with this template.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
metaTemplateId
The numeric ID of the template assigned by Meta.
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
templateName
The name of the template to delete.
Length Constraints: Minimum length of 1. Maximum length of 512.
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Response Elements
If the action is successful, the service sends back an HTTP 200 response with an empty HTTP body.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
DeleteWhatsAppMessageMedia
DisassociateWhatsAppBusinessAccount

---

## DisassociateWhatsAppBusinessAccount - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_DisassociateWhatsAppBusinessAccount.html

DisassociateWhatsAppBusinessAccount
Disassociate a WhatsApp Business Account (WABA) from your AWS account.
Request Syntax
DELETE /v1/whatsapp/waba/disassociate?id=
id
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
id
The unique identifier of your WhatsApp Business Account. WABA identifiers are formatted as
waba-01234567890123456789012345678901
. Use
ListLinkedWhatsAppBusinessAccounts
to list all WABAs 
         and their details.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Response Elements
If the action is successful, the service sends back an HTTP 200 response with an empty HTTP body.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
DeleteWhatsAppMessageTemplate
GetLinkedWhatsAppBusinessAccount

---

## GetLinkedWhatsAppBusinessAccount - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_GetLinkedWhatsAppBusinessAccount.html

GetLinkedWhatsAppBusinessAccount
Get the details of your linked WhatsApp Business Account.
Request Syntax
GET /v1/whatsapp/waba/details?id=
id
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
id
The unique identifier, from AWS, of the linked WhatsApp Business
         Account. WABA identifiers are formatted as
waba-01234567890123456789012345678901
. Use
ListLinkedWhatsAppBusinessAccounts
to list all WABAs and their details.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
account
":
{
"
arn
": "
string
",
      "
enableReceiving
":
boolean
,
      "
enableSending
":
boolean
,
      "
eventDestinations
": [
{
"
eventDestinationArn
": "
string
",
            "
roleArn
": "
string
"
         }
      ],
      "
id
": "
string
",
      "
linkDate
":
number
,
      "
phoneNumbers
": [
{
"
arn
": "
string
",
            "
dataLocalizationRegion
": "
string
",
            "
displayPhoneNumber
": "
string
",
            "
displayPhoneNumberName
": "
string
",
            "
metaPhoneNumberId
": "
string
",
            "
phoneNumber
": "
string
",
            "
phoneNumberId
": "
string
",
            "
qualityRating
": "
string
"
         }
      ],
      "
registrationStatus
": "
string
",
      "
wabaId
": "
string
",
      "
wabaName
": "
string
"
   }
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
account
The details of the linked WhatsApp Business Account.
Type:
LinkedWhatsAppBusinessAccount
object
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
DisassociateWhatsAppBusinessAccount
GetLinkedWhatsAppBusinessAccountPhoneNumber

---

## GetLinkedWhatsAppBusinessAccountPhoneNumber - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_GetLinkedWhatsAppBusinessAccountPhoneNumber.html

GetLinkedWhatsAppBusinessAccountPhoneNumber
Retrieve the WABA account id and phone number details of a WhatsApp business account phone number.
Request Syntax
GET /v1/whatsapp/waba/phone/details?id=
id
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
id
The unique identifier of the phone number. Phone number
         identifiers are formatted as
phone-number-id-01234567890123456789012345678901
.
         Use
GetLinkedWhatsAppBusinessAccount
to find a phone number's id.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
linkedWhatsAppBusinessAccountId
": "
string
",
   "
phoneNumber
":
{
"
arn
": "
string
",
      "
dataLocalizationRegion
": "
string
",
      "
displayPhoneNumber
": "
string
",
      "
displayPhoneNumberName
": "
string
",
      "
metaPhoneNumberId
": "
string
",
      "
phoneNumber
": "
string
",
      "
phoneNumberId
": "
string
",
      "
qualityRating
": "
string
"
   }
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
linkedWhatsAppBusinessAccountId
The WABA identifier linked to the phone number, formatted as
waba-01234567890123456789012345678901
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
phoneNumber
The details of your WhatsApp phone number.
Type:
WhatsAppPhoneNumberDetail
object
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
GetLinkedWhatsAppBusinessAccount
GetWhatsAppMessageMedia

---

## GetWhatsAppMessageMedia - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_GetWhatsAppMessageMedia.html

GetWhatsAppMessageMedia
Get a media file from the WhatsApp service. On successful completion the media file is
         retrieved from Meta and stored in the specified Amazon S3 bucket. Use either
destinationS3File
or
destinationS3PresignedUrl
for the
         destination. If both are used then an
InvalidParameterException
is
         returned.
Request Syntax
POST /v1/whatsapp/media/get HTTP/1.1
Content-type: application/json
{
"
destinationS3File
":
{
"
bucketName
": "
string
",
      "
key
": "
string
"
   },
   "
destinationS3PresignedUrl
":
{
"
headers
":
{
"
string
" : "
string
" 
      },
      "
url
": "
string
"
   },
   "
mediaId
": "
string
",
   "
metadataOnly
":
boolean
,
   "
originationPhoneNumberId
": "
string
"
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
destinationS3File
The
bucketName
and
key
of the S3 media file.
Type:
S3File
object
Required: No
destinationS3PresignedUrl
The presign url of the media file.
Type:
S3PresignedUrl
object
Required: No
mediaId
The unique identifier for the media file.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[A-Za-z0-9]+
Required: Yes
metadataOnly
Set to
True
to get only the metadata for the file.
Type: Boolean
Required: No
originationPhoneNumberId
The unique identifier of the originating phone number for the WhatsApp message media.
         The phone number identifiers are formatted as
phone-number-id-01234567890123456789012345678901
. Use
GetLinkedWhatsAppBusinessAccount
to find a phone number's
         id.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
fileSize
":
number
,
   "
mimeType
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
fileSize
The size of the media file, in KB.
Type: Long
mimeType
The MIME type of the media.
Type: String
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedByMetaException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
GetLinkedWhatsAppBusinessAccountPhoneNumber
GetWhatsAppMessageTemplate

---

## GetWhatsAppMessageTemplate - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_GetWhatsAppMessageTemplate.html

GetWhatsAppMessageTemplate
Retrieves a specific WhatsApp message template.
Request Syntax
GET /v1/whatsapp/template?id=
id
&metaTemplateId=
metaTemplateId
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
id
The ID of the WhatsApp Business Account associated with this template.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
metaTemplateId
The numeric ID of the template assigned by Meta.
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
template
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
template
The complete template definition as a JSON string (maximum 6000 characters).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 6000.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
GetWhatsAppMessageMedia
ListLinkedWhatsAppBusinessAccounts

---

## ListLinkedWhatsAppBusinessAccounts - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_ListLinkedWhatsAppBusinessAccounts.html

ListLinkedWhatsAppBusinessAccounts
List all WhatsApp Business Accounts linked to your AWS account.
Request Syntax
GET /v1/whatsapp/waba/list?maxResults=
maxResults
&nextToken=
nextToken
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
maxResults
The maximum number of results to return.
Valid Range: Minimum value of 1. Maximum value of 100.
nextToken
The next token for pagination.
Length Constraints: Minimum length of 1. Maximum length of 600.
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
linkedAccounts
": [
{
"
arn
": "
string
",
         "
enableReceiving
":
boolean
,
         "
enableSending
":
boolean
,
         "
eventDestinations
": [
{
"
eventDestinationArn
": "
string
",
               "
roleArn
": "
string
"
            }
         ],
         "
id
": "
string
",
         "
linkDate
":
number
,
         "
registrationStatus
": "
string
",
         "
wabaId
": "
string
",
         "
wabaName
": "
string
"
      }
   ],
   "
nextToken
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
linkedAccounts
A list of WhatsApp Business Accounts linked to your AWS account.
Type: Array of
LinkedWhatsAppBusinessAccountSummary
objects
nextToken
The next token for pagination.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 600.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
GetWhatsAppMessageTemplate
ListTagsForResource

---

## ListTagsForResource - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_ListTagsForResource.html

ListTagsForResource
List all tags associated with a resource, such as a phone number or WABA.
Request Syntax
GET /v1/tags/list?resourceArn=
resourceArn
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
resourceArn
The Amazon Resource Name (ARN) of the resource to retrieve the tags from.
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*
Required: Yes
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
statusCode
":
number
,
   "
tags
": [
{
"
key
": "
string
",
         "
value
": "
string
"
      }
   ]
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
statusCode
The status code of the response.
Type: Integer
tags
The tags for the resource.
Type: Array of
Tag
objects
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
ListLinkedWhatsAppBusinessAccounts
ListWhatsAppMessageTemplates

---

## ListWhatsAppMessageTemplates - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_ListWhatsAppMessageTemplates.html

ListWhatsAppMessageTemplates
Lists WhatsApp message templates for a specific WhatsApp Business Account.
Request Syntax
GET /v1/whatsapp/template/list?id=
id
&maxResults=
maxResults
&nextToken=
nextToken
HTTP/1.1
URI Request Parameters
The request uses the following URI parameters.
id
The ID of the WhatsApp Business Account to list templates for.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
maxResults
The maximum number of results to return per page (1-100).
Valid Range: Minimum value of 1. Maximum value of 100.
nextToken
The token for the next page of results.
Length Constraints: Minimum length of 1. Maximum length of 600.
Request Body
The request does not have a request body.
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
nextToken
": "
string
",
   "
templates
": [
{
"
metaTemplateId
": "
string
",
         "
templateCategory
": "
string
",
         "
templateLanguage
": "
string
",
         "
templateName
": "
string
",
         "
templateQualityScore
": "
string
",
         "
templateStatus
": "
string
"
      }
   ]
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
nextToken
The token to retrieve the next page of results, if any.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 600.
templates
A list of template summaries.
Type: Array of
TemplateSummary
objects
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
ListTagsForResource
ListWhatsAppTemplateLibrary

---

## ListWhatsAppTemplateLibrary - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_ListWhatsAppTemplateLibrary.html

ListWhatsAppTemplateLibrary
Lists templates available in Meta's template library for WhatsApp messaging.
Request Syntax
POST /v1/whatsapp/template/library?id=
id
HTTP/1.1
Content-type: application/json
{
"
filters
":
{
"
string
" : "
string
" 
   },
   "
maxResults
":
number
,
   "
nextToken
": "
string
"
}
URI Request Parameters
The request uses the following URI parameters.
id
The ID of the WhatsApp Business Account to list library templates for.
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
Request Body
The request accepts the following data in JSON format.
filters
Map of filters to apply (searchKey, topic, usecase, industry, language).
Type: String to string map
Map Entries: Minimum number of 0 items. Maximum number of 10 items.
Key Length Constraints: Minimum length of 1. Maximum length of 100.
Value Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
maxResults
The maximum number of results to return per page (1-100).
Type: Integer
Valid Range: Minimum value of 1. Maximum value of 100.
Required: No
nextToken
The token for the next page of results.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 600.
Required: No
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
metaLibraryTemplates
": [
{
"
templateBody
": "
string
",
         "
templateBodyExampleParams
": [ "
string
" ],
         "
templateButtons
": [
{
"
otpType
": "
string
",
               "
phoneNumber
": "
string
",
               "
supportedApps
": [
{
"
string
" : "
string
" 
                  }
               ],
               "
text
": "
string
",
               "
type
": "
string
",
               "
url
": "
string
",
               "
zeroTapTermsAccepted
":
boolean
}
         ],
         "
templateCategory
": "
string
",
         "
templateHeader
": "
string
",
         "
templateId
": "
string
",
         "
templateIndustry
": [ "
string
" ],
         "
templateLanguage
": "
string
",
         "
templateName
": "
string
",
         "
templateTopic
": "
string
",
         "
templateUseCase
": "
string
"
      }
   ],
   "
nextToken
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
metaLibraryTemplates
A list of templates from Meta's library.
Type: Array of
MetaLibraryTemplateDefinition
objects
nextToken
The token to retrieve the next page of results, if any.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 600.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
ListWhatsAppMessageTemplates
PostWhatsAppMessageMedia

---

## PostWhatsAppMessageMedia - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_PostWhatsAppMessageMedia.html

PostWhatsAppMessageMedia
Upload a media file to the WhatsApp service. Only the specified
originationPhoneNumberId
has the permissions to send the media file when
         using
SendWhatsAppMessage
. You must use either
sourceS3File
or
sourceS3PresignedUrl
for the source. If both or neither are specified then an
InvalidParameterException
is returned.
Request Syntax
POST /v1/whatsapp/media HTTP/1.1
Content-type: application/json
{
"
originationPhoneNumberId
": "
string
",
   "
sourceS3File
":
{
"
bucketName
": "
string
",
      "
key
": "
string
"
   },
   "
sourceS3PresignedUrl
":
{
"
headers
":
{
"
string
" : "
string
" 
      },
      "
url
": "
string
"
   }
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
originationPhoneNumberId
The ID of the phone number to associate with the WhatsApp media file. The phone number
         identifiers are formatted as
phone-number-id-01234567890123456789012345678901
.
         Use
GetLinkedWhatsAppBusinessAccount
to find a phone number's id.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
sourceS3File
The source S3 url for the media file.
Type:
S3File
object
Required: No
sourceS3PresignedUrl
The source presign url of the media file.
Type:
S3PresignedUrl
object
Required: No
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
mediaId
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
mediaId
The unique identifier of the posted WhatsApp message.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[A-Za-z0-9]+
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedByMetaException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
ListWhatsAppTemplateLibrary
PutWhatsAppBusinessAccountEventDestinations

---

## PutWhatsAppBusinessAccountEventDestinations - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_PutWhatsAppBusinessAccountEventDestinations.html

PutWhatsAppBusinessAccountEventDestinations
Add an event destination to log event data from WhatsApp for a WhatsApp Business Account (WABA). A WABA can only have one event destination at a time. All resources associated with the WABA use the same event destination.
Request Syntax
PUT /v1/whatsapp/waba/eventdestinations HTTP/1.1
Content-type: application/json
{
"
eventDestinations
": [
{
"
eventDestinationArn
": "
string
",
         "
roleArn
": "
string
"
      }
   ],
   "
id
": "
string
"
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
eventDestinations
An array of
WhatsAppBusinessAccountEventDestination
event destinations.
Type: Array of
WhatsAppBusinessAccountEventDestination
objects
Array Members: Minimum number of 0 items. Maximum number of 1 item.
Required: Yes
id
The unique identifier of your WhatsApp Business Account. WABA identifiers are formatted as
waba-01234567890123456789012345678901
. Use
ListLinkedWhatsAppBusinessAccounts
to list all WABAs and their details.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
Response Syntax
HTTP/1.1 200
Response Elements
If the action is successful, the service sends back an HTTP 200 response with an empty HTTP body.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
PostWhatsAppMessageMedia
SendWhatsAppMessage

---

## SendWhatsAppMessage - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_SendWhatsAppMessage.html

SendWhatsAppMessage
Send a WhatsApp message. For examples of sending a message using the AWS
         CLI, see
Sending messages
in the
AWS End User Messaging Social User Guide
.
Request Syntax
POST /v1/whatsapp/send HTTP/1.1
Content-type: application/json
{
"
message
":
blob
,
   "
metaApiVersion
": "
string
",
   "
originationPhoneNumberId
": "
string
"
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
message
The message to send through WhatsApp. The length is in KB. The message field passes through a WhatsApp
         Message object, see
Messages
in the
WhatsApp Business Platform Cloud API
               Reference
.
Type: Base64-encoded binary data object
Length Constraints: Minimum length of 1. Maximum length of 2048000.
Required: Yes
metaApiVersion
The API version for the request formatted as
v
{
VersionNumber}
. For a list of supported API versions and AWS Regions, see
AWS End User Messaging Social API
Service Endpoints
in the
AWS General Reference
.
Type: String
Required: Yes
originationPhoneNumberId
The ID of the phone number used to send the WhatsApp message. If you are sending a media
         file only the
originationPhoneNumberId
used to upload the file can be used.
         Phone number identifiers are formatted as
phone-number-id-01234567890123456789012345678901
. Use
GetLinkedWhatsAppBusinessAccount
to find a phone number's
         id.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
messageId
": "
string
"
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
messageId
The unique identifier of the message.
Type: String
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
PutWhatsAppBusinessAccountEventDestinations
TagResource

---

## TagResource - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_TagResource.html

TagResource
Adds or overwrites only the specified tags for the specified resource. When you specify
         an existing tag key, the value is overwritten with the new value.
Request Syntax
POST /v1/tags/tag-resource HTTP/1.1
Content-type: application/json
{
"
resourceArn
": "
string
",
   "
tags
": [
{
"
key
": "
string
",
         "
value
": "
string
"
      }
   ]
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
resourceArn
The Amazon Resource Name (ARN) of the resource to tag.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*
Required: Yes
tags
The tags to add to the resource.
Type: Array of
Tag
objects
Required: Yes
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
statusCode
":
number
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
statusCode
The status code of the tag resource operation.
Type: Integer
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
SendWhatsAppMessage
UntagResource

---

## UntagResource - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_UntagResource.html

UntagResource
Removes the specified tags from a resource.
Request Syntax
POST /v1/tags/untag-resource HTTP/1.1
Content-type: application/json
{
"
resourceArn
": "
string
",
   "
tagKeys
": [ "
string
" ]
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
resourceArn
The Amazon Resource Name (ARN) of the resource to remove tags from.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*
Required: Yes
tagKeys
The keys of the tags to remove from the resource.
Type: Array of strings
Required: Yes
Response Syntax
HTTP/1.1 200
Content-type: application/json
{
"
statusCode
":
number
}
Response Elements
If the action is successful, the service sends back an HTTP 200 response.
The following data is returned in JSON format by the service.
statusCode
The status code of the untag resource operation.
Type: Integer
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
TagResource
UpdateWhatsAppMessageTemplate

---

## UpdateWhatsAppMessageTemplate - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_UpdateWhatsAppMessageTemplate.html

UpdateWhatsAppMessageTemplate
Updates an existing WhatsApp message template.
Request Syntax
POST /v1/whatsapp/template HTTP/1.1
Content-type: application/json
{
"
ctaUrlLinkTrackingOptedOut
":
boolean
,
   "
id
": "
string
",
   "
metaTemplateId
": "
string
",
   "
parameterFormat
": "
string
",
   "
templateCategory
": "
string
",
   "
templateComponents
":
blob
}
URI Request Parameters
The request does not use any URI parameters.
Request Body
The request accepts the following data in JSON format.
ctaUrlLinkTrackingOptedOut
When true, disables click tracking for call-to-action URL buttons in the template.
Type: Boolean
Required: No
id
The ID of the WhatsApp Business Account associated with this template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
metaTemplateId
The numeric ID of the template assigned by Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
Required: Yes
parameterFormat
The format specification for parameters in the template, this can be either 'named' or 'positional'.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 15.
Required: No
templateCategory
The new category for the template (for example, UTILITY or MARKETING).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
templateComponents
The updated components of the template as a JSON blob (maximum 3000 characters).
Type: Base64-encoded binary data object
Length Constraints: Minimum length of 1. Maximum length of 3000.
Required: No
Response Syntax
HTTP/1.1 200
Response Elements
If the action is successful, the service sends back an HTTP 200 response with an empty HTTP body.
Errors
For information about the errors that are common to all actions, see
Common Errors
.
AccessDeniedException
You do not have sufficient access to perform this action.
HTTP Status Code: 403
DependencyException
Thrown when performing an action because a dependency would be broken.
HTTP Status Code: 502
InternalServiceException
The request processing has failed because of an unknown error, exception, or
         failure.
HTTP Status Code: 500
InvalidParametersException
One or more parameters provided to the action are not valid.
HTTP Status Code: 400
ResourceNotFoundException
The resource was not found.
HTTP Status Code: 404
ThrottledRequestException
The request was denied due to request throttling.
HTTP Status Code: 429
ValidationException
The request contains an invalid parameter value.
HTTP Status Code: 400
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS Command Line Interface V2
AWS SDK for .NET
AWS SDK for C++
AWS SDK for Go v2
AWS SDK for Java V2
AWS SDK for JavaScript V3
AWS SDK for Kotlin
AWS SDK for PHP V3
AWS SDK for Python
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
UntagResource
Data Types

---

## LibraryTemplateBodyInputs - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_LibraryTemplateBodyInputs.html

LibraryTemplateBodyInputs
Configuration options for customizing the body content of a template from Meta's library.
Contents
addContactNumber
When true, includes a contact number in the template body.
Type: Boolean
Required: No
addLearnMoreLink
When true, includes a "learn more" link in the template body.
Type: Boolean
Required: No
addSecurityRecommendation
When true, includes security recommendations in the template body.
Type: Boolean
Required: No
addTrackPackageLink
When true, includes a package tracking link in the template body.
Type: Boolean
Required: No
codeExpirationMinutes
The number of minutes until a verification code or OTP expires.
Type: Integer
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Data Types
LibraryTemplateButtonInput

---

## LibraryTemplateButtonInput - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_LibraryTemplateButtonInput.html

LibraryTemplateButtonInput
Configuration options for customizing buttons in a template from Meta's library.
Contents
otpType
The type of one-time password for OTP buttons.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 25.
Required: No
phoneNumber
The phone number in E.164 format for CALL-type buttons.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: No
supportedApps
List of supported applications for this button type.
Type: Array of string to string maps
Map Entries: Minimum number of 0 items. Maximum number of 10 items.
Key Length Constraints: Minimum length of 1. Maximum length of 30.
Value Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
type
The type of button (for example, QUICK_REPLY, CALL, or URL).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 25.
Required: No
url
The URL with dynamic parameters for URL-type buttons.
Type: String to string map
Map Entries: Minimum number of 0 items. Maximum number of 10 items.
Key Length Constraints: Minimum length of 1. Maximum length of 30.
Value Length Constraints: Minimum length of 1. Maximum length of 400.
Required: No
zeroTapTermsAccepted
When true, indicates acceptance of zero-tap terms for the button.
Type: Boolean
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
LibraryTemplateBodyInputs
LibraryTemplateButtonList

---

## LibraryTemplateButtonList - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_LibraryTemplateButtonList.html

LibraryTemplateButtonList
Defines a button in a template from Meta's library.
Contents
otpType
The type of one-time password for OTP buttons.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 25.
Required: No
phoneNumber
The phone number in E.164 format for CALL-type buttons.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: No
supportedApps
List of supported applications for this button type.
Type: Array of string to string maps
Map Entries: Minimum number of 0 items. Maximum number of 10 items.
Key Length Constraints: Minimum length of 1. Maximum length of 30.
Value Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
text
The text displayed on the button (maximum 40 characters).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 40.
Required: No
type
The type of button (for example, QUICK_REPLY, CALL, or URL).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 25.
Required: No
url
The URL for URL-type buttons.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 400.
Required: No
zeroTapTermsAccepted
When true, indicates acceptance of zero-tap terms for the button.
Type: Boolean
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
LibraryTemplateButtonInput
LinkedWhatsAppBusinessAccount

---

## LinkedWhatsAppBusinessAccount - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_LinkedWhatsAppBusinessAccount.html

LinkedWhatsAppBusinessAccount
The details of your linked WhatsApp Business Account.
Contents
arn
The ARN of the linked WhatsApp Business Account.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*:waba/[0-9a-zA-Z]+
Required: Yes
enableReceiving
When true, enables receiving messages to this WhatsApp Business Account.
Type: Boolean
Required: Yes
enableSending
When true, enables sending messages from this WhatsApp Business Account.
Type: Boolean
Required: Yes
eventDestinations
The event destinations for the linked WhatsApp Business Account.
Type: Array of
WhatsAppBusinessAccountEventDestination
objects
Array Members: Minimum number of 0 items. Maximum number of 1 item.
Required: Yes
id
The ID of the linked WhatsApp Business Account, formatted as
waba-01234567890123456789012345678901
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
linkDate
The date the WhatsApp Business Account was linked.
Type: Timestamp
Required: Yes
phoneNumbers
The phone numbers associated with the Linked WhatsApp Business Account.
Type: Array of
WhatsAppPhoneNumberSummary
objects
Required: Yes
registrationStatus
The registration status of the linked WhatsApp Business Account.
Type: String
Valid Values:
COMPLETE | INCOMPLETE
Required: Yes
wabaId
The WhatsApp Business Account ID from meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: Yes
wabaName
The name of the linked WhatsApp Business Account.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 200.
Required: Yes
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
LibraryTemplateButtonList
LinkedWhatsAppBusinessAccountIdMetaData

---

## LinkedWhatsAppBusinessAccountIdMetaData - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_LinkedWhatsAppBusinessAccountIdMetaData.html

LinkedWhatsAppBusinessAccountIdMetaData
Contains your WhatsApp registration status and details of any unregistered WhatsApp
         phone number.
Contents
accountName
The name of your account.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 200.
Required: No
registrationStatus
The registration status of the linked WhatsApp Business Account.
Type: String
Valid Values:
COMPLETE | INCOMPLETE
Required: No
unregisteredWhatsAppPhoneNumbers
The details for unregistered WhatsApp phone numbers.
Type: Array of
WhatsAppPhoneNumberDetail
objects
Required: No
wabaId
The Amazon Resource Name (ARN) of the WhatsApp Business Account ID.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
LinkedWhatsAppBusinessAccount
LinkedWhatsAppBusinessAccountSummary

---

## LinkedWhatsAppBusinessAccountSummary - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_LinkedWhatsAppBusinessAccountSummary.html

LinkedWhatsAppBusinessAccountSummary
The details of a linked WhatsApp Business Account.
Contents
arn
The ARN of the linked WhatsApp Business Account.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*:waba/[0-9a-zA-Z]+
Required: Yes
enableReceiving
When true, indicates that receiving messages is enabled for this WhatsApp Business Account.
Type: Boolean
Required: Yes
enableSending
When true, indicates that sending messages is enabled for this WhatsApp Business Account.
Type: Boolean
Required: Yes
eventDestinations
The event destinations for the linked WhatsApp Business Account.
Type: Array of
WhatsAppBusinessAccountEventDestination
objects
Array Members: Minimum number of 0 items. Maximum number of 1 item.
Required: Yes
id
The ID of the linked WhatsApp Business Account, formatted as
waba-01234567890123456789012345678901
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: Yes
linkDate
The date the WhatsApp Business Account was linked.
Type: Timestamp
Required: Yes
registrationStatus
The registration status of the linked WhatsApp Business Account.
Type: String
Valid Values:
COMPLETE | INCOMPLETE
Required: Yes
wabaId
The WhatsApp Business Account ID provided by Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: Yes
wabaName
The name of the linked WhatsApp Business Account.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 200.
Required: Yes
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
LinkedWhatsAppBusinessAccountIdMetaData
MetaLibraryTemplate

---

## MetaLibraryTemplate - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_MetaLibraryTemplate.html

MetaLibraryTemplate
Represents a template from Meta's library with customization options.
Contents
libraryTemplateName
The name of the template in Meta's library.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 512.
Required: Yes
templateCategory
The category of the template (for example, UTILITY or MARKETING).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: Yes
templateLanguage
The language code for the template (for example, en_US).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 6.
Required: Yes
templateName
The name to assign to the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 512.
Required: Yes
libraryTemplateBodyInputs
Body text customizations for the template.
Type:
LibraryTemplateBodyInputs
object
Required: No
libraryTemplateButtonInputs
Button customizations for the template.
Type: Array of
LibraryTemplateButtonInput
objects
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
LinkedWhatsAppBusinessAccountSummary
MetaLibraryTemplateDefinition

---

## MetaLibraryTemplateDefinition - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_MetaLibraryTemplateDefinition.html

MetaLibraryTemplateDefinition
Defines the complete structure and content of a template in Meta's library.
Contents
templateBody
The body text of the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 2000.
Required: No
templateBodyExampleParams
Example parameter values for the template body, used to demonstrate how dynamic content appears in the template.
Type: Array of strings
Required: No
templateButtons
The buttons included in the template.
Type: Array of
LibraryTemplateButtonList
objects
Required: No
templateCategory
The category of the template (for example, UTILITY or MARKETING).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
templateHeader
The header text of the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 200.
Required: No
templateId
The ID of the template in Meta's library.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
Required: No
templateIndustry
The industries the template is designed for.
Type: Array of strings
Length Constraints: Minimum length of 1. Maximum length of 25.
Required: No
templateLanguage
The language code for the template (for example, en_US).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 6.
Required: No
templateName
The name of the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 512.
Required: No
templateTopic
The topic or subject matter of the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: No
templateUseCase
The intended use case for the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 30.
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
MetaLibraryTemplate
S3File

---

## S3File - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_S3File.html

S3File
Contains information for the S3 bucket that contains media files.
Contents
bucketName
The bucket name.
Type: String
Length Constraints: Minimum length of 3. Maximum length of 63.
Pattern:
[a-z0-9][a-z0-9.-]*[a-z0-9]
Required: Yes
key
The S3 key prefix that defines the storage location of your media files. The prefix works like a folder path in S3, 
         and is combined with the WhatsApp mediaId to create the final file path.
For example, if a media file's WhatsApp mediaId is
123.ogg
, and the key is
audio/example.ogg
, 
         the final file path is
audio/example.ogg123.ogg
.
For the same mediaId, a key of
audio/
results in the file path
audio/123.ogg
.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 1024.
Required: Yes
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
MetaLibraryTemplateDefinition
S3PresignedUrl

---

## S3PresignedUrl - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_S3PresignedUrl.html

S3PresignedUrl
You can use presigned URLs to grant time-limited access to objects in Amazon S3 without updating your bucket policy. For more information, see
Working with presigned URLs
in the
Amazon S3
         User Guide
.
Contents
headers
A map of headers and their values. You must specify the
Content-Type
header when using
PostWhatsAppMessageMedia
. For a list of common headers, see
Common Request Headers
in the
Amazon S3
         API Reference
Type: String to string map
Required: Yes
url
The presign url to the object.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 2000.
Pattern:
https://(.*)s3(.*).amazonaws.com/(.*)
Required: Yes
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
S3File
Tag

---

## Tag - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_Tag.html

Tag
The tag for a resource.
Contents
key
The tag key.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 128.
Required: Yes
value
The tag value.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 256.
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
S3PresignedUrl
TemplateSummary

---

## TemplateSummary - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_TemplateSummary.html

TemplateSummary
Provides a summary of a WhatsApp message template's key attributes.
Contents
metaTemplateId
The numeric ID assigned to the template by Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Pattern:
[0-9]+
Required: No
templateCategory
The category of the template (for example, UTILITY or MARKETING).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
templateLanguage
The language code of the template (for example, en_US).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 6.
Required: No
templateName
The name of the template.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 512.
Required: No
templateQualityScore
The quality score assigned to the template by Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: No
templateStatus
The current status of the template (for example, APPROVED, PENDING, or REJECTED).
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
Tag
WabaPhoneNumberSetupFinalization

---

## WabaPhoneNumberSetupFinalization - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WabaPhoneNumberSetupFinalization.html

WabaPhoneNumberSetupFinalization
The registration details for a linked phone number.
Contents
id
The unique identifier of the originating phone number associated with the media. Phone
         number identifiers are formatted as
phone-number-id-01234567890123456789012345678901
. Use the
GetLinkedWhatsAppBusinessAccount
API action to find a phone number's id.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: Yes
twoFactorPin
The PIN to use for two-step verification. To reset your PIN follow the directions in
Updating PIN
in the
WhatsApp Business Platform Cloud API
               Reference
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 6.
Required: Yes
dataLocalizationRegion
The two letter ISO region for the location of where Meta will store data.
AsiaâPacific (APAC)
Australia
AU
Indonesia
ID
India
IN
Japan
JP
Singapore
SG
South Korea
KR
Europe
Germany
DE
Switzerland
CH
United Kingdom
GB
Latin America (LATAM)
Brazil
BR
Middle East and Africa (MEA)
Bahrain
BH
South Africa
ZA
United Arab Emirates
AE
North America (NORAM)
Canada
CA
Type: String
Pattern:
[A-Z]
{
2}
Required: No
tags
An array of key and value pair tags.
Type: Array of
Tag
objects
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
TemplateSummary
WabaSetupFinalization

---

## WabaSetupFinalization - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WabaSetupFinalization.html

WabaSetupFinalization
The registration details for a linked WhatsApp Business Account.
Contents
eventDestinations
The event destinations for the linked WhatsApp Business Account.
Type: Array of
WhatsAppBusinessAccountEventDestination
objects
Array Members: Minimum number of 0 items. Maximum number of 1 item.
Required: No
id
The ID of the linked WhatsApp Business Account, formatted as
waba-01234567890123456789012345678901
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
tags
An array of key and value pair tags.
Type: Array of
Tag
objects
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WabaPhoneNumberSetupFinalization
WhatsAppBusinessAccountEventDestination

---

## WhatsAppBusinessAccountEventDestination - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WhatsAppBusinessAccountEventDestination.html

WhatsAppBusinessAccountEventDestination
Contains information on the event destination.
Contents
eventDestinationArn
The ARN of the event destination.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*:[a-z-]+([/:](.*))?
Required: Yes
roleArn
The Amazon Resource Name (ARN) of an AWS Identity and Access Management role
         that is able to import phone numbers and write events.
Type: String
Pattern:
arn:.*:iam::\d
{
12}:role\/[a-zA-Z0-9+=,.@\-_]+
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WabaSetupFinalization
WhatsAppPhoneNumberDetail

---

## WhatsAppPhoneNumberDetail - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WhatsAppPhoneNumberDetail.html

WhatsAppPhoneNumberDetail
The details of your WhatsApp phone number.
Contents
arn
The ARN of the WhatsApp phone number.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*:phone-number-id/[0-9a-zA-Z]+
Required: Yes
displayPhoneNumber
The phone number that appears in the recipients display.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 20.
Required: Yes
displayPhoneNumberName
The display name for this phone number.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 200.
Required: Yes
metaPhoneNumberId
The phone number ID from Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: Yes
phoneNumber
The phone number for sending WhatsApp.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: Yes
phoneNumberId
The phone number ID. Phone number identifiers are formatted as
phone-number-id-01234567890123456789012345678901
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
qualityRating
The quality rating of the phone number.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 10.
Required: Yes
dataLocalizationRegion
The geographic region where the WhatsApp phone number's data is stored and processed.
Type: String
Pattern:
[A-Z]
{
2}
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsAppBusinessAccountEventDestination
WhatsAppPhoneNumberSummary

---

## WhatsAppPhoneNumberSummary - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WhatsAppPhoneNumberSummary.html

WhatsAppPhoneNumberSummary
The details of a linked phone number.
Contents
arn
The full Amazon Resource Name (ARN) for the phone number.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 2048.
Pattern:
arn:.*:phone-number-id/[0-9a-zA-Z]+
Required: Yes
displayPhoneNumber
The phone number that appears in the recipients display.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 20.
Required: Yes
displayPhoneNumberName
The display name for this phone number.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 200.
Required: Yes
metaPhoneNumberId
The phone number ID from Meta.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 100.
Required: Yes
phoneNumber
The phone number associated with the Linked WhatsApp Business Account.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 20.
Required: Yes
phoneNumberId
The phone number ID. Phone number identifiers are formatted as
phone-number-id-01234567890123456789012345678901
.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^phone-number-id-.*$)|(^arn:.*:phone-number-id/[0-9a-zA-Z]+$).*
Required: Yes
qualityRating
The quality rating of the phone number. This is from Meta.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 10.
Required: Yes
dataLocalizationRegion
The geographic region where the WhatsApp phone number's data is stored and processed.
Type: String
Pattern:
[A-Z]
{
2}
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsAppPhoneNumberDetail
WhatsAppSetupFinalization

---

## WhatsAppSetupFinalization - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WhatsAppSetupFinalization.html

WhatsAppSetupFinalization
The details of linking a WhatsApp Business Account to your AWS account.
Contents
associateInProgressToken
An AWS access token generated by
WhatsAppSignupCallback
and used by
WhatsAppSetupFinalization
.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 50.
Required: Yes
phoneNumbers
An array of WabaPhoneNumberSetupFinalization objects containing the details of each phone number associated with the WhatsApp Business Account.
Type: Array of
WabaPhoneNumberSetupFinalization
objects
Required: Yes
phoneNumberParent
Used to add a new phone number to an existing WhatsApp Business Account. This field can't be used when the
waba
field is present.
Type: String
Length Constraints: Minimum length of 1. Maximum length of 115.
Pattern:
.*(^waba-.*$)|(^arn:.*:waba/[0-9a-zA-Z]+$).*
Required: No
waba
Used to create a new WhatsApp Business Account and add a phone number. This field can't be used when the
phoneNumberParent
field is present.
Type:
WabaSetupFinalization
object
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsAppPhoneNumberSummary
WhatsAppSignupCallback

---

## WhatsAppSignupCallback - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WhatsAppSignupCallback.html

WhatsAppSignupCallback
Contains the
accessToken
provided by Meta during signup.
Contents
accessToken
The access token for your WhatsApp Business Account. The
accessToken
value is provided by Meta.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 1000.
Required: Yes
callbackUrl
The URL where WhatsApp will send callback notifications for this account.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 100.
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsAppSetupFinalization
WhatsAppSignupCallbackResult

---

## WhatsAppSignupCallbackResult - AWS End User Messaging Social

**URL:** https://docs.aws.amazon.com/social-messaging/latest/APIReference/API_WhatsAppSignupCallbackResult.html

WhatsAppSignupCallbackResult
Contains the results of WhatsAppSignupCallback.
Contents
associateInProgressToken
An AWS access token generated by
WhatsAppSignupCallback
and used by
WhatsAppSetupFinalization
.
Type: String
Length Constraints: Minimum length of 0. Maximum length of 50.
Required: No
linkedAccountsWithIncompleteSetup
A LinkedWhatsAppBusinessAccountIdMetaData object map containing the details of any WhatsAppBusiness accounts that have incomplete setup.
Type: String to
LinkedWhatsAppBusinessAccountIdMetaData
object map
Key Length Constraints: Minimum length of 1. Maximum length of 100.
Required: No
See Also
For more information about using this API in one of the language-specific AWS SDKs, see the following:
AWS SDK for C++
AWS SDK for Java V2
AWS SDK for Ruby V3
Javascript is disabled or is unavailable in your browser.
To use the Amazon Web Services Documentation, Javascript must be enabled. Please refer to your browser's Help pages for instructions.
Document Conventions
WhatsAppSignupCallback
Common Parameters

---

