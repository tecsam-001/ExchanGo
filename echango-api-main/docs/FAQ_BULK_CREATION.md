# FAQ Bulk Creation Feature

## Overview
This feature allows office owners to create multiple FAQs in a single API request, improving efficiency when setting up office information.

## API Endpoint

### Create Multiple FAQs
- **Endpoint**: `POST /api/v1/faqs/me/bulk`
- **Authentication**: Required (Bearer Token)
- **Description**: Create multiple FAQs for the authenticated user's office

### Request Body
```json
{
  "faqs": [
    {
      "question": "What are your exchange rates?",
      "answer": "Our exchange rates are updated daily and are competitive with market rates."
    },
    {
      "question": "What are your working hours?",
      "answer": "We are open Monday to Friday from 9 AM to 6 PM."
    },
    {
      "question": "Do you offer currency conversion services?",
      "answer": "Yes, we offer comprehensive currency conversion services for all major currencies."
    }
  ]
}
```

### Response
```json
[
  {
    "id": "uuid-1",
    "question": "What are your exchange rates?",
    "answer": "Our exchange rates are updated daily and are competitive with market rates.",
    "isActive": true,
    "office": {
      "id": "office-uuid",
      "officeName": "Example Exchange Office"
    },
    "createdAt": "2025-07-25T10:00:00.000Z",
    "updatedAt": "2025-07-25T10:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "question": "What are your working hours?",
    "answer": "We are open Monday to Friday from 9 AM to 6 PM.",
    "isActive": true,
    "office": {
      "id": "office-uuid",
      "officeName": "Example Exchange Office"
    },
    "createdAt": "2025-07-25T10:00:00.000Z",
    "updatedAt": "2025-07-25T10:00:00.000Z"
  }
]
```

### Status Codes
- `201 Created`: FAQs successfully created
- `400 Bad Request`: Invalid input data or validation errors
- `401 Unauthorized`: User not authenticated or office not found

## Validation Rules
- Each FAQ must have a non-empty `question` (string)
- Each FAQ must have a non-empty `answer` (string)
- The `faqs` array must contain at least one FAQ item
- Maximum recommended: 50 FAQs per request (to avoid timeout issues)

## Implementation Details

### Files Modified/Created
1. **DTO**: `src/faqs/dto/create-my-faq.dto.ts`
   - Added `CreateMyFaqsDto` class for bulk creation
   - Includes validation for array of FAQs

2. **Repository**: `src/faqs/infrastructure/persistence/relational/repositories/faq.repository.ts`
   - Added `createMany()` method for bulk database insertion
   - Updated abstract repository interface
   - Fixed `findById()` to include office relation

3. **Service**: `src/faqs/faqs.service.ts`
   - Added `createMyFaqs()` method for bulk creation logic
   - Handles office validation and data preparation
   - Fixed error handling in `updateMyFaq` and `removeMyFaq`

4. **Controller**: `src/faqs/faqs.controller.ts`
   - Added `POST /me/bulk` endpoint (positioned before `/me/:id` routes)
   - Includes comprehensive API documentation
   - Added UUID validation with `ParseUUIDPipe` for all ID parameters

5. **Tests**: `test/user/faqs.e2e-spec.ts`
   - Basic test structure for bulk creation endpoint

### Database Optimization
The bulk creation uses TypeORM's `save()` method with an array of entities, which performs a single database transaction for all FAQs, improving performance compared to individual inserts.

### Error Handling
- Validates user authentication and office ownership
- Validates each FAQ in the array
- Returns appropriate HTTP status codes
- Provides descriptive error messages

## Usage Examples

### cURL Example
```bash
curl -X POST "http://localhost:4002/api/v1/faqs/me/bulk" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "faqs": [
      {
        "question": "What currencies do you exchange?",
        "answer": "We exchange all major currencies including USD, EUR, GBP, and more."
      },
      {
        "question": "Do you charge fees?",
        "answer": "We offer competitive rates with transparent fee structures."
      }
    ]
  }'
```

### JavaScript/TypeScript Example
```typescript
const response = await fetch('/api/v1/faqs/me/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    faqs: [
      {
        question: 'What currencies do you exchange?',
        answer: 'We exchange all major currencies including USD, EUR, GBP, and more.',
      },
      {
        question: 'Do you charge fees?',
        answer: 'We offer competitive rates with transparent fee structures.',
      },
    ],
  }),
});

const createdFaqs = await response.json();
```

## Bug Fixes Included
1. **UUID Route Conflict**: Fixed route ordering to prevent "bulk" being interpreted as UUID
2. **Missing Relations**: Fixed `findById()` method to load office relations
3. **Error Handling**: Improved error messages for FAQ ownership validation
4. **UUID Validation**: Added `ParseUUIDPipe` to prevent invalid UUID errors

## Benefits
1. **Efficiency**: Create multiple FAQs in a single request
2. **Performance**: Single database transaction for all FAQs
3. **User Experience**: Faster office setup process
4. **Consistency**: All FAQs created with same timestamp and office association
5. **Validation**: Comprehensive input validation for all FAQs
