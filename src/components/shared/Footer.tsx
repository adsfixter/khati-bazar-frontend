"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/src/api/axiosInstance";

// লোকাল ফলব্যাক ইমেজেস (যদি এপিআই তে সোশ্যাল আইকন না থাকে)
import logoFallback from "../../../public/img/shared/logo.png";
import fb from "../../../public/img/shared/fb.png";
import x from "../../../public/img/shared/x.png";
import ins from "../../../public/img/shared/inst.png";
import yt from "../../../public/img/shared/yt.png";

const Footer = () => {
  // 🎯 সেটিংসের জন্য স্টেট ডিক্লেয়ারেশন (ডিফল্ট ফলব্যাক ভ্যালু সহ)
  const [settings, setSettings] = useState({
    logo: "",
    email: "info@khatibazar.com",
    phone: "01700000000",
    address: "Dhaka, Bangladesh",
    aboutUs: "Your trusted online grocery store delivering fresh products daily.",
    facebookUrl: "#",
    instagramUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#", // চাইলে এক্স (টুইটার) এর জায়গায় ব্যবহার করতে পারেন
  });

  // 🎯 এপিআই থেকে শপ সেটিংস ডাটা ফেচ করা
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await axiosInstance.get("/shop-settings");
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setSettings((prev) => ({
            ...prev,
            logo: data.logo || prev.logo,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            aboutUs: data.aboutUs || prev.aboutUs,
            facebookUrl: data.facebookUrl || prev.facebookUrl,
            instagramUrl: data.instagramUrl || prev.instagramUrl,
            youtubeUrl: data.youtubeUrl || prev.youtubeUrl,
            linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
          }));
        }
      } catch (err) {
        console.error("Error fetching footer shop settings:", err);
      }
    };
    fetchFooterSettings();
  }, []);

  return (
    <footer className="bg-[#0E2038] text-gray-400 py-12 px-6 md:px-16 font-montserrat">
      {/* Upper Main Footer Grid */}
 {/* Upper Main Footer Grid */}
<div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-8">

  {/* Left Section: Logo, Description & Socials */}
  <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <div className="relative h-[50px] w-[180px]">
        <Image
          src={settings.logo || logoFallback}
          alt="Khati Bazar Logo"
          fill
          sizes="180px"
          priority
          className="object-contain"
          unoptimized={Boolean(settings.logo)}
        />
      </div>
    </div>

    <p className="subtext-large-regular max-w-[240px] text-[#7F8482]">
      {settings.aboutUs}
    </p>

    <div className="flex items-center gap-3 mt-2">
      <Link
        href={settings.facebookUrl}
        target="_blank"
        className="hover:opacity-80 transition-opacity"
      >
        <Image src={fb} alt="Facebook" width={24} height={24} />
      </Link>

      <Link
        href={settings.linkedinUrl}
        target="_blank"
        className="hover:opacity-80 transition-opacity"
      >
        <Image src={x} alt="X / LinkedIn" width={24} height={24} />
      </Link>

      <Link
        href={settings.instagramUrl}
        target="_blank"
        className="hover:opacity-80 transition-opacity"
      >
        <Image src={ins} alt="Instagram" width={24} height={24} />
      </Link>

      <Link
        href={settings.youtubeUrl}
        target="_blank"
        className="hover:opacity-80 transition-opacity"
      >
        <Image src={yt} alt="YouTube" width={24} height={24} />
      </Link>
    </div>
  </div>

  {/* Company */}
  <div className="flex flex-col gap-3">
    <h4 className="title-medium text-[#E9E9E9] mb-1">Company</h4>

    <ul className="flex flex-col gap-3 body-regular">
      <li>
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
      </li>

      <li>
        <Link href="/shopnow" className="hover:text-white transition-colors">
          Shop
        </Link>
      </li>

      <li>
        <Link href="/offers" className="hover:text-white transition-colors">
          Offers
        </Link>
      </li>

      <li>
        <Link href="/blog" className="hover:text-white transition-colors">
          Blog
        </Link>
      </li>
    </ul>
  </div>

  {/* Customer */}
  <div className="flex flex-col gap-3">
    <h4 className="title-medium text-[#E9E9E9] mb-1">Customer</h4>

    <ul className="flex flex-col gap-3 body-regular">
      <li>
        <Link href="/dashboard" className="hover:text-white transition-colors">
          My Account
        </Link>
      </li>

      <li>
        <Link
          href="/track-order"
          className="hover:text-white transition-colors"
        >
          Order Tracking
        </Link>
      </li>

      <li>
        <Link
          href="/privacy-policy"
          className="hover:text-white transition-colors"
        >
          Privacy Policy
        </Link>
      </li>

      <li>
        <Link
          href="/terms-conditions"
          className="hover:text-white transition-colors"
        >
          Terms & Conditions
        </Link>
      </li>
    </ul>
  </div>

  {/* Contact */}
  <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
    <h4 className="title-medium text-[#E9E9E9] mb-1">Contact</h4>

    <ul className="flex flex-col gap-3 body-regular">
      <li className="text-gray-400">
        Phone:{" "}
        <a
          href={`tel:${settings.phone}`}
          className="hover:text-white transition-colors"
        >
          {settings.phone}
        </a>
      </li>

      <li className="text-gray-400">
        Email:{" "}
        <a
          href={`mailto:${settings.email}`}
          className="hover:text-white transition-colors"
        >
          {settings.email}
        </a>
      </li>

      <li className="text-gray-400">
        Address: {settings.address}
      </li>
    </ul>
  </div>
</div>

      {/* Thin Horizontal Divider Border line */}
      <hr className="border-[#374151] max-w-7xl mx-auto" />

      {/* Bottom Copyright & Branding Area */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-6 text-[#7F8482] subtext-large-regular gap-4">
        <div>
          © 2026 Khati Bazar. All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Powered by :</span>
          <span className="body-medium text-[#7F8482] hover:text-white transition-colors cursor-pointer">
            AdsFixter
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;