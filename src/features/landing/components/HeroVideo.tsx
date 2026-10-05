"use client";

import { useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./hero-video.module.css";

// A/B 제품 레퍼런스 기반으로 생성한 두 클립을 번갈아 재생
const PLAYLIST = ["/videos/hero-a.mp4", "/videos/hero-b.mp4"];

/** 히어로 시네마틱 배경 — pension-site 선례와 동일 패턴(autoplay/muted + reduced-motion 폴백), 클립 2개 순환 */
export function HeroVideo() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  if (reducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 배경 전체를 덮는 단순 포스터, next/image 불필요
      <img src="/images/hero-poster.jpg" alt="" className={styles.media} aria-hidden />
    );
  }

  function handleEnded() {
    setIndex((i) => (i + 1) % PLAYLIST.length);
  }

  return (
    <video
      key={PLAYLIST[index]}
      className={styles.media}
      src={PLAYLIST[index]}
      poster="/images/hero-poster.jpg"
      autoPlay
      muted
      playsInline
      onEnded={handleEnded}
      aria-hidden
    />
  );
}
