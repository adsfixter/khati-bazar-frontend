"use client"; 

import React, { useState } from 'react'; // 💡 useState যুক্ত করা হয়েছে
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // 💡 useRouter যুক্ত করা হয়েছে
import { toast } from 'react-toastify'; // 💡 toast যুক্ত করা হয়েছে
import logo from "../../../../../public/img/shared/logo.png";
import { ILoginRequest } from '@/src/types/auth.interface'; // 📂 স্ট্রাকচার অনুযায়ী টাইপ ইমপোর্ট
import { authAPI } from '@/src/api/auth'; // 📂 স্ট্রাকচার অনুযায়ী এপিআই ইমপোর্ট

const Login = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // ফর্ম স্টেট ম্যানেজমেন্ট
    const [formData, setFormData] = useState<ILoginRequest>({
        identity: '',
        password: ''
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

        try {
            // 📂 সেন্ট্রাল লগইন এপিআই সার্ভিস কল
            const response = await authAPI.login(formData);
            
            if (response.success) {
                toast.success('Welcome back! Login successful.'); // 💡 টোস্ট সাকসেস
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                window.dispatchEvent(new Event("userLogin"));
                router.push('/');
            }
        } catch (error: unknown) {
            // 💡 error-কে নিরাপদভাবে টাইপ কাস্টিং করা হলো
            const err = error as { response?: { data?: { message?: string } } };
            const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(msg); // 💡 এরর টোস্ট নোটিফিকেশন
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-4 gap-6">
            
            {/* 1. Logo Outside of the Middle Box */}
            <div className="flex justify-center mb-2">
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
            
            {/* 2. Middle Section Box: 618px x 608px from Figma */}
            <div className="w-full max-w-[618px] min-h-[608px] bg-white border border-[#E9E9E9] rounded-[16px] p-6 sm:p-[40px] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between gap-[32px] box-border">
                
                {/* Headings */}
                <div className="text-center flex flex-col gap-2">
                    <h4 className="text-[28px] sm:text-[32px] font-bold text-[#0E2038] tracking-tight">
                        Welcome Back!
                    </h4>
                    <p className="subtext-large-medium text-[#7F8482]">
                        Sign in to your Khati Bazar account
                    </p>
                </div>
                
                {/* Form Elements Container (handleSubmit যুক্ত করা হয়েছে) */}
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    
                    {/* Phone/Email Input */}
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="subtext-large-medium text-[#0E2038]">
                            Phone Number/email
                        </label>
                        <input 
                            type="text" 
                            name="identity" // 💡 স্টেট ট্র্যাকিং নেম
                            value={formData.identity} // 💡 স্টেট ভ্যালু বাইন্ডিং
                            onChange={handleChange} // 💡 চেঞ্জ হ্যান্ডলার
                            placeholder="Enter you phone/ email" 
                            className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] px-4 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                            required
                        />
                    </div>
                    
                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5 w-full relative">
                        <label className="subtext-large-medium text-[#0E2038]">
                            Password
                        </label>
                        <div className="relative w-full">
                            <input 
                                type="password" 
                                name="password" // 💡 স্টেট ট্র্যাকিং নেম
                                value={formData.password} // 💡 স্টেট ভ্যালু বাইন্ডিং
                                onChange={handleChange} // 💡 চেঞ্জ হ্যান্ডলার
                                placeholder="**********" 
                                className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] pl-4 pr-10 text-[14px] text-[#0E2038] outline-none focus:border-[#37651B] placeholder:text-[#A1A1A1] transition-colors"
                                required
                            />
                            {/* Eye Icon for View Password */}
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Remember me Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer mt-1 self-start select-none">
                        <input 
                            type="checkbox" 
                            defaultChecked
                            className="w-4 h-4 accent-[#37651B] rounded border-[#E9E9E9]"
                        />
                        <span className="subtext-regular text-[#7F8482]">Remember me for 30 days</span>
                    </label>
                    
                    {/* Sign In Button (loading কন্ট্রোলসহ) */}
                    <button 
                        type="submit" 
                        disabled={loading} // 💡 ডাবল রিকোয়েস্ট প্রোটেকশন
                        className="w-full max-w-[538px] h-[46px] pt-[12px] pb-[12px] px-[20px] bg-[#37651B] hover:bg-[#2c5215] disabled:bg-gray-400 text-white body-regular font-bold rounded-[8px] leading-[1.4] tracking-normal flex items-center justify-center gap-[8px] transition-colors mt-2 font-montserrat-alternates"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                
                {/* Divider Line */}
                <div className="w-full flex items-center justify-center text-center my-1 relative">
                    <div className="w-full border-t border-[#E9E9E9]"></div>
                    <span className="bg-white px-3 t/subtext-medium text-[#A1A1A1] absolute">or continue with</span>
                </div>
                
                {/* Google Login Button */}
                <button 
                    type="button" 
                    className="w-full h-[48px] border border-[#E9E9E9] rounded-[8px] flex items-center justify-center gap-2 text-[14px] font-medium text-[#0E2038] hover:bg-gray-50 transition-colors"
                >
                    {/* Google SVG Icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>
                
                {/* Create Account Link */}
                <div className="subtext-large-medium text-[#7F8482] text-center">
            Don't have an account? <a href="/register" className="text-[#37651B] font-semibold hover:underline">Create Account</a>
                </div>
            </div>
        </div>
    );
};

export default Login;