import { Building2, Users, Briefcase, Shield, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserRoles = () => {
  const roles = [
    {
      id: "company",
      icon: Building2,
      title: "For Companies",
      subtitle: "Staffing agencies & worker providers",
      description:
        "Register and manage your workforce. Get hired through our marketplace. Track assignments and earnings.",
      features: [
        "Register unlimited workers",
        "Receive hiring requests",
        "Set subscription fees",
        "Track worker performance",
        "Revenue analytics dashboard",
      ],
      cta: "Register Company",
      color: "primary",
      popular: false,
    },
    {
      id: "worker",
      icon: Users,
      title: "For Workers",
      subtitle: "Maids, housekeepers & domestic staff",
      description:
        "Create your verified profile. Get discovered by employers. Build your reputation with ratings.",
      features: [
        "Verified NIDA profile",
        "Set work preferences",
        "Receive job notifications",
        "Build rating history",
        "Digital service card",
      ],
      cta: "Create Profile",
      color: "secondary",
      popular: true,
    },
    {
      id: "employer",
      icon: Briefcase,
      title: "For Employers",
      subtitle: "Households seeking domestic help",
      description:
        "Find verified workers. Secure handover process. Peace of mind with background checks.",
      features: [
        "Search by any criteria",
        "View verified profiles",
        "OTP identity verification",
        "Rate & review workers",
        "Incident reporting",
      ],
      cta: "Find Workers",
      color: "accent",
      popular: false,
    },
    {
      id: "police",
      icon: Shield,
      title: "For Authorities",
      subtitle: "Law enforcement & security",
      description:
        "Monitor incidents. Access worker backgrounds. Track cases and patterns across the platform.",
      features: [
        "Incident dashboard",
        "Worker background checks",
        "Case management",
        "Pattern analysis",
        "Export reports",
      ],
      cta: "Access Portal",
      color: "foreground",
      popular: false,
    },
  ];

  const getColorClasses = (color: string, type: "bg" | "border" | "text") => {
    const colors: Record<string, Record<string, string>> = {
      primary: {
        bg: "bg-primary",
        border: "border-primary/30 hover:border-primary",
        text: "text-primary",
      },
      secondary: {
        bg: "bg-secondary",
        border: "border-secondary/30 hover:border-secondary",
        text: "text-secondary",
      },
      accent: {
        bg: "bg-accent",
        border: "border-accent/30 hover:border-accent",
        text: "text-accent",
      },
      foreground: {
        bg: "bg-foreground",
        border: "border-foreground/30 hover:border-foreground",
        text: "text-foreground",
      },
    };
    return colors[color]?.[type] || colors.primary[type];
  };

  return (
    <section id="roles" className="py-10 border-t-2 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            User Roles
          </span>
          <h2 className="font-display large_text   font-bold text-foreground mb-1">
            Built for <span className="text-gradient">Everyone</span> in the Ecosystem
          </h2>
          <p className="sub_large_text text-muted-foreground">
            Tailored dashboards and features for each user type
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className={`relative p-6 rounded-2xl bg-card border-2 ${getColorClasses(
                role.color,
                "border"
              )} transition-all duration-300 hover:shadow-xl animate-fade-in group`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {role.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-accent text-accent-foreground text-xs font-bold shadow-md">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-xl ${getColorClasses(
                  role.color,
                  "bg"
                )} flex items-center justify-center mb-4`}
              >
                <role.icon className="w-4 h-4 text-white" />
              </div>

              {/* Title */}
             <div className=" flex  flex-col justify-between items-start">
               <h3 className="font-display text-md font-bold text-foreground ">
                {role.title}
              </h3>
              <p className={`text-sm ${getColorClasses(role.color, "text")} mb-3`}>
                {role.subtitle}
              </p>
             </div>

              {/* Description */}
              {/* <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {role.description}
              </p> */}

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {role.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className={`w-4 h-4 mt-0.5 ${getColorClasses(role.color, "text")}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={role.popular ? "hero" : "outline"}
                className="w-full group/btn"
              >
                {role.cta}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserRoles;
