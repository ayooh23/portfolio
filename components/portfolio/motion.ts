import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

type PortfolioEaseTokens = {
  overlaySettle: string;
  matchCutOut: string;
  matchCutInOut: string;
  softFade: string;
  detailStagger: string;
};

export const portfolioEase: PortfolioEaseTokens = {
  overlaySettle: "portfolioOverlaySettle",
  matchCutOut: "portfolioMatchCutOut",
  matchCutInOut: "portfolioMatchCutInOut",
  softFade: "portfolioSoftFade",
  detailStagger: "expo.out",
};

let motionReady = false;

export function ensurePortfolioMotion() {
  if (motionReady) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(portfolioEase.overlaySettle, "M0,0 C0.11,0.86 0.23,1 1,1");
  CustomEase.create(portfolioEase.matchCutOut, "M0,0 C0.22,0.82 0.26,1 1,1");
  CustomEase.create(portfolioEase.matchCutInOut, "M0,0 C0.68,0 0.2,1 1,1");
  CustomEase.create(portfolioEase.softFade, "M0,0 C0.28,0 0.22,1 1,1");
  motionReady = true;
}
