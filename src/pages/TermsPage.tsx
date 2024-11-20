import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="mb-4">
                These Terms and Conditions govern your use of Domain Value Estimator ("the Service") operated by Domain Value Estimator ("we," "us," or "our"). By accessing or using the Service, you agree to be bound by these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="mb-4">
                Domain Value Estimator provides domain name valuation estimates based on various factors including, but not limited to, domain age, SEO metrics, and market trends. These valuations are estimates only and should not be considered as guaranteed or definitive market values.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Obligations</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate information when using the Service</li>
                <li>You agree not to abuse, harass, or submit malicious requests to the Service</li>
                <li>You will not attempt to circumvent any usage limits or security measures</li>
                <li>You will not use the Service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Subscription and Payments</h2>
              <p className="mb-4">
                Free tier users are limited to 5 domain valuations per day. Pro subscribers receive unlimited valuations and additional features as described in the pricing page. Subscription fees are billed monthly and are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Disclaimer of Warranties</h2>
              <p className="mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY VALUATIONS OR INFORMATION PROVIDED THROUGH THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="mb-4">
                IN NO EVENT SHALL DOMAIN VALUE ESTIMATOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Usage and Privacy</h2>
              <p className="mb-4">
                We collect and process data in accordance with our Privacy Policy. By using the Service, you consent to such processing and you warrant that all data provided by you is accurate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. API Usage</h2>
              <p className="mb-4">
                Pro subscribers have access to our API. API usage is subject to rate limits and fair use policies. We reserve the right to suspend API access for any account that violates these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Modifications to Service</h2>
              <p className="mb-4">
                We reserve the right to modify or discontinue, temporarily or permanently, the Service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="mb-4">
                For any questions about these Terms, please contact us at:
                <br />
                Email: legal@domainestimator.com
                <br />
                Address: 123 Valuation Street, Suite 100, San Francisco, CA 94105
              </p>
            </section>

            <section>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;