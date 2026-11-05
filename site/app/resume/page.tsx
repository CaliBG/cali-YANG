import type { Metadata } from "next";
import Profile from "./Profile";

export const metadata: Metadata = {
  title: "杨子硕 Zishuo Yang · 个人简历 | YZS",
  description: "杨子硕的教育背景、设计实践与代表项目。Zishuo Yang’s design profile and selected projects.",
};

export default function ResumePage() {
  return <Profile />;
}
