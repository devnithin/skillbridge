import { useLocation } from 'wouter';
import { ArrowRight, Users, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [_, setLocation] = useLocation();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="transform -rotate-12">
            <span className="text-2xl font-bold">✈</span>
          </div>
          <span className="text-xl font-bold cursor-pointer" onClick={() => setLocation('/')}>
            SkillBridge
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setLocation('/auth')} 
            className="text-gray-600 hover:text-gray-900 px-4 py-2"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Content */}
          <motion.div 
            className="md:w-1/2 mb-12 md:mb-0"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-blue-600 font-semibold flex items-center">
                <Sparkles size={20} className="mr-2" />
                Learn, Share, Grow Together
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">
              Welcome to{' '}
              <span className="font-black block mt-2 text-5xl md:text-7xl" style={{ fontFamily: 'serif' }}>
                SkillBridge!
              </span>
            </h1>
            
            <p className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed">
              SkillBridge is a peer-to-peer skill-sharing platform where individuals can connect, learn, and grow together
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setLocation('/auth')}
                className="group bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setLocation('/auth')}
                className="group border-2 border-black px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center"
              >
                Join Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-md">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-50 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold">10K+</h3>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-50 rounded-full">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold">500+</h3>
                <p className="text-sm text-gray-500">Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-50 rounded-full">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold">95%</h3>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            className="md:w-1/2 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl transform rotate-2 opacity-10"></div>
              <img 
                src="https://i.imgur.com/XbwZ61D.jpg"
                alt="Learning together"
                className="rounded-2xl w-full max-w-md mx-auto shadow-xl transform hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            
            {/* Floating badges */}
            <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-xl shadow-lg transform -rotate-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Live Learning</span>
              </div>
            </div>
            
            <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-xl shadow-lg transform rotate-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium">Expert Mentors</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;