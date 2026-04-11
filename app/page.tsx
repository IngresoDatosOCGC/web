"use client";

import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/shared/StatsBar';
import AboutSection from '@/components/home/AboutSection';
import GroupsGrid from '@/components/home/GroupsGrid';
import NewsletterSection from '@/components/home/NewsletterSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <AboutSection />
      <GroupsGrid />
      <NewsletterSection />
    </>
  );
}
