import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import stripeService, { SubscriptionDetails as SubscriptionDetailsType } from '../services/stripeService';

interface Props {
  subscription: SubscriptionDetailsType;
  onUpdate: () => void;
}

const SubscriptionDetails: React.FC<Props> = ({ subscription, onUpdate }) => {
  const navigate = useNavigate();
  const [isCanceling, setIsCanceling] = React.useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setIsCanceling(true);
    try {
      await stripeService.cancelSubscription();
      onUpdate();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h3>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <div className="mt-1 text-sm text-gray-900">
              {subscription.status === 'active' ? (
                <span className="text-green-600 font-medium">Active</span>
              ) : (
                <span className="text-yellow-600 font-medium">
                  {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status}
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Current Period Ends</div>
            <div className="mt-1 text-sm text-gray-900">
              {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Amount</div>
            <div className="mt-1 text-sm text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: subscription.currency.toUpperCase()
              }).format(subscription.amount / 100)}
              /month
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Actions</div>
            <div className="mt-1 space-x-4">
              <button
                onClick={() => navigate('/transactions')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View Transaction History
              </button>
            </div>
          </div>
        </div>

        {!subscription.cancelAtPeriodEnd && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isCanceling}
              className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
            >
              {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;