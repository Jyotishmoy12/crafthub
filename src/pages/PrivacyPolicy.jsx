import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, EyeOff, UserCheck } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const PrivacyPolicy=() =>{

  const [expanded, setExpanded] = useState(null);

  const policies = [
    {
      title: "Data Collection",
      icon: <Lock size={24} />, 
      content: "We collect necessary information like name, email, and purchase details to provide a seamless experience."
    },
    {
      title: "Data Security",
      icon: <ShieldCheck size={24} />, 
      content: "Your data is securely stored and encrypted to prevent unauthorized access."
    },
    {
      title: "Third-Party Sharing",
      icon: <EyeOff size={24} />, 
      content: "We do not sell or share your data with third parties except for essential services like payment processing."
    },
    {
      title: "User Rights",
      icon: <UserCheck size={24} />, 
      content: "You have the right to access, update, or delete your data anytime by contacting our support team."
    }
  ];

  return (
    <>
    <Navbar/>
    <div className="max-w-3xl mx-auto py-10 px-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center my-20"
      >
        Privacy Policy
      </motion.h1>
      <p className="text-center text-gray-600 my-4">Your privacy matters to us. Here's how we handle your data:</p>

      <div className="space-y-4">
        {policies.map((policy, index) => (
          <div 
            key={index} 
            className="cursor-pointer border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            onClick={() => setExpanded(expanded === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {policy.icon}
                <h2 className="text-lg font-semibold">{policy.title}</h2>
              </div>
            </div>
            {expanded === index && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }}
                className="text-gray-600 mt-2"
              >
                {policy.content}
              </motion.p>
            )}
          </div>
        ))}
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default PrivacyPolicy