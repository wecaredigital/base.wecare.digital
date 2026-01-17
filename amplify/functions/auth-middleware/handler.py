"""
Auth Middleware Lambda Function

Purpose: JWT validation and RBAC enforcement
Requirements: 1.1, 1.2, 1.6, 14.1

Validates JWT tokens against Cognito JWKS endpoint and enforces
role-based access control (Viewer, Operator, Admin).
"""

import os
import json
import logging
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# Environment variables
COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID', 'us-east-1_CC9u1fYh6')
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')

# RBAC Permissions
ROLE_PERMISSIONS = {
    'Viewer': ['read'],
    'Operator': ['read', 'write', 'send'],
    'Admin': ['read', 'write', 'send', 'admin', 'manage_users'],
}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for authentication middleware.
    
    Args:
        event: Lambda event containing authorization token
        context: Lambda context
        
    Returns:
        Authorization decision with user context
    """
    logger.info(f"Auth middleware invoked")
    
    try:
        # Extract authorization header
        auth_header = event.get('headers', {}).get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Missing or invalid Authorization header")
            return _unauthorized_response("Missing or invalid Authorization header")
        
        token = auth_header.replace('Bearer ', '')
        
        # Validate JWT token
        user_claims = _validate_jwt(token)
        
        if not user_claims:
            logger.warning("Invalid JWT token")
            return _unauthorized_response("Invalid token")
        
        # Extract user role
        role = user_claims.get('custom:role', 'Viewer')
        user_id = user_claims.get('sub', '')
        email = user_claims.get('email', '')
        
        # Log authentication attempt
        logger.info(f"Authentication successful: userId={user_id}, role={role}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'authorized': True,
                'userId': user_id,
                'email': email,
                'role': role,
                'permissions': ROLE_PERMISSIONS.get(role, []),
            }),
        }
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return _unauthorized_response(str(e))


def _validate_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Validate JWT token against Cognito JWKS endpoint.
    
    Args:
        token: JWT token string
        
    Returns:
        User claims if valid, None otherwise
    """
    # TODO: Implement JWT validation using python-jose or similar
    # For now, return placeholder
    # In production, validate against:
    # https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
    
    return None


def _unauthorized_response(message: str) -> Dict[str, Any]:
    """Return 403 unauthorized response."""
    return {
        'statusCode': 403,
        'body': json.dumps({
            'authorized': False,
            'error': message,
        }),
    }


def check_permission(role: str, required_permission: str) -> bool:
    """
    Check if a role has the required permission.
    
    Args:
        role: User role (Viewer, Operator, Admin)
        required_permission: Permission to check
        
    Returns:
        True if permitted, False otherwise
    """
    permissions = ROLE_PERMISSIONS.get(role, [])
    return required_permission in permissions
