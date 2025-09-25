import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import DeleteAccountModal from './DeleteAccountModal';
import SuccessModal from './SuccessModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GradientButton from '../ui/GradientButton';
import { changePassword } from '@/services/api';

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccessSecurity = () => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [errors, setErrors] = useState<Partial<PasswordData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validatePasswords = (): boolean => {
    const newErrors: Partial<PasswordData> = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSavePassword = async () => {
    if (validatePasswords()) {
      setIsSaving(true);
      try {
        const response = await changePassword(passwordData);
        
        if (response.success) {
          setShowSuccessModal(true);
          setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setIsDirty(false);
        } else {
          toast.error(response.message || 'Failed to change password');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        toast.error('An unexpected error occurred. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteAccount = () => {
    console.log('Account deleted with reason:', deleteReason);
    setShowDeleteModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex items-start sm:flex-row flex-col gap-6 justify-between mb-6 sm:mb-[30px]">
        <div>
          <h3 className="text-[16px] leading-[24px] font-semibold mb-1">
            Email
          </h3>
          <p className="sm:max-w-[291px] text-[#424242] text-[14px] leading-[21px] font-normal">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium
          </p>
        </div>
        <div className="sm:max-w-[388px] w-full relative bg-white border border-[#DEDEDE] rounded-lg px-4 h-[56px] opacity-60 select-none">
          <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111] flex items-center gap-1">
            Your Email
          </label>
          <div className="flex items-center">
            <input
              type="email"
              readOnly
              defaultValue="AtlasExchange@gmail.com"
              className="flex-1 bg-transparent py-[18px] border-0 smaller outline-none text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal"
            />
            <svg
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.16406 9.98002L8.04838 13.8643L15.8307 6.0957"
                stroke="#2DB245"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#DEDEDE] h-[1px] mb-6"></div>

      <div className="flex items-start sm:flex-row flex-col gap-6 justify-between">
        <div>
          <h3 className="text-[16px] leading-[24px] font-semibold mb-1">
            Change your Password{" "}
          </h3>
          <p className="sm:max-w-[291px] text-[#424242] text-[14px] leading-[21px] font-normal">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium.
          </p>
        </div>
        <div className="sm:max-w-[388px] w-full space-y-8">
          <PasswordInput
            label="Old Password"
            value={passwordData.oldPassword}
            onChange={(value) => handlePasswordChange("oldPassword", value)}
            error={errors.oldPassword}
          />

          <PasswordInput
            label="New Password"
            value={passwordData.newPassword}
            onChange={(value) => handlePasswordChange("newPassword", value)}
            error={errors.newPassword}
            showToggle={true}
          />

          <PasswordInput
            label="Re-type New Password"
            value={passwordData.confirmPassword}
            onChange={(value) =>
              handlePasswordChange("confirmPassword", value)
            }
            error={errors.confirmPassword}
          />
        </div>
      </div>

      <div className="w-full bg-[#DEDEDE] h-[1px] mt-6 sm:mt-8 mb-6"></div>

      <div className="w-full flex items-end justify-end mb-8">
        <GradientButton onClick={handleSavePassword} disabled={!isDirty}>{isSaving ? 'Saving...' : 'Save Update'}</GradientButton>
      </div>

      <div className="w-full sm:bg-[#DEDEDE] bg-transparent h-[1px] mt-6 sm:mt-8 mb-4 sm:mb-6"></div>

      <div className="flex items-start sm:flex-row flex-col gap-6 justify-between mb-6 sm:mb-[30px]">
        <div>
          <h3 className="text-[16px] leading-[24px] font-semibold mb-1">
            Delete Account
          </h3>
          <p className="sm:max-w-[291px] text-[#424242] text-[14px] leading-[21px] font-normal">
            Deleting your account will remove all of your information from
            our database. This cannot be Undone
          </p>
        </div>
        <button
          onClick={() => {
            console.log('Delete button clicked');
            setShowDeleteModal(true);
          }}
          className="bg-[#D03739] border border-[#FFFFFF66] h-[46px] w-[168px] rounded-md text-[16px] leading-[22px] font-semibold text-white cursor-pointer"
        >
          Delete Account
        </button>
      </div>
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        deleteReason={deleteReason}
        setDeleteReason={setDeleteReason}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
      />
    </div>
  );
};

export default AccessSecurity;