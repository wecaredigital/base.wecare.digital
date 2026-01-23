"""
Delete all messages from WhatsApp Inbound and Outbound tables
Also deletes associated S3 media files
"""
import boto3
from botocore.exceptions import ClientError

# Initialize clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3_client = boto3.client('s3', region_name='us-east-1')

INBOUND_TABLE = 'base-wecare-digital-WhatsAppInboundTable'
OUTBOUND_TABLE = 'base-wecare-digital-WhatsAppOutboundTable'
MEDIA_BUCKET = 'auth.wecare.digital'

def delete_s3_file(s3_key):
    """Delete file from S3"""
    if not s3_key:
        return False
    try:
        # Try exact key
        try:
            s3_client.head_object(Bucket=MEDIA_BUCKET, Key=s3_key)
            s3_client.delete_object(Bucket=MEDIA_BUCKET, Key=s3_key)
            print(f"  Deleted S3: {s3_key}")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] != '404':
                raise
        
        # Search with prefix
        base_prefix = s3_key.rsplit('.', 1)[0] if '.' in s3_key else s3_key
        response = s3_client.list_objects_v2(Bucket=MEDIA_BUCKET, Prefix=base_prefix, MaxKeys=5)
        
        for obj in response.get('Contents', []):
            s3_client.delete_object(Bucket=MEDIA_BUCKET, Key=obj['Key'])
            print(f"  Deleted S3: {obj['Key']}")
            return True
        return False
    except Exception as e:
        print(f"  S3 delete error: {e}")
        return False

def delete_all_from_table(table_name):
    """Delete all items from a DynamoDB table"""
    table = dynamodb.Table(table_name)
    
    # Scan all items
    print(f"\nScanning {table_name}...")
    response = table.scan()
    items = response.get('Items', [])
    
    # Handle pagination
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response.get('Items', []))
    
    print(f"Found {len(items)} items to delete")
    
    deleted = 0
    media_deleted = 0
    
    for item in items:
        item_id = item.get('id')
        s3_key = item.get('s3Key')
        
        # Delete S3 media if exists
        if s3_key:
            if delete_s3_file(s3_key):
                media_deleted += 1
        
        # Delete from DynamoDB
        try:
            table.delete_item(Key={'id': item_id})
            deleted += 1
            if deleted % 10 == 0:
                print(f"  Deleted {deleted}/{len(items)} items...")
        except Exception as e:
            print(f"  Error deleting {item_id}: {e}")
    
    print(f"Completed: {deleted} items deleted, {media_deleted} media files deleted")
    return deleted, media_deleted

if __name__ == '__main__':
    print("=" * 50)
    print("DELETING ALL MESSAGES FROM DYNAMODB AND S3")
    print("=" * 50)
    
    # Delete from Inbound table
    inbound_deleted, inbound_media = delete_all_from_table(INBOUND_TABLE)
    
    # Delete from Outbound table
    outbound_deleted, outbound_media = delete_all_from_table(OUTBOUND_TABLE)
    
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Inbound: {inbound_deleted} messages, {inbound_media} media files")
    print(f"Outbound: {outbound_deleted} messages, {outbound_media} media files")
    print(f"Total: {inbound_deleted + outbound_deleted} messages, {inbound_media + outbound_media} media files")
