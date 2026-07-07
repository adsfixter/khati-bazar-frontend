"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import logo from "../../../../../public/img/shared/logo.png";
import { IRegisterRequest } from '@/src/types/auth.interface';
import { authAPI } from '@/src/api/auth';

const RegisterPage = () => {
    const router = useRouter(); 
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<IRegisterRequest>({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error('Password and Confirm Password do not match!'); // 💡 টোস্ট এরর
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.register(formData);
            
            if (response.success) {
                toast.success('Account created successfully!'); // 💡 টোস্ট সাকসেস
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                router.push('/');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Registration failed. Try again.';
            toast.error(msg); 
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-4 gap-6 font-montserrat-alternates">
            
            {/* 1. Logo Outside of the Middle Box */}
            <div className="flex justify-center mb-1">
                <Image 
                    src={logo} 
                    alt="Khati Bazar Logo" 
                    width={299} 
                    height={50} 
                    priority
                    className="object-contain"
                    style={{ width: "auto", height: "auto" }}
                />
            </div>

            {/* 2. Main Create Account Box (Figma Spec Maintained) */}
            <div className="w-full max-w-[618px] bg-white border border-[#E9E9E9] rounded-[16px] p-6 sm:p-[40px] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[28px] box-border">
                
                {/* Headings */}
                <div className="text-center flex flex-col gap-1.5">
                    <h4 className="text-[28px] sm:text-[32px] font-bold text-[#0E2038] tracking-tight">
                        Create Account
                    </h4>
                    <p className="subtext-large-medium  text-[#7F8482]">
                        Start shopping fresh today
                    </p>
                </div>

                {/* Form Area */}
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    
                    {/* Row: Full Name & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="subtext-large-medium font-medium text-[#0E2038]">
                                Full Name *
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="Enter your full name" 
                                className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] px-4 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                                required
                            />
                        </div>
                        
                        {/* Phone Number */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="subtext-large-medium font-medium text-[#0E2038]">
                                Phone Number *
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="Enter your number" 
                                className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] px-4 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Email (Optional) */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="subtext-large-medium  font-medium text-[#0E2038]">
                            Email <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email || ''} 
                            onChange={handleChange} 
                            placeholder="Enter your email" 
                            className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] px-4 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="subtext-large-medium font-medium text-[#0E2038]">
                            Password *
                        </label>
                        <div className="relative w-full">
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder="**********" 
                                className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] pl-4 pr-10 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                                required
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="subtext-large-medium font-medium text-[#0E2038]">
                            Confirm Password *
                        </label>
                        <div className="relative w-full">
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                placeholder="**********" 
                                className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] pl-4 pr-10 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                                required
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Terms & Privacy Policy Checkbox */}
                    <label className="flex items-start gap-2 cursor-pointer mt-1 select-none">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-[#37651B] rounded border-[#E9E9E9] mt-0.5"
                            required
                        />
                        <span className="subtext-regular text-[#7F8482] leading-tight">
                            I agree to the <a href="#" className="text-[#37651B] font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-[#37651B] font-semibold hover:underline">Privacy Policy</a>
                        </span>
                    </label>

                    {/* Sign Up / Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-[46px] pt-[12px] pb-[12px] px-[20px] bg-[#37651B] hover:bg-[#2c5215] disabled:bg-gray-400 text-white font-semibold rounded-[8px] body-regular  leading-[1.4] flex items-center justify-center gap-[8px] transition-colors mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {/* Divider */}
                <div className="w-full flex items-center justify-center text-center relative my-0.5">
                    <div className="w-full border-t border-[#E9E9E9]"></div>
                    <span className="bg-white px-3 subtext-medium  text-[#A1A1A1] absolute">or sign up with</span>
                </div>

                {/* Google Button */}
                <button 
                    type="button" 
                    className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] flex items-center justify-center gap-2 text-[14px] font-medium text-[#0E2038] hover:bg-gray-50 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                {/* Already have an account */}
                <div className="subtext-large-medium text-[#7F8482] text-center">
                    Already have an account? <a href="/login" className="text-[#37651B] font-semibold hover:underline">Sign In</a>
                </div>

            </div>
        </div>
    );
};

export default RegisterPage;