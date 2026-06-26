export default function Home() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/images/brazilian-people-celebrating-easter.jpg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="max-w-4xl text-center text-white">
          <h1 className="mb-6 text-5xl font-extrabold md:text-7xl">
            Welcome to Parenting Together
          </h1>

          <p className="mb-10 text-xl md:text-2xl">
            Practical advice, trusted guidance, and support for every stage of
            your parenting journey.
          </p>

          <button className="rounded-full bg-pink-600 px-8 py-4 text-lg font-semibold hover:bg-pink-700 transition">
            Let's Get Started
          </button>
        </div>
      </div>
    </main>
  );
}