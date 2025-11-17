# FeeRule API CRUD Operations - cURL Examples (Updated with Currency & Simplified Hierarchy)

## Overview
The FeeRule API has been updated with the following improvements:
- **Currency Support**: Each fee rule now includes a currency field (USD, NPR, INR, EUR, etc.)
- **Simplified Hierarchy**: Only `section_id` is needed. The complete hierarchy (section → class → course → department → faculty) is automatically included in responses
- **Better Organization**: Cleaner data structure with relationship traversal

## Authentication
First, you need to authenticate to get an access token:

```bash
# Login to get access token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@example.com",
    "password": "your_password"
  }'
```

Response will contain an `accessToken` that you'll use in the `Authorization: Bearer <token>` header for all subsequent requests.

---

## 1. CREATE Fee Rule

### Basic Tuition Fee (ONCE type) with Currency
```bash
curl -X POST http://localhost:3001/api/v1/fee-rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Semester Tuition Fee",
    "category": "tuition",
    "defaultAmount": 15000.00,
    "currency": "NPR",
    "recurrenceType": "ONCE",
    "intervalMonths": null,
    "section_id": 5
  }'
```

### Monthly Lab Fee (RECURRING type) in USD
```bash
curl -X POST http://localhost:3001/api/v1/fee-rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Computer Lab Fee",
    "category": "lab",
    "defaultAmount": 50.00,
    "currency": "USD",
    "recurrenceType": "RECURRING",
    "intervalMonths": 1,
    "section_id": 3
  }'
```

### Global Sports Fee (No section - applies to all)
```bash
curl -X POST http://localhost:3001/api/v1/fee-rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Annual Sports Fee",
    "category": "sports",
    "defaultAmount": 2000.00,
    "currency": "NPR",
    "recurrenceType": "ONCE",
    "intervalMonths": null,
    "section_id": null
  }'
```

---

## 2. READ Operations

### Get All Fee Rules (with full hierarchy)
```bash
curl -X GET http://localhost:3001/api/v1/fee-rules \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response includes full hierarchy:**
```json
{
  "success": true,
  "data": [{
    "id": 1,
    "name": "Computer Lab Fee",
    "category": "lab",
    "defaultAmount": "50.00",
    "currency": "USD",
    "recurrenceType": "recurring",
    "intervalMonths": 1,
    "section_id": 3,
    "section": {
      "id": 3,
      "sectionName": "A",
      "class": {
        "id": 2,
        "className": "Grade 12",
        "department": {
          "id": 1,
          "departmentName": "Science",
          "faculty": {
            "id": 1,
            "facultyName": "Science & Technology"
          }
        },
        "course": {
          "id": 1,
          "title": "Computer Science"
        }
      }
    }
  }]
}
```

### Get Fee Rule by ID (with hierarchy)
```bash
curl -X GET http://localhost:3001/api/v1/fee-rules/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Fee Rules by Category
```bash
# Get all tuition fees
curl -X GET http://localhost:3001/api/v1/fee-rules/category/tuition \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Available categories: tuition, lab, sports, exam, bus, eca, other
```

### Get Fee Rules by Section (with full hierarchy)
```bash
curl -X GET http://localhost:3001/api/v1/fee-rules/section/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Fee Rules by Currency
```bash
# Get all NPR fees
curl -X GET http://localhost:3001/api/v1/fee-rules/currency/NPR \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get all USD fees  
curl -X GET http://localhost:3001/api/v1/fee-rules/currency/USD \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Supported currencies: USD, NPR, INR, EUR, GBP, AUD, CAD, JPY, CNY
```

---

## 3. UPDATE Fee Rule

### Update Fee Amount and Currency
```bash
curl -X PUT http://localhost:3001/api/v1/fee-rules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "defaultAmount": 55.00,
    "currency": "USD"
  }'
```

### Change Recurrence Type and Interval
```bash
curl -X PUT http://localhost:3001/api/v1/fee-rules/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "recurrenceType": "RECURRING",
    "intervalMonths": 6
  }'
```

### Update Section Assignment
```bash
curl -X PUT http://localhost:3001/api/v1/fee-rules/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "section_id": 7
  }'
```

### Deactivate Fee Rule
```bash
curl -X PUT http://localhost:3001/api/v1/fee-rules/4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "isActive": false
  }'
```

---

## 4. DELETE Fee Rule

```bash
curl -X DELETE http://localhost:3001/api/v1/fee-rules/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Complete Example Workflow

### 1. Create Section-Specific Lab Fee
```bash
curl -X POST http://localhost:3001/api/v1/fee-rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Advanced Physics Lab",
    "category": "lab",
    "defaultAmount": 1200.00,
    "currency": "NPR",
    "recurrenceType": "RECURRING",
    "intervalMonths": 1,
    "section_id": 5
  }'
```

### 2. Create Global Exam Fee (No section)
```bash
curl -X POST http://localhost:3001/api/v1/fee-rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Annual Examination Fee",
    "category": "exam",
    "defaultAmount": 1500.00,
    "currency": "NPR", 
    "recurrenceType": "ONCE",
    "intervalMonths": null,
    "section_id": null
  }'
```

### 3. Create Bus Fee with USD Currency
```bash
curl -X POST http://localhost:3001/api/v1/fee-rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Monthly Bus Pass",
    "category": "bus", 
    "defaultAmount": 25.00,
    "currency": "USD",
    "recurrenceType": "RECURRING",
    "intervalMonths": 1,
    "section_id": null
  }'
```

---

## Key Improvements

### 1. **Currency Support**
- Each fee rule has a currency field
- Default currency is NPR if not specified
- Supported currencies: USD, NPR, INR, EUR, GBP, AUD, CAD, JPY, CNY
- Filter fee rules by currency

### 2. **Simplified Hierarchy**
- Only `section_id` is stored in the fee rule
- Full hierarchy (section → class → course → department → faculty) is automatically included in API responses
- No need for redundant department_id, course_id, class_id fields
- Cleaner data structure and better performance

### 3. **Relationship Traversal**
When you query fee rules, you automatically get:
```json
{
  "section": {
    "sectionName": "A",
    "class": {
      "className": "Grade 12", 
      "department": {
        "departmentName": "Science",
        "faculty": {
          "facultyName": "Science & Technology"
        }
      },
      "course": {
        "title": "Computer Science"
      }
    }
  }
}
```

### 4. **New Endpoints**
- `GET /api/v1/fee-rules/section/:section_id` - Get fees for specific section
- `GET /api/v1/fee-rules/currency/:currency` - Filter by currency
- Removed complex scope endpoint - simplified to section-based filtering

---

## Validation Rules

### Currency Validation
- Must be one of: USD, NPR, INR, EUR, GBP, AUD, CAD, JPY, CNY
- Defaults to NPR if not specified

### Recurrence Type Validation  
- **ONCE**: `intervalMonths` must be `null`
- **RECURRING**: `intervalMonths` must be a positive integer

### Category Options
- `tuition`, `lab`, `sports`, `exam`, `bus`, `eca`, `other`

### Section Hierarchy
- `section_id` can be null (global fee) or reference a valid section
- When set, full hierarchy is automatically accessible via relationships

---

## Benefits of New Structure

1. **Reduced Redundancy**: No duplicate hierarchy fields
2. **Better Performance**: Single foreign key instead of multiple
3. **Automatic Hierarchy**: Full organizational structure in responses  
4. **Currency Support**: Multi-currency fee management
5. **Cleaner API**: Simplified request/response structure
6. **Easier Maintenance**: Single relationship to manage