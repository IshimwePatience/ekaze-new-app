import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Employer",
      price: "1,000",
      period: "one-time",
      description: "Lifetime access to find and hire verified workers",
      features: [
        "Search unlimited workers",
        "View worker profiles",
        "Request worker details",
        "OTP verification",
        "Rate & review workers",
        "Incident reporting",
      ],
      cta: "Register Now",
      popular: false,
    },
    {
      name: "Per Worker",
      price: "500",
      period: "per registration",
      description: "Company fee for each worker registered on platform",
      features: [
        "Verified worker profile",
        "NIDA verification",
        "Visible to employers",
        "Rating system",
        "Employment tracking",
        "Digital service card",
      ],
      cta: "Add Worker",
      popular: true,
    },
    {
      name: "Company",
      price: "Custom",
      period: "contact us",
      description: "Full company registration with all features",
      features: [
        "Company profile & logo",
        "Unlimited worker slots",
        "Hiring request inbox",
        "Revenue dashboard",
        "Set subscription fees",
        "Priority support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-4 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display large_text  font-bold text-foreground mb-1">
            Transparent <span className="text-gradient">Pricing</span> for Everyone
          </h2>
          <p className="sub_large_text text-muted-foreground">
            No hidden fees. Pay only for what you need
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-3xl bg-card border-2 transition-all duration-300 hover:shadow-xl animate-fade-in ${plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border/50 hover:border-primary/30"
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold shadow-lg">
                  <Zap className="w-4 h-4" />
                  Most Common
                </div>
              )}

              {/* Plan Name */}
              <div className="flex  items-center justify-start  ">
                <h3 className="font-display text-xl font-bold text-foreground mb-2 ">
                  {plan.name}
                </h3>
              </div>

              {/* Price */}
              <div className="flex  items-center justify-between ">
                <div className="flex">
                  <span className="text-xl  font-bold text-gradient">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-lg text-muted-foreground px-1">RWF</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{plan.period}</p>
              </div>

              {/* Description */}
              {/* <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {plan.description}
              </p> */}

              {/* Features */}
              <ul className="space-y-3 my-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm  text-foreground"
                  >
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm ">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="xl"
                className="w-full "
              >
                <span className="text-sm" >{plan.cta}</span>
              </Button>
            </div>
          ))}
        </div>

      
      </div>
    </section>
  );
};

export default Pricing;
