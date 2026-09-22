# API Integration Documentation
## Backend Review System + Employee Management

> Base URL: `http://localhost:3000/api`
> All responses are JSON. Phone numbers are auto-normalized to `+91XXXXXXXXXX`.

---

## Review API (`/api/reviews`)

### POST `/api/reviews` — Submit Review

**Used by:** Customer-facing frontend (review form)

**Request Body:**

```json
{
  "rating": 5,
  "reviewText": "Great salon experience!",
  "phone": "6202400672",
  "empName": "Rahul",
  "dob": "1995-06-15",
  "anniversaryDate": "2020-12-25",
  "categories": {
    "overallExperience": 5,
    "hygieneCleanliness": 4,
    "ambience": 5,
    "staffBehavior": 5,
    "professionalism": 4,
    "waitingTime": 3,
    "pricingValue": 4
  },
  "employeeCategories": {
    "professionalism": 5,
    "behavior": 5,
    "skillExpertise": 4,
    "communication": 5
  },
  "specialData": {
    "source": "walk-in",
    "referral": "Friend",
    "membership": "gold"
  }
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | Number (1-5) | **Yes** | Overall star rating |
| `phone` | String | **Yes** | Indian phone — accepts `6202400672`, `916202400672`, `+916202400672`. Auto-normalized to `+91XXXXXXXXXX` |
| `reviewText` | String | No | Free text review (max 1000 chars) |
| `empName` | String | No | Employee name — auto-linked to Emp record if found |
| `dob` | Date (ISO) | No | Customer date of birth |
| `anniversaryDate` | Date (ISO) | No | Customer anniversary date |
| `categories` | Object | No | Salon category ratings (see below) |
| `employeeCategories` | Object | No | Employee-specific ratings (see below) |
| `specialData` | Object | No | Any extra key-value data |

**Categories object keys (all optional, 1-5 each):**

```json
{
  "overallExperience": 5,
  "hygieneCleanliness": 4,
  "ambience": 5,
  "staffBehavior": 5,
  "professionalism": 4,
  "waitingTime": 3,
  "pricingValue": 4
}
```

**Employee categories object keys (all optional, 1-5 each):**

```json
{
  "professionalism": 5,
  "behavior": 5,
  "skillExpertise": 4,
  "communication": 5
}
```

**Success Response (201):**

```json
{
  "ok": true,
  "message": "Review submitted successfully! Thank you for rating us.",
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9d0",
    "rating": 5,
    "reviewText": "Great salon experience!",
    "phone": "+916202400672",
    "empName": "Rahul",
    "categories": {
      "overallExperience": 5,
      "hygieneCleanliness": 4,
      "ambience": 5,
      "staffBehavior": 5,
      "professionalism": 4,
      "waitingTime": 3,
      "pricingValue": 4
    },
    "employeeCategories": {
      "professionalism": 5,
      "behavior": 5,
      "skillExpertise": 4,
      "communication": 5
    },
    "dob": "1995-06-15T00:00:00.000Z",
    "anniversaryDate": "2020-12-25T00:00:00.000Z",
    "specialData": {
      "source": "walk-in",
      "referral": "Friend",
      "membership": "gold"
    },
    "createdAt": "2026-09-22T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 - Missing required fields
{ "ok": false, "message": "Rating and phone are required" }

// 400 - Invalid phone
{ "ok": false, "message": "Please provide a valid Indian phone number" }

// 400 - Invalid rating
{ "ok": false, "message": "Rating must be between 1 and 5" }

// 400 - Invalid category rating
{ "ok": false, "message": "Category \"ambience\" must be between 1 and 5" }
```

---

### GET `/api/reviews/customer/:phone` — Get Customer Reviews

**Used by:** Customer profile / history page, Admin customer lookup

**URL Params:**

| Param | Type | Required |
|-------|------|----------|
| `phone` | String | Yes — accepts any format |

**Example:** `GET /api/reviews/customer/6202400672`

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "phone": "+916202400672",
    "totalReviews": 3,
    "avgRating": 4.3,
    "reviews": [
      {
        "_id": "6650a1b2c3d4e5f6a7b8c9d0",
        "rating": 5,
        "reviewText": "Great salon experience!",
        "phone": "+916202400672",
        "empName": "Rahul",
        "empId": {
          "_id": "664f9a1b2c3d4e5f6a7b8c9d",
          "name": "Rahul",
          "phone": "+919876543210",
          "role": "Senior Stylist",
          "specialization": "Hair Coloring"
        },
        "categories": { ... },
        "employeeCategories": { ... },
        "dob": "1995-06-15T00:00:00.000Z",
        "anniversaryDate": "2020-12-25T00:00:00.000Z",
        "specialData": { ... },
        "createdAt": "2026-09-22T10:30:00.000Z"
      }
    ]
  }
}
```

**Error (404):**

```json
{ "ok": false, "message": "No reviews found for this phone number" }
```

---

### GET `/api/reviews/employee/:empId` — Get Employee Reviews

**Used by:** Admin employee dashboard, Employee self-view

**URL Params:**

| Param | Type | Required |
|-------|------|----------|
| `empId` | MongoDB ObjectId | Yes |

**Example:** `GET /api/reviews/employee/664f9a1b2c3d4e5f6a7b8c9d`

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "employee": {
      "_id": "664f9a1b2c3d4e5f6a7b8c9d",
      "name": "Rahul",
      "phone": "+919876543210",
      "role": "Senior Stylist"
    },
    "totalReviews": 12,
    "avgRating": 4.5,
    "employeeCategoryAverages": {
      "professionalism": 4.8,
      "behavior": 4.6,
      "skillExpertise": 4.3,
      "communication": 4.4
    },
    "reviews": [ ... ]
  }
}
```

---

### GET `/api/reviews` — Get All Reviews (Admin)

**Used by:** Admin review management page

**Query Params (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 20) |
| `rating` | Number | Filter by star rating (1-5) |
| `startDate` | Date | Filter reviews from this date |
| `endDate` | Date | Filter reviews up to this date |

**Example:** `GET /api/reviews?page=1&limit=10&rating=5`

**Success Response (200):**

```json
{
  "ok": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### GET `/api/reviews/stats` — Review Statistics

**Used by:** Admin dashboard, Customer-facing review summary

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "avgRating": 4.3,
    "totalReviews": 120,
    "distribution": [
      { "stars": 1, "count": 2 },
      { "stars": 2, "count": 5 },
      { "stars": 3, "count": 15 },
      { "stars": 4, "count": 48 },
      { "stars": 5, "count": 50 }
    ]
  }
}
```

---

### DELETE `/api/reviews/:id` — Delete Review (Admin)

**Used by:** Admin review management

**Example:** `DELETE /api/reviews/6650a1b2c3d4e5f6a7b8c9d0`

**Success Response (200):**

```json
{ "ok": true, "message": "Review deleted successfully" }
```

---

### POST `/api/reviews/whatsapp/send` — Send WhatsApp Message

**Request Body:**

```json
{
  "phone": "6202400672",
  "customerName": "John",
  "discountPercent": "15"
}
```

**Success Response (200):**

```json
{ "ok": true, "message": "WhatsApp template sent successfully", "data": { ... } }
```

---

## Employee API (`/api/emp`)

### POST `/api/emp` — Create Employee

**Used by:** Admin employee management

**Request Body:**

```json
{
  "name": "Rahul",
  "phone": "9876543210",
  "role": "Senior Stylist",
  "specialization": "Hair Coloring",
  "empId": "EMP001",
  "joinDate": "2023-01-15"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | **Yes** | Employee full name |
| `phone` | String | **Yes** | Indian phone (auto-normalized to +91) |
| `role` | String | No | Job title / designation |
| `specialization` | String | No | Area of expertise |
| `empId` | String | No | External/HR employee ID (must be unique) |
| `joinDate` | Date (ISO) | No | Date of joining |

**Success Response (201):**

```json
{
  "ok": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "664f9a1b2c3d4e5f6a7b8c9d",
    "name": "Rahul",
    "phone": "+919876543210",
    "role": "Senior Stylist",
    "specialization": "Hair Coloring",
    "empId": "EMP001",
    "joinDate": "2023-01-15T00:00:00.000Z",
    "createdAt": "2026-09-22T10:00:00.000Z"
  }
}
```

**Error (409):**

```json
{ "ok": false, "message": "Employee with this empId already exists" }
```

---

### GET `/api/emp` — Get All Employees

**Used by:** Admin employee list, Review form employee dropdown

**Success Response (200):**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "664f9a1b2c3d4e5f6a7b8c9d",
      "name": "Rahul",
      "phone": "+919876543210",
      "role": "Senior Stylist",
      "specialization": "Hair Coloring",
      "empId": "EMP001",
      "joinDate": "2023-01-15T00:00:00.000Z",
      "createdAt": "2026-09-22T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/emp/:id` — Get Employee by ID

**Example:** `GET /api/emp/664f9a1b2c3d4e5f6a7b8c9d`

**Success Response (200):**

```json
{
  "ok": true,
  "data": {
    "_id": "664f9a1b2c3d4e5f6a7b8c9d",
    "name": "Rahul",
    "phone": "+919876543210",
    "role": "Senior Stylist",
    "specialization": "Hair Coloring",
    "empId": "EMP001",
    "joinDate": "2023-01-15T00:00:00.000Z",
    "createdAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### PUT `/api/emp/:id` — Update Employee

**Used by:** Admin employee edit

**Request Body (send only fields to update):**

```json
{
  "name": "Rahul Kumar",
  "role": "Lead Stylist"
}
```

**Success Response (200):**

```json
{
  "ok": true,
  "message": "Employee updated successfully",
  "data": { ... }
}
```

---

### DELETE `/api/emp/:id` — Delete Employee

**Example:** `DELETE /api/emp/664f9a1b2c3d4e5f6a7b8c9d`

**Success Response (200):**

```json
{ "ok": true, "message": "Employee deleted successfully" }
```

---

## Phone Number Handling

All phone numbers go through normalization:

| Input | Stored As |
|-------|-----------|
| `6202400672` | `+916202400672` |
| `916202400672` | `+916202400672` |
| `+916202400672` | `+916202400672` |
| `+91 6202400672` | `+916202400672` |
| `91 6202 400 672` | `+916202400672` |

Valid Indian mobile: starts with 6, 7, 8, or 9 followed by 9 digits.

---

## Files Changed

| File | Change |
|------|--------|
| `src/models/empSchema.js` | **NEW** — Employee model (name, phone, role, specialization, empId, joinDate) |
| `src/models/reviewSchema.js` | **UPDATED** — Added empId, empName, dob, anniversaryDate, categories, employeeCategories, specialData. Fixed phone regex to `(91)?` |
| `src/controllers/empController.js` | **NEW** — Full CRUD for employees |
| `src/controllers/reviewController.js` | **UPDATED** — Added createReview (with all new fields), getCustomerReviews, getEmployeeReviews. Fixed phone regex + normalization |
| `src/routes/empRoutes.js` | **NEW** — Employee CRUD routes |
| `src/routes/reviewRoutes.js` | **UPDATED** — Added customer/:phone and employee/:empId routes |
| `src/index.js` | **UPDATED** — Registered emp routes at `/api/emp` |

---

## Frontend Integration Notes

### Customer Review Form

```
1. Phone input → accepts any Indian format (with/without +91)
2. Star rating (1-5) → required
3. 7 category sliders → optional (1-5 each)
4. Employee dropdown → populated from GET /api/emp
5. 4 employee category sliders → shown only when employee selected
6. DOB picker → optional
7. Anniversary picker → optional
8. Review text → optional
9. Submit → POST /api/reviews
```

### Admin Panel

```
- GET /api/reviews → review list with pagination/filtering
- GET /api/reviews/stats → dashboard stats
- GET /api/reviews/customer/:phone → customer lookup
- GET /api/emp → employee list
- POST /api/emp → add employee
- PUT /api/emp/:id → edit employee
- DELETE /api/reviews/:id → delete review
```
