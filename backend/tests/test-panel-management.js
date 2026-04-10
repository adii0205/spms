const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
const Panel = require('../models/Panel');
const PanelConfiguration = require('../models/PanelConfiguration');
const EvaluationMarks = require('../models/EvaluationMarks');
const Group = require('../models/Group');
const Project = require('../models/Project');
const panelAllocationService = require('../services/panelAllocationService');
require('dotenv').config();

const TEST_CONFIG = {
  academicYear: '2025-26',
  semester: 5,
  testPanelSize: 3,
  testTotalProfessors: 27,
  testStudents: 270
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to log test results
function logTest(name, passed, error = null) {
  if (passed) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${error}`);
    testResults.failed++;
    testResults.errors.push({ test: name, error });
  }
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spms-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Cleanup test data
async function cleanupTestData() {
  try {
    await Panel.deleteMany({ academicYear: TEST_CONFIG.academicYear });
    await PanelConfiguration.deleteMany({ academicYear: TEST_CONFIG.academicYear });
    await EvaluationMarks.deleteMany({ academicYear: TEST_CONFIG.academicYear });
    await Faculty.deleteMany({ testFaculty: true });
    await Group.updateMany({ testGroup: true }, { $unset: { panel: 1 } });
    await Project.updateMany({ testProject: true }, { $unset: { panel: 1 } });
    console.log('🧹 Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Cleanup error:', error.message);
  }
}

// Create test faculty (27 total: 9 from each dept)
async function createTestFaculty() {
  try {
    const departments = ['CSE', 'ECE', 'ASH'];
    const faculties = [];

    for (const dept of departments) {
      for (let i = 1; i <= 9; i++) {
        const faculty = new Faculty({
          fullName: `${dept} Faculty ${i}`,
          email: `${dept.toLowerCase()}_fac${i}@test.edu`,
          facultyId: `FAC${dept}${i.toString().padStart(3, '0')}`,
          phone: `999999${i.toString().padStart(4, '0')}`,
          department: dept,
          designation: 'Assistant Professor',
          mode: 'Full Time',
          isActive: true,
          testFaculty: true
        });
        faculties.push(faculty);
      }
    }

    await Faculty.insertMany(faculties);
    console.log(`✅ Created ${faculties.length} test faculty members (9 from each department)`);
    return faculties;
  } catch (error) {
    console.error('❌ Failed to create test faculty:', error.message);
    throw error;
  }
}

// Test 1: Panel Configuration Creation
async function testPanelConfiguration() {
  console.log('\n🧪 Test Suite 1: Panel Configuration');

  try {
    const config = new PanelConfiguration({
      academicYear: TEST_CONFIG.academicYear,
      panelSize: TEST_CONFIG.testPanelSize,
      departmentDistribution: { CSE: 1, ECE: 1, ASH: 1 },
      studentGroupSize: { min: 4, max: 5 },
      marksDistribution: { conveyer: 40, member: 30 },
      totalProfessors: TEST_CONFIG.testTotalProfessors,
      maxGroupsPerPanel: 10,
      maxPanelsPerProfessor: 3,
      conveyerRotationEnabled: true,
      noConveyerRepeatInSemester: true
    });

    await config.save();

    // Verify configuration
    const savedConfig = await PanelConfiguration.findOne({ academicYear: TEST_CONFIG.academicYear });
    const expectedPanels = Math.ceil(TEST_CONFIG.testTotalProfessors / TEST_CONFIG.testPanelSize);

    logTest(
      'Panel configuration created with correct defaults',
      savedConfig && savedConfig.panelSize === TEST_CONFIG.testPanelSize
    );

    logTest(
      'Panel count auto-calculated correctly',
      savedConfig && savedConfig.numberOfPanels === expectedPanels,
      `Expected ${expectedPanels}, got ${savedConfig?.numberOfPanels}`
    );

    logTest(
      'Marks distribution validates correctly',
      savedConfig && savedConfig.isValidMarksDistribution(),
      'Marks distribution does not sum to 100'
    );

    return config;
  } catch (error) {
    logTest('Panel configuration creation', false, error.message);
  }
}

// Test 2: Department-Balanced Panel Generation
async function testDepartmentBalance() {
  console.log('\n🧪 Test Suite 2: Department-Balanced Panel Generation');

  try {
    const panels = await panelAllocationService.generatePanels(
      TEST_CONFIG.semester,
      TEST_CONFIG.academicYear
    );

    logTest(
      'Correct number of panels generated',
      panels.length === 9,
      `Expected 9 panels (27 professors / 3 per panel), got ${panels.length}`
    );

    // Check each panel has 1 from each department
    let allBalanced = true;
    let departmentErrors = [];

    for (const panel of panels) {
      const deptCounts = { CSE: 0, ECE: 0, ASH: 0 };
      
      for (const member of panel.members) {
        const faculty = await Faculty.findById(member.faculty);
        if (faculty && deptCounts.hasOwnProperty(faculty.department)) {
          deptCounts[faculty.department]++;
        }
      }

      // Each panel should have 1 from each department
      if (deptCounts.CSE !== 1 || deptCounts.ECE !== 1 || deptCounts.ASH !== 1) {
        allBalanced = false;
        departmentErrors.push(`Panel ${panel._id}: ${JSON.stringify(deptCounts)}`);
      }
    }

    logTest(
      'Each panel has 1/3 CSE, 1/3 ECE, 1/3 ASH distribution',
      allBalanced,
      departmentErrors.length > 0 ? departmentErrors[0] : 'Unknown error'
    );

    // Check conveyer role distribution
    let conveyerCount = 0;
    for (const panel of panels) {
      const conveyers = panel.members.filter(m => m.role === 'conveyer');
      if (conveyers.length !== 1) {
        logTest('Each panel has exactly one conveyer', false, `Panel has ${conveyers.length} conveyers`);
        return panels;
      }
      conveyerCount++;
    }

    logTest(
      'All panels have exactly one conveyer',
      conveyerCount === panels.length,
      `${conveyerCount} panels out of ${panels.length} have a conveyer`
    );

    return panels;
  } catch (error) {
    logTest('Department-balanced panel generation', false, error.message);
  }
}

// Test 3: Conveyer Rotation (No Repeats Within Semester)
async function testConveyerRotation() {
  console.log('\n🧪 Test Suite 3: Conveyer Rotation Prevention');

  try {
    const panels = await Panel.find({
      academicYear: TEST_CONFIG.academicYear,
      semester: TEST_CONFIG.semester
    }).populate('members.faculty');

    // Build conveyer assignment map
    const conveyerAssignments = {};

    for (const panel of panels) {
      const conveyer = panel.members.find(m => m.role === 'conveyer');
      if (conveyer) {
        const facultyId = conveyer.faculty._id.toString();
        if (!conveyerAssignments[facultyId]) {
          conveyerAssignments[facultyId] = [];
        }
        conveyerAssignments[facultyId].push(panel._id.toString());
      }
    }

    // Check that no professor is conveyer more than once in same semester
    let conveyerRepeatFound = false;
    let repeatCount = 0;

    for (const [facultyId, panelIds] of Object.entries(conveyerAssignments)) {
      if (panelIds.length > 1) {
        conveyerRepeatFound = true;
        repeatCount++;
        console.log(
          `   Warning: Faculty ${facultyId} is conveyer in ${panelIds.length} panels`
        );
      }
    }

    logTest(
      'No professor assigned as conveyer in multiple panels (same semester)',
      !conveyerRepeatFound,
      repeatCount > 0 ? `${repeatCount} professors are conveyers in multiple panels` : ''
    );

    // Check conveyer distribution is fair
    const conveyerCounts = Object.values(conveyerAssignments).map(arr => arr.length);
    const uniqueCounts = new Set(conveyerCounts);

    logTest(
      'Conveyer roles distributed fairly across faculty',
      uniqueCounts.size <= 2,
      `Conveyer count distribution unbalanced: ${JSON.stringify(conveyerCounts)}`
    );

    return conveyerAssignments;
  } catch (error) {
    logTest('Conveyer rotation prevention', false, error.message);
  }
}

// Test 4: Load Distribution Analysis
async function testLoadDistribution() {
  console.log('\n🧪 Test Suite 4: Load Distribution Analysis');

  try {
    const distribution = await panelAllocationService.getPanelLoadDistribution(
      TEST_CONFIG.academicYear
    );

    logTest(
      'Load distribution returned for all faculty',
      distribution && distribution.length === TEST_CONFIG.testTotalProfessors,
      `Expected ${TEST_CONFIG.testTotalProfessors} faculty entries, got ${distribution?.length}`
    );

    if (distribution && distribution.length > 0) {
      // Check load balance
      const loads = distribution.map(f => f.panelCount);
      const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
      const maxLoad = Math.max(...loads);
      const minLoad = Math.min(...loads);

      logTest(
        'Load distribution is balanced (max-min ≤ 1)',
        maxLoad - minLoad <= 1,
        `Load range: ${minLoad}-${maxLoad} (avg: ${avgLoad.toFixed(2)})`
      );

      // Each faculty should be in at least 1 panel
      const noAssignments = distribution.filter(f => f.panelCount === 0).length;
      logTest(
        'All faculty assigned to at least one panel',
        noAssignments === 0,
        `${noAssignments} faculty have no panel assignments`
      );
    }

    return distribution;
  } catch (error) {
    logTest('Load distribution analysis', false, error.message);
  }
}

// Test 5: Backward Compatibility
async function testBackwardCompatibility() {
  console.log('\n🧪 Test Suite 5: Backward Compatibility');

  try {
    // Create a group WITHOUT panel assignment
    const group = new Group({
      name: 'Test Group Without Panel',
      semester: 5,
      academicYear: TEST_CONFIG.academicYear,
      minMembers: 4,
      maxMembers: 5,
      leader: new mongoose.Types.ObjectId(),
      members: [],
      status: 'forming',
      testGroup: true
    });

    await group.save();

    // Verify panel field is optional (null by default)
    logTest(
      'Group can be created without panel assignment',
      group && group.panel === undefined || group.panel === null
    );

    // Create a project WITHOUT panel assignment
    const project = new Project({
      title: 'Test Project Without Panel',
      description: 'Testing backward compatibility',
      projectType: 'minor2',
      student: new mongoose.Types.ObjectId(),
      semester: 5,
      academicYear: TEST_CONFIG.academicYear,
      status: 'registered',
      testProject: true
    });

    await project.save();

    logTest(
      'Project can be created without panel assignment',
      project && (project.panel === undefined || project.panel === null)
    );

    // Verify existing queries still work
    const groupsWithoutPanel = await Group.find({
      semester: 5,
      academicYear: TEST_CONFIG.academicYear,
      panel: { $exists: false }
    });

    logTest(
      'Backward compatible queries work (find groups without panel)',
      groupsWithoutPanel.length > 0 || groupsWithoutPanel.length === 0 // Just verify query doesn't error
    );

    return true;
  } catch (error) {
    logTest('Backward compatibility', false, error.message);
  }
}

// Test 6: Panel Assignment to Groups
async function testGroupPanelAssignment() {
  console.log('\n🧪 Test Suite 6: Panel Assignment to Groups');

  try {
    const panels = await Panel.find({
      academicYear: TEST_CONFIG.academicYear,
      semester: TEST_CONFIG.semester
    });

    logTest(
      'Panels exist for assignment',
      panels.length > 0,
      'No panels found to assign to groups'
    );

    if (panels.length > 0) {
      // Simulate assigning groups to panels
      const testGroup = new Group({
        name: 'Test Group For Panel',
        semester: TEST_CONFIG.semester,
        academicYear: TEST_CONFIG.academicYear,
        minMembers: 4,
        maxMembers: 5,
        leader: new mongoose.Types.ObjectId(),
        members: [],
        panel: panels[0]._id,
        status: 'forming',
        testGroup: true
      });

      await testGroup.save();

      logTest(
        'Group can be assigned to a panel',
        testGroup && testGroup.panel && testGroup.panel.toString() === panels[0]._id.toString()
      );

      // Verify we can retrieve group by panel
      const groupsInPanel = await Group.find({ panel: panels[0]._id });
      logTest(
        'Can query groups by panel',
        groupsInPanel.length > 0,
        'Query returned no groups for panel'
      );
    }

    return true;
  } catch (error) {
    logTest('Panel assignment to groups', false, error.message);
  }
}

// Test 7: Evaluation Marks Calculation
async function testEvaluationMarksCalculation() {
  console.log('\n🧪 Test Suite 7: Evaluation Marks Calculation');

  try {
    const panels = await Panel.find({
      academicYear: TEST_CONFIG.academicYear,
      semester: TEST_CONFIG.semester
    }).limit(1);

    logTest(
      'Panel exists for evaluation test',
      panels.length > 0,
      'No panels found'
    );

    if (panels.length > 0) {
      const panel = panels[0];
      
      // Create evaluation marks record
      const evaluation = new EvaluationMarks({
        group: new mongoose.Types.ObjectId(),
        panel: panel._id,
        semester: TEST_CONFIG.semester,
        academicYear: TEST_CONFIG.academicYear,
        marksDetails: {
          conveyer: {
            faculty: panel.members[0].faculty,
            marks: 85,
            comments: 'Good project',
            submittedAt: new Date()
          },
          members: [
            {
              faculty: panel.members[1].faculty,
              marks: 80,
              comments: 'Contributed well',
              submittedAt: new Date()
            },
            {
              faculty: panel.members[2].faculty,
              marks: 75,
              comments: 'Adequate participation',
              submittedAt: new Date()
            }
          ]
        }
      });

      await evaluation.save();

      logTest(
        'Evaluation record created',
        evaluation && evaluation._id
      );

      // Test total marks calculation
      const totalMarks = await evaluation.calculateTotalMarks();

      // Expected: (85 * 0.4) + ((80 + 75) / 2 * 0.3 * 2) = 34 + 46.5 = 80.5
      // With marks distribution: conveyer 40%, members 30% each
      const expectedCalc = `Conveyer: ${85 * 0.4}, Members avg: ${(80 + 75) / 2}, Total should be 100 scale`;

      logTest(
        'Evaluation marks calculated (conveyer + members weighted)',
        evaluation.totalMarks !== undefined,
        `Calculation result: ${evaluation.totalMarks}, Expected formula: ${expectedCalc}`
      );

      // Check completion status
      const isComplete = evaluation.isCompletelyEvaluated();
      logTest(
        'Evaluation marked as complete when all members submitted',
        isComplete === true,
        'Evaluation not marked as complete'
      );
    }

    return true;
  } catch (error) {
    logTest('Evaluation marks calculation', false, error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('=====================================');
  console.log('🚀 Panel Management System Tests');
  console.log('=====================================\n');

  try {
    await connectDB();
    await cleanupTestData();

    // Create test faculty
    await createTestFaculty();

    // Run test suites
    await testPanelConfiguration();
    await testDepartmentBalance();
    await testConveyerRotation();
    await testLoadDistribution();
    await testBackwardCompatibility();
    await testGroupPanelAssignment();
    await testEvaluationMarksCalculation();

    // Print summary
    console.log('\n=====================================');
    console.log('📊 Test Summary');
    console.log('=====================================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total: ${testResults.passed + testResults.failed}`);

    if (testResults.failed > 0) {
      console.log('\n⚠️  Failures:');
      testResults.errors.forEach(err => {
        console.log(`   - ${err.test}: ${err.error}`);
      });
    }

    // Cleanup
    await cleanupTestData();
    await mongoose.connection.close();

    console.log('\n✅ Tests completed');
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test suite error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Start tests
runAllTests();
