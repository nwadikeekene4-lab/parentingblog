import Hero from './components/home/Hero';
import Welcome from './components/home/Welcome';
import HelpSection from './components/home/HelpSection'; // Import the new section

export default function Home() {
  return (
    <>
      <Hero />
      <Welcome />
      <HelpSection />
    </>
  );
}