# Frontend Integration Testing Checklist

## Setup Requirements

- [ ] Backend server running on `http://localhost:5000`
- [ ] MongoDB connected and populated with sample data
- [ ] Frontend running on `http://localhost:5173` (or configured port)
- [ ] API methods available in `utils/api.js` (16 methods added)
- [ ] Three components created and routed:
  - [x] PanelConfiguration.jsx → `/admin/panel-config`
  - [x] PanelView.jsx → `/faculty/panels`
  - [x] EvaluationSubmission.jsx → `/faculty/evaluation`

---

## Integration Steps

### Step 1: Verify API Methods are Accessible

In frontend browser console, test:
```javascript
import { adminAPI } from './src/utils/api.js';

// Should show 16 methods
console.log(Object.keys(adminAPI));
```

**Expected methods:**
```
getPanelConfiguration
setPanelConfiguration
generatePanels
getPanelsBySemester
getPanelDetails
updatePanelMembers
rotateConveyers
getPanelLoadDistribution
deletePanel
getFacultyPanels
getFacultyEvaluations
submitEvaluationMarks
getEvaluationStatus
getSemesterEvaluations
getGroupEvaluationMarks
```

---

### Step 2: Test Admin Panel Configuration Component

#### Route Navigation
- [ ] Navigate to `/admin/panel-config`
- [ ] Component loads without errors
- [ ] Header "Panel Management Configuration" displays

#### Form Fields
- [ ] Academic Year input visible
- [ ] Panel Size dropdown (2-5 range)
- [ ] Department Distribution section (CSE, ECE, ASH)
- [ ] Student Group Size (min/max)
- [ ] Marks Distribution (conveyer %, member %)
- [ ] Total Professors input
- [ ] Checkbox: "Enable Conveyer Rotation"
- [ ] Checkbox: "Prevent Conveyer Repeat"

#### Form Validation
- [ ] **Marks validation:**
  - Input: Conveyer 40%, Member 30%
  - Panel size: 3 (1 conveyer + 2 members)
  - Expected: 40 + (2 × 30) = 100% ✅
  - Should show: "Total: 100%" in green

- [ ] **Invalid marks detection:**
  - Change member % to 25
  - Expected: "Total: 40 + (2 × 25) = 90%" in red
  - Save button disabled until fixed

- [ ] **Department distribution validation:**
  - Try CSE: 2, ECE: 1, ASH: 0 (panel size 3) ✅
  - Try CSE: 2, ECE: 1, ASH: 1 (panel size 3) ❌ Should warn

#### Save Configuration
- [ ] Click "Save Configuration"
- [ ] Success message: "Panel configuration saved successfully!"
- [ ] Form repopulates with saved values
- [ ] Refresh page: values persist

#### Summary Card
- [ ] Panel Size: shows correct value
- [ ] Expected Panels: calculated correctly (totalProfs ÷ panelSize)
- [ ] Total Professors: shows value
- [ ] Marks Total: updates in real-time as you edit

#### Generate Panels
- [ ] Click "Generate Panels"
- [ ] Success message: "Generated X panels successfully..."
- [ ] Panels created in database
- [ ] Each panel has:
  - [x] 1/3 CSE members
  - [x] 1/3 ECE members
  - [x] 1/3 ASH members
  - [x] Exactly 1 conveyer
  - [x] 2+ members

---

### Step 3: Test Faculty Panel View Component

#### Route Navigation
- [ ] Navigate to `/faculty/panels`
- [ ] Component loads (or shows "No panels assigned yet")
- [ ] Header "My Panel Assignments" displays

#### Panel List (when panels exist)
- [ ] Panel list shows on left side
- [ ] Each panel shows:
  - Panel code (e.g., "PANEL001")
  - Member count
  - Role badge (Conveyer/Member)

- [ ] Click on a panel → highlights in blue
- [ ] Panel details load on right side

#### Panel Details View
- [ ] Panel code displays as title
- [ ] Semester number shows
- [ ] Conveyer/Member badge shows correct role
- [ ] Academic year displays

#### Panel Members Section
- [ ] Members listed with:
  - Name
  - Department (CSE/ECE/ASH)
  - Role indicator (Conveyer badge)
- [ ] Conveyer highlighted in yellow
- [ ] Regular members in gray

#### Assigned Groups Section
- [ ] Groups assigned to panel display
- [ ] Each group shows:
  - Group code
  - Project code
  - Number of students
  - Project title
- [ ] Clicking group → highlights

#### Evaluation Status Section
- [ ] Shows all groups with status:
  - ⏱ "Pending" (yellow) - not yet evaluated
  - ✓ "Submitted" (green) - marks submitted
- [ ] Shows marks if submitted: "Marks: 85"
- [ ] Real-time status updates

#### No Panels State
- [ ] If no panels assigned
- [ ] Shows: "No panels assigned to you yet"
- [ ] Shows: "Panels will appear here when admin assigns them"

---

### Step 4: Test Faculty Evaluation Submission Component

#### Route Navigation
- [ ] Navigate to `/faculty/evaluation`
- [ ] Component loads
- [ ] Header "Evaluation Submission" displays

#### Evaluation List (when evaluations exist)
- [ ] List shows groups to evaluate
- [ ] Each item shows:
  - Group code
  - Panel code
  - Role (Conveyer/Member)
  - Status (Pending/Draft/Submitted)

#### Selection & Form Loading
- [ ] Click group → form loads on right
- [ ] Form populates with:
  - Group code (title)
  - Panel assignment
  - Project title
  - Group members list
  - Previous marks (if submitted before)

