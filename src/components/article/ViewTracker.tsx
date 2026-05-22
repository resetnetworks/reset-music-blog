"use client";

import { useEffect } from "react";
import { incrementViewCount } from "./actions";

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    incrementViewCount(id).catch(console.error);
  }, [id]);

  return null;
}
