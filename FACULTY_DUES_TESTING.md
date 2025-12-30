# Faculty Dues System - Testing & Setup Guide

## Step 1: Create HR User in Database

To create an HR user, you can either:

### Option A: Direct Database Insert

```javascript
// In MongoDB, insert a new user
db.users.insertOne({
  email: "hr@college.edu",
  password: "hashed_password", // Use bcrypt to hash
  role: "hr",
  roles: ["hr"],
  department: "HR",
  createdAt: new Date(),
});
```

### Option B: Via Admin Panel

1. Login as admin
2. Go to Users management
3. Create new user with role "hr"
4. Set department to "HR"

## Step 2: Testing the HR Workflow

### Login as HR

1. Go to `/login`
2. Enter HR credentials
3. Should redirect to `/hr` (HR Dashboard)

### HR Dashboard (`/hr`)

- Should show:
  - Total Faculty count
  - Total Dues count
  - Total Pending Amount
  - Faculty with Dues count
  - Payable vs Non-Payable breakdown

### Add Faculty Due (`/hr/add-faculty-due`)

1. Select a faculty member
2. Enter description (e.g., "Equipment damage")
3. Enter amount
4. Select due date
5. Choose category (Payable or Non-Payable)
6. Select due type
7. Optionally add Google Drive link
8. Click "Add Faculty Due"
9. Should see success message
10. Check database - new Due record should be created with `personType: "Faculty"`

## Step 3: Testing Accounts Workflow

### Login as Accounts Operator

1. Go to `/login`
2. Enter Accounts department operator credentials
3. Should redirect to `/operator`

### Operator Sidebar (Accounts Department)

- Should see:
  - Dashboard
  - All Dept. Dues
  - **📚 Student Dues** (NEW)
  - **👨‍🏫 Faculty Dues** (NEW)
  - Change Password

### Student Dues Page (`/operator/accounts-student-dues`)

1. Click "📚 Student Dues"
2. Should show all students with pending dues
3. Test filters: Roll Number, Name, Department, Status
4. Click "View Dues" button
5. Should navigate to student details with payment controls

### Faculty Dues Page (`/operator/accounts-faculty-dues`)

1. Click "👨‍🏫 Faculty Dues"
2. Should show all faculty with dues summary
3. Test filters: Faculty ID, Name, Status
4. Check columns:
   - Faculty ID
   - Name
   - Email
   - Department
   - No. of Dues
   - Total Amount
   - Payment Status
5. Click "View Dues" button
6. Should navigate to faculty details

### Faculty Dues Details Page (`/operator/faculty/:facultyId`)

1. Should display faculty information
2. Should show summary cards:
   - Total Amount
   - Pending Amount
   - Payable Amount
   - Total Dues
3. Should show table with all dues
4. For payable dues, should have dropdown:
   - "Due (Unpaid)"
   - "Done (Paid)"
5. Change payment status and confirm
6. Should update immediately

## Step 4: Testing Department Clear Dues

### Login as Department Operator (Non-Accounts)

1. Go to `/login`
2. Enter a department operator (e.g., CSE) credentials
3. Go to Clear Dues

### Clear Dues Page (`/operator/clear-dues`)

1. Should now see Due Type filter dropdown with all 9 types
2. Test Due Type filter:
   - Select "Damage to College Property"
   - Table should filter by that type
   - Select "All Due Types"
   - Table should show all
3. For non-payable dues:
   - Should be clearable directly
4. For payable dues:
   - Should only be clearable if payment status is "Done" (marked by Accounts)

## Step 5: Database Verification

Check MongoDB to verify records:

### Faculty Dues Created

```javascript
db.dues.findOne({
  personType: "Faculty",
  personId: "FACULTY_ID",
});
```

Expected output:

```javascript
{
  _id: ObjectId(...),
  personId: "FACULTY_ID",
  personName: "Faculty Name",
  personType: "Faculty",
  department: "Department Name",
  description: "Description",
  amount: 5000,
  dueDate: ISODate(...),
  dueType: "damage-to-property",
  category: "payable",
  link: "https://drive.google.com/...",
  paymentStatus: "due",
  status: "pending",
  dateAdded: ISODate(...),
  clearDate: null
}
```

## Troubleshooting

### Issue: HR link not showing in sidebar

**Solution**: Ensure user role is "hr" in database, not just in roles array

### Issue: Faculty Dues pages not loading

**Solution**:

1. Check network tab in browser console
2. Verify backend route `/operator/all-faculty` returns data
3. Ensure Accounts operator is logged in
4. Check CORS settings if running on different ports

### Issue: Payment status not updating

**Solution**:

1. Check if user is Accounts operator
2. Verify due is payable (not non-payable)
3. Check network request in browser console
4. Verify API endpoint `/operator/update-payment-status/:id`

### Issue: Can't clear faculty dues

**Solution**:

1. Faculty dues must have `paymentStatus: "done"`
2. This is only set by Accounts operator
3. Non-Accounts operators can't mark as done
4. Non-payable dues don't need payment

## Sample Test Data Creation

```javascript
// Create test faculty due for CSE department
db.dues.insertOne({
  personId: "CSE001",
  personName: "Dr. John Doe",
  personType: "Faculty",
  department: "CSE",
  description: "Lab Equipment Damage",
  amount: 10000,
  dueDate: new Date("2025-01-31"),
  dueType: "lab-equipment",
  category: "payable",
  link: "https://drive.google.com/file/...",
  paymentStatus: "due",
  status: "pending",
  dateAdded: new Date(),
  clearDate: null,
});
```

## Performance Notes

- **All Faculty route**: Fetches all faculty and their dues
- **Faculty Dues route**: Filters by `personType: "Faculty"`
- **Indexing recommended**: Add index on `personType` and `personId` for better performance
- **Large datasets**: Consider pagination for tables with 100+ records

## Security Considerations

✅ Only HR can create faculty dues
✅ Only Accounts can update payment status
✅ Only Department operators can clear dues
✅ All operations require authentication
✅ Role-based access control enforced at backend

## API Endpoints Used

```
POST   /operator/add-due              (Create dues - HR & Department)
GET    /operator/all-faculty          (List faculty with dues - Accounts)
GET    /operator/all-faculty/:id/dues (Faculty dues details - Accounts)
PUT    /operator/update-payment-status/:id (Update payment - Accounts)
PUT    /operator/clear-due/:id        (Clear due - Department)
GET    /operator/faculty              (Fetch all faculty)
```
