import { ComponentType } from "react";

import Landing from "@/pages/Landing";
import Pocketbook from "@/pages/Pocketbook";
import Product from "@/pages/Product";
import StinglessBee from "@/pages/StinglessBee";
import StinglessBeeHoney from "@/pages/StinglessBeeHoney";
import Training from "@/pages/Training";
import Contact from "@/pages/Contact";

export type PublicRouteConfig = {
  label: string;
  path: string;
  component: ComponentType;
};

export const publicRoutes: PublicRouteConfig[] = [
  { label: "หน้าแรก", path: "/", component: Landing },
  { label: "ชันโรงขนเงิน", path: "/stingless-bee", component: StinglessBee },
  { label: "น้ำผึ้งชันโรง", path: "/stingless-bee-honey", component: StinglessBeeHoney },
  { label: "สินค้า", path: "/product", component: Product },
  { label: "อบรม", path: "/training", component: Training },
  { label: "สมุดพกชันโรง", path: "/pocketbook", component: Pocketbook },
  { label: "ติดต่อเรา", path: "/contact", component: Contact },
];

export const publicNavItems = publicRoutes.map(({ label, path }) => ({
  label,
  path,
}));
