# WhatsApp Supported Media Types

Reference: [AWS Social Messaging - Supported Media Types](https://docs.aws.amazon.com/social-messaging/latest/userguide/supported-media-types.html)

## Audio Formats (Max 16MB)

| Type | Extension | MIME Type |
|------|-----------|-----------|
| AAC | .aac | audio/aac |
| AMR | .amr | audio/amr |
| MP3 | .mp3 | audio/mpeg |
| MP4 Audio | .m4a | audio/mp4 |
| OGG Audio | .ogg | audio/ogg (OPUS codecs only) |

## Document Formats (Max 100MB)

| Type | Extension | MIME Type |
|------|-----------|-----------|
| Text | .txt | text/plain |
| Microsoft Excel | .xls, .xlsx | application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Microsoft Word | .doc, .docx | application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Microsoft PowerPoint | .ppt, .pptx | application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation |
| PDF | .pdf | application/pdf |

## Image Formats (Max 5MB)

Images must be 8-bit, RGB or RGBA.

| Type | Extension | MIME Type |
|------|-----------|-----------|
| JPEG | .jpeg, .jpg | image/jpeg |
| PNG | .png | image/png |

## Sticker Formats

WebP images can only be sent in sticker messages.

| Type | Extension | MIME Type | Max Size |
|------|-----------|-----------|----------|
| Animated sticker | .webp | image/webp | 500 KB |
| Static sticker | .webp | image/webp | 100 KB |

## Video Formats (Max 16MB)

Only H.264 video codec and AAC audio codec supported.

| Type | Extension | MIME Type |
|------|-----------|-----------|
| 3GPP | .3gp | video/3gpp |
| MP4 Video | .mp4 | video/mp4 |

## Notes

- Maximum file size for media messages on Cloud API is 100MB
- If customer sends file > 100MB, webhook error code 131052 is triggered
- Mismatched MIME type (131053) is a common error - verify file extensions match actual MIME types
- For videos, use H.264 "Main" profile without B-frames for best compatibility
