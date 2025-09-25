'use client'
import React, { useState } from 'react'
import LoginHeader from '@/components/AdminComponents/LoginHeader';
import Image from 'next/image'
import BackToLoginButton from '@/components/ui/BackToLoginButton';
import AnimatedInput from '@/components/ui/AnimatedInput';
import { LockIcon } from '@/components/ui/CustomInput';

const SetNewPassword: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        username: ''
    });
    const [resetSuccess, setResetSuccess] = useState(false);

    const isValidPassword = (password: string) => password.length >= 8;
    const passwordsMatch = (confirmPassword: string) => confirmPassword === formData.password;

    const canSubmit =
        isValidPassword(formData.password) &&
        passwordsMatch(formData.confirmPassword) &&
        formData.password.length > 0 &&
        formData.confirmPassword.length > 0;

    return (
        <div className="min-h-screen relative px-5 md:px-8">
            <div className='max-w-[1440px] w-full mx-auto relative z-30 mb-10 md:mb-20'>
                <LoginHeader />

                {!resetSuccess ? (
                    <div className='mt-14 md:mt-20 max-w-[398px] mx-auto h-full w-full text-center pb-20'>
                        <div className='mb-6 flex items-center justify-center'>
                            <Image src='/assets/set-new-password.svg' alt='set-new-password' width={100} height={100} className='md:w-[100px] w-[80px]' />
                        </div>

                        <h1 className='text-[#111111] text-[32px] leading-[29px] sm:leading-[38px] font-bold mb-2.5'>Set new password</h1>
                        <p className='text-[#585858] text-[14px] sm:text-[16px] leading-[22px] font-normal'>Your new password must be different to previously used passowrds.</p>
                        <div className='mt-8 space-y-6'>

                            <AnimatedInput
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(value) => setFormData({ ...formData, password: value })}
                                icon={<LockIcon />}
                                validation={isValidPassword}
                                error="Password must be at least 8 characters long"
                                showPasswordToggle={true}
                                required
                            />

                            <AnimatedInput
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                                icon={<LockIcon />}
                                validation={passwordsMatch}
                                error="Passwords do not match"
                                showPasswordToggle={true}
                                required
                            />

                            <button
                                disabled={!canSubmit}
                                className={`w-full h-[46px] rounded-md relative text-[#20523C] text-base font-semibold leading-[22px] transition-opacity duration-200 ${!canSubmit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                    background: 'radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    boxShadow: '0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset'
                                }}
                                onClick={() => setResetSuccess(true)}
                            >
                                Reset Password
                            </button>

                            <BackToLoginButton />
                        </div>
                    </div>
                ) : (
                    <div className='md:mt-20 max-w-[398px] flex items-center justify-center flex-col min-h-screen md:min-h-fit mx-auto w-full text-center pb-20'>
                        <div className='mb-6 flex items-center justify-center'>
                            <Image src='/assets/password-reset.svg' alt='password-reset' width={100} height={100} className='md:w-[100px] w-[80px]' />
                        </div>
                        <h2 className='text-[#111111] text-[32px] leading-[29px] sm:leading-[38px] font-bold mb-2.5'>Password reset</h2>
                        <p className='text-[#585858] text-[14px] sm:text-[16px] leading-[22px] font-normal mb-6'>Your password has been successfully reset. Click below to login magicaly.</p>
                        <button
                            className="w-full h-[46px] rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px] transition-opacity duration-200 cursor-pointer"
                            style={{
                                background: 'radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                boxShadow: '0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset'
                            }}
                            onClick={() => window.location.href = '/admin'}
                        >
                            Continue to Login
                        </button>
                    </div>
                )}
            </div>

            <div className="fixed -bottom-10 left-0 w-full z-0 pointer-events-none">
                <img src='/assets/admin-login.svg' alt='admin' className='w-full h-auto object-cover md:block hidden' />
                <img src='/assets/mobile.svg' alt='admin' className='w-full h-auto object-cover md:hidden block' />
            </div>
        </div>
    )
}

export default SetNewPassword