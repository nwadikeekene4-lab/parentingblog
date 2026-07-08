export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 z-50 w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

        {/* Logo */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Parenting Together
          </h1>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 text-white md:flex">
          <li>
            <a href="/" className="transition hover:text-pink-300">
              Home
            </a>
          </li>

          <li>
            <a href="/articles" className="transition hover:text-pink-300">
              Articles
            </a>
          </li>

          <li>
            <a href="/categories" className="transition hover:text-pink-300">
              Categories
            </a>
          </li>

          <li>
            <a href="/about" className="transition hover:text-pink-300">
              About
            </a>
          </li>

          <li>
            <a href="/contact" className="transition hover:text-pink-300">
              Contact
            </a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="text-3xl text-white md:hidden"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

      </nav>
    </header>
  );
}