import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const pricingPlans = [
  {
    name: "STARTER PLAN",
    tagline: "For Small Businesses & Startups",
    setupCost: "$1,000 Setup +",
    monthlyCost: "$97/month",
    description: "Get started with a sleek, mobile-friendly website designed to capture leads and improve your online presence.",
    features: [
      "3-Page Website",
      "On-Page SEO Optimization",
      "Lead Capture Forms & Chat Widget",
      "Mobile-Friendly Website Design",
      "Mobile App Management",
      "1 Website Edit Per Month"
    ],
    buttonText: "Get Started",
    buttonClass: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
  },
  {
    name: "GROWTH PLAN",
    tagline: "For Scaling Businesses & Entrepreneurs",
    setupCost: "$2,000 Setup +",
    monthlyCost: "$297/month",
    description: "Scale your business with advanced SEO, automation, and lead management tools to maximize conversions.",
    features: [
      "5-Page Website",
      "Everything in Starter, PLUS:",
      "Appointment Booking System",
      "Payment Processing",
      "Automated Google Reviews",
      "3 Website Edits Per Month"
    ],
    buttonText: "Get Started",
    buttonClass: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    popular: true
  },
  {
    name: "ELITE PLAN",
    tagline: "For High-Performing Brands & Enterprises",
    setupCost: "$3,000 Setup +",
    monthlyCost: "$697/month",
    description: "Unlock full automation, premium customization, and enterprise-level solutions for high-growth businesses.",
    features: [
      "10+ Page Website",
      "Everything in Growth, PLUS:",
      "AI Voice Agent",
      "AI Chatbot",
      "Ongoing SEO Management",
      "5 Website Edits Per Month"
    ],
    buttonText: "Get Started",
    buttonClass: "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-600 to-red-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-green-600 to-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center z-10 mb-12"
      >
        <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            You Qualify For A Smart Website!
          </span>
        </h1>
        <p className="text-xl text-gray-300">
          Choose From Our Flexible Pricing Options Below!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl z-10">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`bg-white/10 backdrop-blur-xl border-white/20 h-full relative ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-sm text-gray-300">{plan.tagline}</p>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-white">{plan.setupCost}</p>
                  <p className="text-xl text-gray-300">{plan.monthlyCost}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300 text-center mb-4">
                  {plan.description}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-200">
                      {feature.includes('✓') ? (
                        <span className="text-green-400 flex-shrink-0">{feature}</span>
                      ) : (
                        <>
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full mt-6 ${plan.buttonClass} text-white font-semibold py-6 text-lg`}>
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}