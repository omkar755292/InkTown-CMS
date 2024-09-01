import React, { useState } from 'react';
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader';

const LogIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showMPIN, setShowMPIN] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showCreateMPIN, setShowCreateMPIN] = useState(false);
  const [showConfirmMPIN, setShowConfirmMPIN] = useState(false);
  const [loginDetails, setLoginDetails] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Simulate checking if phone number exists
    const phoneNumberExists = checkPhoneNumberExists(phoneNumber);

    if (phoneNumberExists) {
      setShowMPIN(true); // Show MPIN input
    } else {
      setShowOTP(true); // Show OTP input
    }
  };

  const handleMPINSubmit = (mpin) => {
    // Simulate MPIN validation
    if (mpin === '1234') {
      console.log('Successful login');
    } else {
      console.log('Incorrect MPIN');
    }
  };

  const handleOTPSubmit = (otp) => {
    // Simulate OTP validation
    if (otp === '123456') {
      setShowCreateMPIN(true); // Show create MPIN form
    } else {
      console.log('Incorrect OTP');
    }
  };

  const handleCreateMPINSubmit = (newMPIN, confirmMPIN) => {
    // Simulate MPIN creation and confirmation
    if (newMPIN === confirmMPIN) {
      const details = { phoneNumber, newMPIN };
      setLoginDetails(details);
      console.log('Login Details:', details);
    } else {
      console.log('MPIN mismatch');
    }
  };

  const checkPhoneNumberExists = (phoneNumber) => {
    // Simulate checking if phone number exists
    return phoneNumber === '1234567890'; // Change to your actual check logic
  };

  return (
    <div>
      <PageHeader currentpage='Form Elements' activepage='Forms' mainpage='Form Elements' />

      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-6'>
          <div className='box'>
            <div className='box-header'>
              <h5 className='box-title'>Login Form</h5>
            </div>
            <div className='box-body'>
              <form onSubmit={handleFormSubmit}>
                <label htmlFor='phone' className='ti-form-label'>
                  Phone Number
                </label>
                <input
                  type='tel'
                  id='phone'
                  className='ti-form-input'
                  placeholder='(123) 456-7890'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  aria-describedby='phone-helper-text'
                />
                <p className='text-sm text-gray-500 mt-2 dark:text-white/70' id='phone-helper-text'>
                  We'll never share your phone number.
                </p>

                <button
                  type='submit'
                  className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'
                >
                  Submit
                </button>

                {showMPIN && (
                  <div>
                    <label htmlFor='mpin' className='ti-form-label'>
                      Enter MPIN
                    </label>
                    <input type='password' id='mpin' className='ti-form-input' />
                    <button
                      onClick={() => handleMPINSubmit('1234')}
                      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'
                    >
                      Submit MPIN
                    </button>
                  </div>
                )}

                {showOTP && (
                  <div>
                    <label htmlFor='otp' className='ti-form-label'>
                      Enter OTP
                    </label>
                    <input type='text' id='otp' className='ti-form-input' />
                    <button
                      onClick={() => handleOTPSubmit('123456')}
                      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'
                    >
                      Submit OTP
                    </button>
                  </div>
                )}

                {showCreateMPIN && (
                  <div>
                    <label htmlFor='newMPIN' className='ti-form-label'>
                      Create New MPIN
                    </label>
                    <input type='password' id='newMPIN' className='ti-form-input' />
                    <label htmlFor='confirmMPIN' className='ti-form-label'>
                      Confirm New MPIN
                    </label>
                    <input type='password' id='confirmMPIN' className='ti-form-input' />
                    <button
                      onClick={() => handleCreateMPINSubmit('1234', '1234')} // Simulated MPIN submission
                      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'
                    >
                      Submit New MPIN
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
