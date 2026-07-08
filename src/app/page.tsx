export default function Home() {
  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <main
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/brazilian-people-celebrating-easter.jpg')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">Parenting Together</h1>

          <div className="hidden gap-8 md:flex">
            <a href="#" className="hover:text-pink-300">
              Home
            </a>
            <a href="#" className="hover:text-pink-300">
              Articles
            </a>
            <a href="#" className="hover:text-pink-300">
              Categories
            </a>
            <a href="#" className="hover:text-pink-300">
              Contact
            </a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-screen items-center px-8 md:px-20">
          <div className="max-w-3xl text-white">
            <span className="rounded-full bg-pink-600/90 px-4 py-2 text-sm font-medium">
              ❤️ Welcome to Parenting Together
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
              Every Parent's Journey Is Unique.
              <br />
              <span className="text-pink-300">We're Here to Help.</span>
            </h1>

            <p className="mt-8 text-lg leading-8 text-gray-200 md:text-2xl">
              Discover trusted parenting advice, practical tips, inspiring
              stories, and helpful resources for every stage of raising a child.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-full bg-pink-600 px-8 py-4 font-semibold transition hover:bg-pink-700">
                Start Your Journey
              </button>

              <button className="rounded-full border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-black">
                Browse Articles
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ================= SECTION TWO ================= */}

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Welcome!
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Parenting is one of life's greatest journeys. Along the way come
            questions, joyful moments, and new challenges. Whether you're
            preparing for your first child, raising toddlers, guiding teenagers,
            or simply looking for trusted parenting advice, you've come to the
            right place.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our goal is to provide practical resources, expert guidance, and a
            supportive community to help you make informed decisions and enjoy
            every stage of parenthood.
          </p>
        </div>
      </section>
    </>
  );
}
