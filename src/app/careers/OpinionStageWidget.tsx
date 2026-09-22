"use client";

import { useEffect } from "react";

export default function OpinionStageWidget() {
  useEffect(() => {
    const id = "os-widget-jssdk";
    if (document.getElementById(id)) return;
    
    const sjs = document.getElementsByTagName("script")[0];
    const t = Math.floor(new Date().getTime() / 1000000);
    const js = document.createElement("script");
    js.id = id;
    js.async = true;
    js.src = "https://www.opinionstage.com/assets/loader.js?" + t;
    
    if (sjs && sjs.parentNode) {
      sjs.parentNode.insertBefore(js, sjs);
    } else {
      document.body.appendChild(js);
    }
  }, []);

  return (
    <div className="w-full min-h-[500px]">
      <div
        id="os-widget-1598817"
        data-opinionstage-widget="e9926c3a-fd01-4c5b-a1e8-ab11ced2b976"
      ></div>
    </div>
  );
}
