import React, { useState } from 'react';
import { Check, UploadCloud } from 'react-feather'; // Updated import
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dropzone from 'react-dropzone';

const AddExecutive = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    phoneNumber: '',
    dob: null,
    email: '',
    password: '',
    confirmPassword: '',
    duties: '',
    address: '',
    zipCode: '',
    files: []
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dob: date }));
  };

  const handleDrop = (acceptedFiles) => {
    setFormData(prev => ({ ...prev, files: acceptedFiles }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.duties) newErrors.duties = 'Duties are required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Handle final form submission
    console.log('Form submitted:', formData);
    alert('Executive added successfully!');
    // Reset form and go to step 1
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      phoneNumber: '',
      dob: null,
      email: '',
      password: '',
      confirmPassword: '',
      duties: '',
      address: '',
      zipCode: '',
      files: []
    });
    setStep(1);
  };

  const renderStepIndicator = () => {
    return (
      <div className="wizard-step-container mb-8">
        <ul className="flex justify-between">
          {[1, 2, 3].map((stepNum) => (
            <li 
              key={stepNum} 
              className={`flex-1 step-container ${step >= stepNum ? 'active' : ''}`}
            >
              <div className="flex items-center p-3">
                <div className={`step-icon flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <Check size={16} /> : <span>{stepNum}</span>}
                </div>
                <div className="ml-4">
                  <h5 className="font-medium text-gray-800">
                    {stepNum === 1 && 'Get started'}
                    {stepNum === 2 && 'Login details'}
                    {stepNum === 3 && 'Upload files'}
                  </h5>
                  <h6 className="text-sm text-gray-500">
                    {stepNum === 1 && 'Account information'}
                    {stepNum === 2 && 'Set executive email'}
                    {stepNum === 3 && 'Successfully submitted'}
                  </h6>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="page-titles mb-6">
        <ol className="flex text-sm">
          <li className="breadcrumb-item text-blue-600">
            <a href="#">Executive</a>
          </li>
          <li className="breadcrumb-item mx-2 text-gray-500">/</li>
          <li className="breadcrumb-item text-blue-600 font-medium">
            <a href="#">Add Executive</a>
          </li>
        </ol>
      </div>

      <div className="card bg-white rounded-lg shadow-md overflow-hidden">
        <div className="card-header bg-gray-50 px-6 py-4 border-b">
          <h4 className="card-title text-xl font-bold text-gray-800">Add Executive</h4>
        </div>
        
        <div className="card-body p-6">
          {renderStepIndicator()}
          
          <div className="wizard-form-details">
            {/* Step 1 */}
            {step === 1 && (
              <div className="wizard-step-1">
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Dhruv"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Rathee"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Company Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+91 9012345678"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Date of birth
                    </label>
                    <DatePicker
                      selected={formData.dob}
                      onChange={handleDateChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.dob ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholderText="Select date"
                      dateFormat="dd/MM/yyyy"
                    />
                    {errors.dob && (
                      <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
                    )}
                  </div>
                  
                  <div className="text-right col-span-full mt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
                    >
                      Next <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Step 2 */}
            {step === 2 && (
              <div className="wizard-step-2">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Executive valid email.."
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Choose a safe one.."
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password.."
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Executive Duties
                    </label>
                    <textarea
                      name="duties"
                      value={formData.duties}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Executive duties in detailed"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.duties ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    ></textarea>
                    {errors.duties && (
                      <p className="mt-1 text-sm text-red-500">{errors.duties}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Executive Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter Executive Address"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 required">
                      Zip code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="Enter pin code"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between col-span-full mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm flex items-center"
                    >
                      <i className="fas fa-arrow-left mr-2"></i> Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                    >
                      Next <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Step 3 */}
            {step === 3 && (
              <div className="wizard-step-3">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 required">
                    Media
                  </label>
                  <Dropzone onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()} className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center">
                          <UploadCloud className="text-gray-400 mb-3" size={36} /> {/* Updated icon */}
                          <h6 className="text-gray-600 mb-1">
                            Drop files here or click to upload
                          </h6>
                          <p className="text-sm text-gray-500">
                            Supports: JPG, PNG, PDF (max 10MB each)
                          </p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                  
                  {formData.files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Selected files:
                      </h4>
                      <ul className="list-disc pl-5">
                        {formData.files.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExecutive;