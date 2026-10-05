"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./hero-video.module.css";

/** 히어로 시네마틱 배경 — pension-site 선례와 동일 패턴(autoplay/muted/loop + reduced-motion 폴백) */
export function HeroVideo() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 배경 전체를 덮는 단순 포스터, next/image 불필요
      <img src="/images/hero-poster.jpg" alt="" className={styles.media} aria-hidden />
    );
  }

  return (
    <video
      className={styles.media}
      src="/videos/hero.mp4"
      poster="/images/hero-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    />
  );
}
