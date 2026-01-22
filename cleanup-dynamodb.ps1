# Cleanup DynamoDB Tables
# Delete all messages from WhatsApp tables

$region = "us-east-1"

Write-Host "=== Cleaning up DynamoDB tables ===" -ForegroundColor Cyan

# Delete Inbound Messages
Write-Host "`nDeleting inbound messages..." -ForegroundColor Yellow
$inboundResult = aws dynamodb scan --table-name base-wecare-digital-WhatsAppInboundTable --projection-expression "id" --region $region --output json | ConvertFrom-Json
$inboundCount = 0

foreach ($item in $inboundResult.Items) {
    $id = $item.id.S
    $keyJson = '{"id":{"S":"' + $id + '"}}'
    aws dynamodb delete-item --table-name base-wecare-digital-WhatsAppInboundTable --key $keyJson --region $region 2>&1 | Out-Null
    $inboundCount++
    if ($inboundCount % 20 -eq 0) { Write-Host "  Deleted $inboundCount..." }
}
Write-Host "Deleted $inboundCount inbound messages" -ForegroundColor Green

# Delete Outbound Messages
Write-Host "`nDeleting outbound messages..." -ForegroundColor Yellow
$outboundResult = aws dynamodb scan --table-name base-wecare-digital-WhatsAppOutboundTable --projection-expression "id" --region $region --output json | ConvertFrom-Json
$outboundCount = 0

foreach ($item in $outboundResult.Items) {
    $id = $item.id.S
    $keyJson = '{"id":{"S":"' + $id + '"}}'
    aws dynamodb delete-item --table-name base-wecare-digital-WhatsAppOutboundTable --key $keyJson --region $region 2>&1 | Out-Null
    $outboundCount++
    if ($outboundCount % 20 -eq 0) { Write-Host "  Deleted $outboundCount..." }
}
Write-Host "Deleted $outboundCount outbound messages" -ForegroundColor Green

# Delete Contacts (soft-deleted ones)
Write-Host "`nDeleting contacts..." -ForegroundColor Yellow
$contactsResult = aws dynamodb scan --table-name base-wecare-digital-ContactsTable --projection-expression "id" --region $region --output json | ConvertFrom-Json
$contactsCount = 0

foreach ($item in $contactsResult.Items) {
    $id = $item.id.S
    $keyJson = '{"id":{"S":"' + $id + '"}}'
    aws dynamodb delete-item --table-name base-wecare-digital-ContactsTable --key $keyJson --region $region 2>&1 | Out-Null
    $contactsCount++
    if ($contactsCount % 20 -eq 0) { Write-Host "  Deleted $contactsCount..." }
}
Write-Host "Deleted $contactsCount contacts" -ForegroundColor Green

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host "Inbound: $inboundCount"
Write-Host "Outbound: $outboundCount"
Write-Host "Contacts: $contactsCount"
