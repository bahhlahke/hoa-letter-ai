"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function PricingTracker() {
  useEffect(() => { track("view_pricing"); }, []);
  return null;
}
