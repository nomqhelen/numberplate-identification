import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Radio,
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Radio className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Next-Generation Transportation Management
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                RFID-Based Electronic
              </span>
              <br />
              Number Plate System
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Revolutionizing vehicle identification and tracking for toll
              collection, law enforcement, and intelligent traffic management
              with cutting-edge RFID technology.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Login / Sign Up
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">System Capabilities</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive features for modern transportation infrastructure
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Clock}
              title="Automated Toll Collection"
              description="Streamline toll operations with instant RFID-based vehicle identification, eliminating queues and reducing revenue leakage."
            />
            <FeatureCard
              icon={Shield}
              title="Law Enforcement Support"
              description="Real-time tracking of stolen vehicles and suspects with automated alerts and comprehensive movement history."
            />
            <FeatureCard
              icon={BarChart3}
              title="Traffic Analytics"
              description="Data-driven insights for traffic flow optimization, road usage patterns, and infrastructure planning."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Vehicle Validation"
              description="Instant registration verification and compliance checking at every checkpoint and toll booth."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Real-Time Reporting"
              description="Generate comprehensive reports and statistics with dynamic dashboards and export capabilities."
            />
            <FeatureCard
              icon={Radio}
              title="RFID Technology"
              description="Reliable passive UHF RFID tags with long read range, minimal maintenance, and high accuracy."
            />
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              End-to-end integration from vehicle to cloud platform
            </p>
          </div>
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-4">
              <ProcessStep
                number="01"
                title="RFID Tags"
                description="Vehicles equipped with unique RFID-enabled number plates"
              />
              <ProcessStep
                number="02"
                title="Readers"
                description="Strategic placement at toll booths, checkpoints, and entry points"
              />
              <ProcessStep
                number="03"
                title="Gateway"
                description="Local controllers transmit data to central cloud platform"
              />
              <ProcessStep
                number="04"
                title="Analytics"
                description="Multi-service platform serving toll, enforcement, and traffic needs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-primary p-8 text-center md:p-12">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Ready to Transform Your Transportation System?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/90">
              Access the dashboard to view real-time statistics, manage vehicles,
              and generate comprehensive reports.
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated">
    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const ProcessStep = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="text-center">
    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground">
      {number}
    </div>
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Home;