#### Role-Based UI
- **For Conveyer Role:**
  - [ ] Shows: "👨‍💼 As Conveyer"
  - [ ] Shows: "Your marks carry 40% weight"
  - [ ] Marks input visible
  - [ ] Calculation: `marks × 40%`

- **For Member Role:**
  - [ ] Shows: "👤 As Panel Member"
  - [ ] Shows: "Your marks carry 30% weight"
  - [ ] Marks input visible
  - [ ] Calculation: `marks × 30%`

#### Group Members Display
- [ ] Shows numbered list of group members
- [ ] Each member shows:
  - Name
  - Email
  - Number indicator

#### Marks Input & Validation
- [ ] Input accepts numbers 0-100
- [ ] Real-time calculation of contribution:
  - Input: 80
  - Conveyer: Shows "80 × 40% = 32.0 points"
  - Member: Shows "80 × 30% = 24.0 points"

- [ ] Validation on submit:
  - [ ] Rejects empty input
  - [ ] Rejects non-numeric
  - [ ] Rejects < 0 or > 100
  - [ ] Shows error message

#### Comments Field
- [ ] Optional textarea visible
- [ ] Character counter "0/500" displays
- [ ] Counter updates as type
- [ ] Placeholder text shown

#### Helper Text (if Available)
- [ ] Status badge shows current state
- [ ] Evaluation guidelines visible

#### Submit Button
- [ ] Button text: "Submit Evaluation"
- [ ] Disabled if marks empty
- [ ] Enabled when marks entered

#### Submission Test
- [ ] Enter marks: 85
- [ ] Enter comments: "Good execution"
- [ ] Click "Submit Evaluation"
- [ ] Success message: "Evaluation submitted successfully!"
- [ ] Status changes to "Submitted"
- [ ] Marks saved: 85
- [ ] Comments saved

#### Edit Previous Submission
- [ ] Select previously submitted group
- [ ] Form loads with previous marks/comments
- [ ] Can modify and resubmit
- [ ] New data overwrites old

#### Cancel Button
- [ ] Click cancel → clears form
- [ ] Deselects group
- [ ] No submission occurs

#### No Evaluations State
- [ ] If no groups
- [ ] Shows: "No evaluations assigned to you yet"

---

## Data Validation Checklist

### Panel Generation
- [ ] Panel size respected (3 members typically)
- [ ] Department distribution balanced:
  - For size 3: ~1 CSE, ~1 ECE, ~1 ASH
  - Distribution follows configured percentages
- [ ] Conveyer rotation working:
  - Same professor not conveyer in multiple panels
  - Conveyer role rotated evenly across faculty
- [ ] Load distribution balanced:
  - No professor exceeds maxPanelsPerProfessor
  - Workload fairly distributed

### Evaluation Marks
- [ ] Marks stored as integer (0-100)
- [ ] Comments stored and retrieved
- [ ] Role-based weight calculation correct
- [ ] Multiple submissions update existing record
- [ ] Status transitions work (Pending → Draft → Submitted)

### Error Handling
- [ ] Invalid marks show error message
- [ ] Network errors caught and displayed
- [ ] API errors show meaningful messages
- [ ] Loading states show during API calls
- [ ] Spinners/skeletons display appropriately

---

## Performance Checks

- [ ] Component loads within 2 seconds
- [ ] Form interactions responsive (no lag)
- [ ] List scrolling smooth
- [ ] API calls complete reasonably
- [ ] No console errors or warnings
- [ ] Memory doesn't leak on navigation

---

## UI/UX Verification

- [ ] Responsive on mobile (375px width)
- [ ] Responsive on tablet (768px width)
- [ ] Responsive on desktop (1920px width)
- [ ] Color scheme consistent (Tailwind)
- [ ] Buttons clickable (44px minimum)
- [ ] Input fields accessible
- [ ] Error messages clearly visible
- [ ] Success messages display correctly
- [ ] Loading states indicate progress
- [ ] Navigation flows logically

---

## End-to-End Workflow Test

1. **Setup**
   - [ ] Create panel configuration (admin)
   - [ ] Generate 3+ panels for semester 5
   - [ ] Ensure faculty assigned to panels

2. **Faculty Views**
   - [ ] Faculty logs in
   - [ ] Navigate to "My Panels"
   - [ ] See assigned panels
   - [ ] View panel members and groups

3. **Evaluation Submission**
   - [ ] Faculty navigates to evaluation
   - [ ] See assigned groups
   - [ ] Submit marks for 2+ groups
   - [ ] Verify marks calculating correctly

4. **Verification**
   - [ ] Admin views panel load distribution
   - [ ] Admin views semester evaluations
   - [ ] All marks submitted correctly
   - [ ] Conveyer rotation maintained

---

## Documentation

- [ ] Component usage documented in code comments
- [ ] API error handling explained
- [ ] Form validation logic clear
- [ ] README updated with: endpoints, components, setup
- [ ] Known issues documented

---

## Deployment Checklist

- [ ] No hardcoded URLs (uses API base URL)
- [ ] Environment variables configured
- [ ] API calls use proper error handling
- [ ] Console.log statements removed (production)
- [ ] No security vulnerabilities
- [ ] Credentials not exposed in code

---

## Sign-Off

- **Date Tested:** _______________
- **Tester Name:** _______________
- **All Tests Passed:** Yes ☐ | No ☐
- **Issues Found:** _______________
- **Ready for Production:** Yes ☐ | No ☐

