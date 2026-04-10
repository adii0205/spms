# Panel Management System - Manual API Testing Guide

## Quick Start

Before testing, make sure:
1. Backend server is running: `npm start` (from `/backend` folder)
2. MongoDB is connected and accessible
3. You have sample faculty data (or create test faculty first)

## API Testing Script

Save this as `manual-api-test.js` in the backend folder and run with `node manual-api-test.js`

```javascript
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/admin';
const ACADEMIC_YEAR = '2025-26';
const SEMESTER = 5;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  switch(type) {
    case 'success':
      console.log(`${colors.green}✅ [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}❌ [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ️  [${timestamp}] ${message}${colors.reset}`);
      break;
    case 'test':
      console.log(`${colors.yellow}🧪 [${timestamp}] ${message}${colors.reset}`);
      break;
  }
}

async function testEndpoint(name, method, endpoint, data = null) {
  try {
    log('test', `Testing: ${name}`);
    const config = { method, url: `${API_URL}${endpoint}` };
    if (data) config.data = data;
    
    const response = await axios(config);
    log('success', `${name}: ${response.status}`);
    return response.data;
  } catch (error) {
    log('error', `${name}: ${error.response?.status || error.message}`);
    if (error.response?.data?.message) {
      console.log(`   Details: ${error.response.data.message}`);
    }
    return null;
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🚀 Panel Management API - Manual Testing');
  console.log('═══════════════════════════════════════════════════\n');

  let config = null;
  let panelId = null;

  // 1. Set Panel Configuration
  log('info', 'STEP 1: Setting Panel Configuration');
  const configData = {
    panelSize: 3,
    departmentDistribution: { CSE: 1, ECE: 1, ASH: 1 },
    studentGroupSize: { min: 4, max: 5 },
    marksDistribution: { conveyer: 40, member: 30 },
    totalProfessors: 27,
    maxGroupsPerPanel: 10,
    maxPanelsPerProfessor: 3,
    conveyerRotationEnabled: true,
    noConveyerRepeatInSemester: true
  };
  
  const setConfigResult = await testEndpoint(
    'Set Panel Configuration',
    'POST',
    `/panel-config/${ACADEMIC_YEAR}`,
    configData
  );

  // 2. Get Panel Configuration
  log('info', 'STEP 2: Getting Panel Configuration');
  const getConfigResult = await testEndpoint(
    'Get Panel Configuration',
    'GET',
    `/panel-config/${ACADEMIC_YEAR}`
  );

  // 3. Generate Panels
  log('info', 'STEP 3: Generating Panels for Semester');
  const generateResult = await testEndpoint(
    'Generate Panels',
    'POST',
    `/generate-panels`,
    { semester: SEMESTER, academicYear: ACADEMIC_YEAR }
  );
  
  if (generateResult?.data?.panels?.length > 0) {
    panelId = generateResult.data.panels[0]._id;
    log('info', `Generated ${generateResult.data.count} panels`);
  }

  // 4. Get Panels by Semester
  log('info', 'STEP 4: Fetching Panels by Semester');
  const getPanelsResult = await testEndpoint(
    'Get Panels by Semester',
    'GET',
    `/panels?semester=${SEMESTER}&academicYear=${ACADEMIC_YEAR}`
  );

  // 5. Get Panel Details
  if (panelId) {
    log('info', 'STEP 5: Fetching Panel Details');
    const panelDetailsResult = await testEndpoint(
      'Get Panel Details',
      'GET',
      `/panels/${panelId}`
    );
  }

  // 6. Get Panel Load Distribution
  log('info', 'STEP 6: Analyzing Panel Load Distribution');
  const loadDistResult = await testEndpoint(
    'Get Panel Load Distribution',
    'GET',
    `/panel-load?semester=${SEMESTER}&academicYear=${ACADEMIC_YEAR}`
  );

  // 7. Get Faculty Panels
  log('info', 'STEP 7: Fetching Faculty Panels');
  const facultyPanelsResult = await testEndpoint(
    'Get Faculty Panels',
    'GET',
    `/faculty/panels`
  );

  // 8. Get Faculty Evaluations
  log('info', 'STEP 8: Fetching Faculty Evaluations');
  const facultyEvalsResult = await testEndpoint(
    'Get Faculty Evaluations',
    'GET',
    `/faculty/evaluations`
  );

  // 9. Get Semester Evaluations
  log('info', 'STEP 9: Getting Semester Evaluations');
  const semesterEvalsResult = await testEndpoint(
    'Get Semester Evaluations',
    'GET',
    `/evaluations?semester=${SEMESTER}&academicYear=${ACADEMIC_YEAR}`
  );

  // 10. Rotate Conveyers
  log('info', 'STEP 10: Rotating Conveyers');
  const rotateResult = await testEndpoint(
    'Rotate Conveyers',
    'POST',
    `/rotate-conveyers`,
    { semester: SEMESTER, academicYear: ACADEMIC_YEAR }
  );

  console.log('\n═══════════════════════════════════════════════════');
  log('info', 'Manual Testing Complete');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(err => {
  log('error', `Test suite failed: ${err.message}`);
  process.exit(1);
});
```

---

## Manual cURL Testing

### 1. Set Panel Configuration
```bash
curl -X POST http://localhost:5000/api/admin/panel-config/2025-26 \
  -H "Content-Type: application/json" \
  -d '{
    "panelSize": 3,
    "departmentDistribution": {"CSE": 1, "ECE": 1, "ASH": 1},
    "studentGroupSize": {"min": 4, "max": 5},
    "marksDistribution": {"conveyer": 40, "member": 30},
    "totalProfessors": 27,
    "maxGroupsPerPanel": 10,
    "maxPanelsPerProfessor": 3,
    "conveyerRotationEnabled": true,
    "noConveyerRepeatInSemester": true
  }'
```

### 2. Get Panel Configuration
```bash
curl -X GET http://localhost:5000/api/admin/panel-config/2025-26
```

### 3. Generate Panels for Semester
```bash
curl -X POST http://localhost:5000/api/admin/generate-panels \
  -H "Content-Type: application/json" \
  -d '{
    "semester": 5,
    "academicYear": "2025-26"
  }'
```

### 4. Get Panels by Semester
```bash
curl -X GET "http://localhost:5000/api/admin/panels?semester=5&academicYear=2025-26"
```

### 5. Get Panel Details
```bash
# Replace PANEL_ID with actual panel ID from step 3
curl -X GET http://localhost:5000/api/admin/panels/PANEL_ID
```

### 6. Update Panel Members
```bash
# Replace PANEL_ID with actual panel ID
curl -X PUT http://localhost:5000/api/admin/panels/PANEL_ID/members \
  -H "Content-Type: application/json" \
  -d '{
    "members": ["faculty_id_1", "faculty_id_2", "faculty_id_3"],
    "conveyer": "faculty_id_1"
  }'
```

### 7. Get Panel Load Distribution
```bash
curl -X GET "http://localhost:5000/api/admin/panel-load?semester=5&academicYear=2025-26"
```

### 8. Rotate Conveyers
```bash
curl -X POST http://localhost:5000/api/admin/rotate-conveyers \
  -H "Content-Type: application/json" \
  -d '{
    "semester": 5,
    "academicYear": "2025-26"
  }'
```

### 9. Get Faculty Panels
```bash
curl -X GET http://localhost:5000/api/admin/faculty/panels
```

### 10. Get Faculty Evaluations
```bash
curl -X GET http://localhost:5000/api/admin/faculty/evaluations
```

### 11. Submit Evaluation Marks
```bash
curl -X POST http://localhost:5000/api/admin/evaluations/submit \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "GROUP_ID",
    "panelId": "PANEL_ID",
    "marksObtained": 85,
    "comments": "Excellent project execution"
  }'
```

### 12. Get Evaluation Status
```bash
curl -X GET http://localhost:5000/api/admin/evaluations/status/GROUP_ID
```

### 13. Get Semester Evaluations
```bash
curl -X GET "http://localhost:5000/api/admin/evaluations?semester=5&academicYear=2025-26"
```

### 14. Get Group Evaluation Marks
```bash
curl -X GET http://localhost:5000/api/admin/group-marks/GROUP_ID
```

### 15. Delete Panel
```bash
curl -X DELETE http://localhost:5000/api/admin/panels/PANEL_ID
```

---

## Frontend Component Integration Testing

### Testing PanelConfiguration Component

1. **Navigate to Admin Panel Config Page**
   - Open: `http://localhost:5173/admin/panel-config`
   - Should see form with all configuration fields

2. **Test Form Inputs**
   - Try different panel sizes (2-5)
   - Verify department distribution doesn't exceed panel size
   - Check marks calculation auto-validates

3. **Save Configuration**
   - Fill form and click "Save Configuration"
   - Should show success message
   - Configuration should load on refresh

4. **Generate Panels**
   - Click "Generate Panels"
   - Should show success with panel count
   - Verify panels created for semester 5

### Testing PanelView Component

1. **Navigate to Faculty Panel View**
   - Open: `http://localhost:5173/faculty/panels`
   - Should show list of assigned panels

2. **Verify Panel List**
   - Click on each panel
   - Should display member list with departments
   - Should show assigned groups

3. **Check Evaluation Status**
   - Should show "Pending" or "Submitted" status
   - Should show marks if already evaluated

### Testing EvaluationSubmission Component

1. **Navigate to Evaluation Page**
   - Open: `http://localhost:5173/faculty/evaluation`
   - Should show list of groups requiring evaluation

2. **Test Evaluation Form**
   - Select a group
   - Enter marks (0-100)
   - Check role-based marks calculation
   - Add comments

3. **Submit Evaluation**
   - Click "Submit Evaluation"
   - Should show success message
   - Status should change to "Submitted"

---

## End-to-End Workflow Testing

### Complete Flow:

1. **Admin creates panel configuration**
   - Set all parameters (sizes, distribution, marks)
   - Save to database

2. **Admin generates panels**
   - System creates balanced panels
   - Each panel has 1/3 CSE, 1/3 ECE, 1/3 ASH

3. **Verify conveyer rotation**
   - Check that no professor is conveyer in multiple panels
   - Load distribution is balanced

4. **Faculty views assigned panels**
   - Faculty logs in
   - Sees all panels they're assigned to
   - Can see group assignments

5. **Faculty submits evaluations**
   - For each group, submit marks
   - System calculates weighted contribution
   - Marks stored in database

---

## Expected Results

✅ **All API endpoints should return:**
- Status 200 for GET requests
- Status 201 for POST (create) requests
- Status 200 for PUT (update) requests
- Status 204 for DELETE requests

✅ **Frontend components should:**
- Load without errors
- Display API data correctly
- Handle form submissions
- Show success/error messages

✅ **Data validation should:**
- Enforce marks between 0-100
- Prevent invalid department distributions
- Ensure one conveyer per panel

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 Not Found | Check endpoint URL and method (GET, POST, etc.) |
| 500 Server Error | Check backend console for error details |
| Connection refused | Ensure backend is running on port 5000 |
| CORS error | Check CORS configuration in backend |
| Marks validation fails | Ensure conveyer% + (members × member%) = 100% |
