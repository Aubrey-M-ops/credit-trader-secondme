import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed", // no /en
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
