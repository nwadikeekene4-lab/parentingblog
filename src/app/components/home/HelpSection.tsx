import Card from '../ui/Card';

export default function HelpSection() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center mb-8">How can we help you today?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Find Advice" text="Explore articles on child development and wellness." action="Browse Topics" />
        <Card title="Share Your Story" text="Join our community and help other parents." action="Post Now" />
        <Card title="Expert Q&A" text="Ask questions and get answers from specialists." action="Ask a Question" />
      </div>
    </section>
  );
}