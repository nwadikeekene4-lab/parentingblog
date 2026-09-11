"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    let cancelled = false;

    async function trackVisitor() {
      try {
        const response = await fetch("/api/visitor", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
        });

        if (!response.ok && !cancelled) {
          return;
        }
      } catch {
        /*
         * Analytics must never interfere with the
         * public Stories page.
         */
      }
    }

    trackVisitor();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
      }
