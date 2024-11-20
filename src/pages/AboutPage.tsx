import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Gauge, BrainCircuit, Search } from 'lucide-react';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <Globe className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Domain Value Estimator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <div className="prose max-w-none text-gray-600">
                <p className="mb-4">
                  Domain Value Estimator was born from a simple observation: determining the true value of a domain name was more art than science. As domain investors and web professionals ourselves, we recognized the need for a more reliable, data-driven approach to domain valuation.
                </p>
                <p className="mb-4">
                  We realized that artificial intelligence could revolutionize how domain values are calculated by analyzing vast amounts of data and identifying patterns that humans might miss. Our team of experts in AI, domain trading, and SEO came together to create a solution that would make domain valuation more accessible and accurate for everyone.
                </p>
                <p className="mb-4">
                  Today, our AI-powered platform processes millions of data points to provide accurate domain valuations, helping domain investors, business owners, and web professionals make informed decisions about their digital assets.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">What Sets Us Apart</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <Gauge className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
                  <p className="text-gray-600">
                    Our platform evaluates multiple factors including domain age, SEO metrics, and market trends to provide accurate valuations you can trust.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <BrainCircuit className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">
                    Advanced machine learning algorithms analyze vast amounts of data to provide accurate value estimations and market insights.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                  <p className="text-gray-600">
                    Get comprehensive reports with detailed insights into all factors affecting your domain's value.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600">
                Our mission is to bring transparency and accuracy to domain valuation through innovative technology. We're committed to helping our users make informed decisions about their digital assets by providing reliable, data-driven insights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Looking Forward</h2>
              <p className="text-gray-600">
                As we continue to grow, we remain focused on improving our AI algorithms, expanding our data sources, and developing new features to better serve our users. We're excited about the future of domain valuation and our role in shaping it.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;