"use client";

import { useEffect, useState } from "react";

export default function DashboardWelcome() {

  const [greeting, setGreeting] =
    useState("Welcome");


  useEffect(() => {

    const hour =
      new Date().getHours();


    if (hour >= 5 && hour < 12) {

      setGreeting("Good Morning");

    } else if (
      hour >= 12 &&
      hour < 17
    ) {

      setGreeting("Good Afternoon");

    } else {

      setGreeting("Good Evening");

    }

  }, []);


  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <h1 className="text-2xl font-bold text-gray-900">
        {greeting} 👋
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
        Welcome back! Manage your parenting stories, keep track of your
        published articles, drafts, bookmarks and profile all from one place.
      </p>

    </section>
  );
}
