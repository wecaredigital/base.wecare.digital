"""
Cleanup DynamoDB Tables
Delete all messages and contacts
"""
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

tables = [
    'base-wecare-digital-WhatsAppInboundTable',
    'base-wecare-digital-WhatsAppOutboundTable', 
    'base-wecare-digital-ContactsTable'
]

for table_name in tables:
    print(f"\nDeleting from {table_name}...")
    table = dynamodb.Table(table_name)
    
    # Scan and delete all items
    scan = table.scan(ProjectionExpression='id')
    items = scan.get('Items', [])
    
    count = 0
    for item in items:
        table.delete_item(Key={'id': item['id']})
        count += 1
        if count % 20 == 0:
            print(f"  Deleted {count}...")
    
    # Handle pagination
    while 'LastEvaluatedKey' in scan:
        scan = table.scan(
            ProjectionExpression='id',
            ExclusiveStartKey=scan['LastEvaluatedKey']
        )
        for item in scan.get('Items', []):
            table.delete_item(Key={'id': item['id']})
            count += 1
            if count % 20 == 0:
                print(f"  Deleted {count}...")
    
    print(f"Deleted {count} items from {table_name}")

print("\n=== Cleanup Complete ===")
