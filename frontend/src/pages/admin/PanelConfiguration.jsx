import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';

const PanelConfiguration = () => {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [semester, setSemester] = useState(5);
  const [config, setConfig] = useState(null);
  const [panels, setPanels] = useState([]);
  const [facultyAvailability, setFacultyAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [formData, setFormData] = useState({
    panelSize: 3,
    departmentDistribution: { CSE: 1, ECE: 1, ASH: 1 },
    studentGroupSize: { min: 4, max: 5 },
    marksDistribution: { conveyer: 40, member: 30 },
    totalProfessors: 27,
    maxGroupsPerPanel: 10,
    maxPanelsPerProfessor: 3,
    conveyerRotationEnabled: true,
    noConveyerRepeatInSemester: true
  });

  // Fetch configuration and panels on load
  useEffect(() => {
    fetchFacultyAvailability();
    fetchConfiguration();
    fetchPanels();
  }, [academicYear, semester]);

  // Validate configuration when form data changes
  useEffect(() => {
    validateConfiguration();
  }, [formData, facultyAvailability]);

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getPanelConfiguration({ academicYear });
      setConfig(data.data);
      setFormData({
        panelSize: data.data.panelSize,
        departmentDistribution: data.data.departmentDistribution,
        studentGroupSize: data.data.studentGroupSize,
        marksDistribution: data.data.marksDistribution,
        totalProfessors: data.data.totalProfessors,
        maxGroupsPerPanel: data.data.maxGroupsPerPanel,
        maxPanelsPerProfessor: data.data.maxPanelsPerProfessor,
        conveyerRotationEnabled: data.data.conveyerRotationEnabled,
        noConveyerRepeatInSemester: data.data.noConveyerRepeatInSemester
      });
      setMessage({ type: 'success', text: 'Configuration loaded successfully' });
    } catch (error) {
      // Configuration might not exist yet, that's okay
      if (error.status === 404) {
        setMessage({ type: 'info', text: 'No configuration exists yet. Create one below.' });
      } else {
        handleApiError(error, (msg) => setMessage({ type: 'error', text: msg }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      // Handle nested properties like departmentDistribution.CSE
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: isNaN(value) ? value : parseInt(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(value) ? value : parseInt(value)
      }));
    }
  };

  const validateMarksDistribution = () => {
    const numMembers = formData.panelSize - 1;
    const totalMarks = formData.marksDistribution.conveyer + (formData.marksDistribution.member * numMembers);
    return totalMarks === 100;
  };

  const handleSaveConfiguration = async (e) => {
    e.preventDefault();

    if (!validateMarksDistribution()) {
      const numMembers = formData.panelSize - 1;
      const expectedSum = 100;
      const currentSum = formData.marksDistribution.conveyer + (formData.marksDistribution.member * numMembers);
      setMessage({
        type: 'error',
        text: `Marks distribution invalid. Conveyer (${formData.marksDistribution.conveyer}%) + ${numMembers} members × ${formData.marksDistribution.member}% = ${currentSum}%. Must equal 100%.`
      });
      return;
    }

    try {
      setIsSaving(true);
      await adminAPI.setPanelConfiguration(academicYear, formData);
      setMessage({ type: 'success', text: 'Panel configuration saved successfully!' });
      await fetchConfiguration();
    } catch (error) {
      handleApiError(error, (msg) => setMessage({ type: 'error', text: msg }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePanels = async (e) => {
    e.preventDefault();

    // Check for validation warnings
    if (validationWarnings.length > 0) {
      setMessage({
        type: 'error',
        text: `Cannot generate panels. Fix these issues first:\n${validationWarnings.join('\n')}`
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await adminAPI.generatePanels({
        semester: semester,
        academicYear
      });
      setMessage({
        type: 'success',
        text: `Generated ${result.data.count} panels successfully for Semester ${semester}!`
      });
      // Fetch and display the generated panels
      await fetchPanels();
    } catch (error) {
      handleApiError(error, (msg) => setMessage({ type: 'error', text: msg }));
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchPanels = async () => {
    try {
      const data = await adminAPI.getPanelsBySemester({ 
        semester,
        academicYear
      });
      setPanels(data.data?.panels || []);
    } catch (error) {
      // Panels might not exist yet, that's okay
      setPanels([]);
    }
  };

  const fetchFacultyAvailability = async () => {
    try {
      const data = await adminAPI.checkFacultyAvailability();
      setFacultyAvailability(data.data);
    } catch (error) {
      console.error('Error fetching faculty availability:', error);
      setFacultyAvailability(null);
    }
  };

  const validateConfiguration = () => {
    const warnings = [];
    
    if (!facultyAvailability) {
      return;
    }

    const expectedPanels = Math.ceil(formData.totalProfessors / formData.panelSize);
    const { CSE, ECE, ASH } = formData.departmentDistribution;

    // Check CSE faculty
    const neededCSE = CSE * expectedPanels;
    if (facultyAvailability.CSE < neededCSE) {
      warnings.push(
        `⚠️ CSE: Need ${neededCSE} faculty (${CSE} per panel × ${expectedPanels} panels), but only ${facultyAvailability.CSE} available`
      );
    }

    // Check ECE faculty
    const neededECE = ECE * expectedPanels;
    if (facultyAvailability.ECE < neededECE) {
      warnings.push(
        `⚠️ ECE: Need ${neededECE} faculty (${ECE} per panel × ${expectedPanels} panels), but only ${facultyAvailability.ECE} available`
      );
    }

    // Check ASH faculty
    const neededASH = ASH * expectedPanels;
    if (facultyAvailability.ASH < neededASH) {
      warnings.push(
        `⚠️ ASH: Need ${neededASH} faculty (${ASH} per panel × ${expectedPanels} panels), but only ${facultyAvailability.ASH} available`
      );
    }

    setValidationWarnings(warnings);
  };

  const marksTotal = formData.marksDistribution.conveyer + (formData.marksDistribution.member * (formData.panelSize - 1));
  const expectedPanels = Math.ceil(formData.totalProfessors / formData.panelSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel Management Configuration</h1>
          <p className="text-gray-600 mt-2">Configure evaluation panels for your institution</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">⚙️</div>
            <p className="text-gray-600 mt-2">Loading configuration...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Configuration Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveConfiguration} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Panel Settings</h2>

                {/* Academic Year */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2025-26"
                  />
                </div>

                {/* Semester Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </div>

                {/* Panel Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Panel Size (Members)</label>
                  <input
                    type="number"
                    name="panelSize"
                    value={formData.panelSize}
                    onChange={handleInputChange}
                    min="2"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of faculty members per panel</p>
                </div>

                {/* Department Distribution */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Department Distribution</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['CSE', 'ECE', 'ASH'].map(dept => (
                      <div key={dept}>
                        <label className="text-xs text-gray-600">{dept}</label>
                        <input
                          type="number"
                          name={`departmentDistribution.${dept}`}
                          value={formData.departmentDistribution[dept]}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.panelSize}
                          className="w-full px-3 py-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Members from each department per panel</p>
                </div>

                {/* Student Group Size */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Student Group Size</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600">Min Members</label>
                      <input
                        type="number"
                        name="studentGroupSize.min"
                        value={formData.studentGroupSize.min}
                        onChange={handleInputChange}
                        min="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Max Members</label>
                      <input
                        type="number"
                        name="studentGroupSize.max"
                        value={formData.studentGroupSize.max}
                        onChange={handleInputChange}
                        min="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Marks Distribution */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Marks Distribution (%)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600">Conveyer</label>
                      <input
                        type="number"
                        name="marksDistribution.conveyer"
                        value={formData.marksDistribution.conveyer}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Member (each)</label>
                      <input
                        type="number"
                        name="marksDistribution.member"
                        value={formData.marksDistribution.member}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${marksTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    Total: Conveyer {formData.marksDistribution.conveyer}% + {formData.panelSize - 1} members × {formData.marksDistribution.member}% = {marksTotal}%
                  </p>
                </div>

                {/* Total Professors */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Professors</label>
                  <input
                    type="number"
                    name="totalProfessors"
                    value={formData.totalProfessors}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Checkboxes */}
                <div className="mb-6 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="conveyerRotationEnabled"
                      checked={formData.conveyerRotationEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Enable Conveyer Rotation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="noConveyerRepeatInSemester"
                      checked={formData.noConveyerRepeatInSemester}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Prevent Conveyer Repeat in Same Semester</span>
                  </label>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </form>
            </div>

            {/* Summary Card */}
            <div className="space-y-6">
              {/* Faculty Availability */}
              {facultyAvailability && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Availability</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">CSE:</span>
                      <span className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {facultyAvailability.CSE} faculty
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ECE:</span>
                      <span className="font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        {facultyAvailability.ECE} faculty
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ASH:</span>
                      <span className="font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {facultyAvailability.ASH} faculty
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600 font-semibold">Total:</span>
                      <span className="font-semibold">{facultyAvailability.total} faculty</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">⚠️ Configuration Issues</h4>
                  <ul className="text-xs text-red-800 space-y-1">
                    {validationWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Configuration Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Panel Size:</span>
                    <span className="font-medium">{formData.panelSize} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Panels:</span>
                    <span className="font-medium">{expectedPanels} panels</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Professors:</span>
                    <span className="font-medium">{formData.totalProfessors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marks Total:</span>
                    <span className={`font-medium ${marksTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {marksTotal}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate Panels */}
              <form onSubmit={handleGeneratePanels} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Panels</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create panels for Semester {semester} with the current configuration
                </p>
                <button
                  type="submit"
                  disabled={isGenerating || validationWarnings.length > 0}
                  className={`w-full text-white py-2 rounded-lg font-medium transition ${
                    validationWarnings.length > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:bg-gray-400`}
                >
                  {isGenerating ? 'Generating...' : validationWarnings.length > 0 ? 'Fix Errors First' : 'Generate Panels'}
                </button>
              </form>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Configure panel parameters above</li>
                  <li>Select academic year</li>
                  <li>Click "Generate Panels" to create balanced panels</li>
                  <li>Panels are created with 1/3 from each department</li>
                  <li>Conveyer role rotates to prevent overload</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Generated Panels Section */}
        {panels.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Generated Panels for Semester {semester}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Panel #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Members</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Departments</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Conveyer</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panels.map((panel, idx) => (
                      <tr key={panel._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{panel.panelNumber || idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {panel.members && panel.members.map((member, i) => (
                              <div key={i} className="text-xs">
                                {member.faculty?.fullName || 'Unknown'} 
                                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                  {member.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {panel.members && panel.members.map((member, i) => (
                              <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                {member.department}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {panel.members?.find(m => m.role === 'conveyer')?.faculty?.fullName || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total Panels Generated:</strong> {panels.length} panels for Semester {semester}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {panels.length === 0 && !isLoading && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-center text-gray-600">
              No panels generated yet for Semester {semester}. Configure settings above and click "Generate Panels".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelConfiguration;
