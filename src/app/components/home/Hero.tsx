export default function Hero() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/brazilian-people-celebrating-easter.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex min-h-screen items-center px-8 md:px-20">
        {/* Add your Hero content here */}
      </div>
    </main>
  );
}