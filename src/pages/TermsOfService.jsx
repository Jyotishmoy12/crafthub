import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Users, CheckCircle } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const TermsOfService=()=> {
  const [expanded, setExpanded] = useState(null);

  const terms = [
    {
      title: "Acceptance of Terms",
      icon: <FileText size={24} className="text-blue-500" />, 
      content: "By using our services, you agree to comply with and be bound by these terms."
    },
    {
      title: "User Responsibilities",
      icon: <Users size={24} className="text-green-500" />, 
      content: "Users must provide accurate information and refrain from any unlawful activities."
    },
    {
      title: "Privacy & Security",
      icon: <Shield size={24} className="text-red-500" />, 
      content: "We take your privacy seriously and ensure secure handling of your data."
    },
    {
      title: "Modifications & Updates",
      icon: <CheckCircle size={24} className="text-yellow-500" />, 
      content: "We reserve the right to update these terms at any time, with notifications provided."
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
        className="text-3xl font-bold text-center text-indigo-600 my-20"
      >
        Terms of Service
      </motion.h1>
      <p className="text-center text-gray-600 my-4">Please read our terms carefully before using our services.</p>

      <div className="space-y-4">
        {terms.map((term, index) => (
          <div 
            key={index} 
            className="cursor-pointer border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white"
            onClick={() => setExpanded(expanded === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {term.icon}
                <h2 className="text-lg font-semibold text-gray-800">{term.title}</h2>
              </div>
            </div>
            {expanded === index && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }}
                className="text-gray-600 mt-2"
              >
                {term.content}
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

export default TermsOfService