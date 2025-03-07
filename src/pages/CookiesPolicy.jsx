import { useState } from "react";
import { motion } from "framer-motion";
import { Cookie, ShieldCheck, Eye, Settings } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const CookiesPolicy=() =>{
  const [expanded, setExpanded] = useState(null);

  const policies = [
    {
      title: "What Are Cookies?",
      icon: <Cookie size={24} className="text-yellow-500" />, 
      content: "Cookies are small text files stored on your device to improve user experience."
    },
    {
      title: "How We Use Cookies",
      icon: <ShieldCheck size={24} className="text-blue-500" />, 
      content: "We use cookies to enhance site functionality, analyze traffic, and personalize content."
    },
    {
      title: "Your Choices",
      icon: <Eye size={24} className="text-green-500" />, 
      content: "You can control cookie settings through your browser or opt out of tracking cookies."
    },
    {
      title: "Managing Cookies",
      icon: <Settings size={24} className="text-red-500" />, 
      content: "Adjust your preferences in browser settings or use our cookie consent tool."
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
        Cookies Policy
      </motion.h1>
      <p className="text-center text-gray-600 my-4">Learn how we use cookies and how you can control them.</p>

      <div className="space-y-4">
        {policies.map((policy, index) => (
          <div 
            key={index} 
            className="cursor-pointer border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white"
            onClick={() => setExpanded(expanded === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {policy.icon}
                <h2 className="text-lg font-semibold text-gray-800">{policy.title}</h2>
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

export default CookiesPolicy