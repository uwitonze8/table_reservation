'use client';

import Link from 'next/link';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const userRewards = {
  currentPoints: 480,
  tierLevel: 'Gold',
  nextTier: 'Platinum',
  pointsToNextTier: 520,
  lifetimePoints: 1240,
  rewardHistory: [
    { date: '2025-11-20', action: 'Reservation completed', points: 50, type: 'earned' },
    { date: '2025-11-15', action: 'Birthday bonus', points: 100, type: 'earned' },
    { date: '2025-11-10', action: 'Free appetizer redeemed', points: -200, type: 'redeemed' },
    { date: '2025-11-05', action: 'Reservation completed', points: 50, type: 'earned' },
    { date: '2025-10-28', action: 'Referral bonus', points: 150, type: 'earned' },
  ],
};

const availableRewards = [
  { id: 1, name: 'Free Appetizer', points: 200, description: 'Any appetizer from our menu', icon: '🥗' },
  { id: 2, name: '10% Off Total Bill', points: 300, description: 'Valid for one reservation', icon: '💰' },
  { id: 3, name: 'Free Dessert', points: 150, description: 'Any dessert from our menu', icon: '🍰' },
  { id: 4, name: 'Complimentary Wine', points: 400, description: 'House wine with your meal', icon: '🍷' },
  { id: 5, name: 'Priority Reservations', points: 500, description: 'Skip the waitlist for 30 days', icon: '⭐' },
  { id: 6, name: 'Chef\'s Special Tasting', points: 800, description: 'Exclusive 5-course meal', icon: '👨‍🍳' },
];

const tierBenefits = {
  Silver: ['Earn 1 point per dollar', 'Birthday bonus', 'Email updates'],
  Gold: ['Earn 1.5 points per dollar', 'Birthday bonus', 'Priority support', 'Exclusive events'],
  Platinum: ['Earn 2 points per dollar', 'Birthday bonus', 'Priority support', 'Exclusive events', 'Free valet parking', 'Complimentary champagne'],
};

export default function RewardsPage() {
  const progressPercentage = (userRewards.currentPoints / (userRewards.currentPoints + userRewards.pointsToNextTier)) * 100;

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">Loyalty Rewards</h1>
            <p className="text-sm text-[#333333] opacity-70 mt-1">
              Earn points with every reservation and enjoy exclusive benefits
            </p>
          </div>

          {/* Points Overview */}
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-lg shadow-md p-4 mb-4 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-white opacity-80 mb-1 text-xs">Current Points</p>
                <p className="text-3xl font-bold">{userRewards.currentPoints}</p>
              </div>
              <div className="text-center">
                <p className="text-white opacity-80 mb-1 text-xs">Current Tier</p>
                <div className="inline-block bg-white bg-opacity-20 px-4 py-1 rounded-full">
                  <p className="text-2xl font-bold">{userRewards.tierLevel}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white opacity-80 mb-1 text-xs">Lifetime Points</p>
                <p className="text-3xl font-bold">{userRewards.lifetimePoints}</p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-white opacity-90 text-sm">Progress to {userRewards.nextTier}</p>
                <p className="text-white font-semibold text-xs">{userRewards.pointsToNextTier} points to go</p>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Membership Tiers & Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(tierBenefits).map(([tier, benefits]) => (
                <div
                  key={tier}
                  className={`p-3 rounded-lg border-2 ${
                    tier === userRewards.tierLevel
                      ? 'border-[#FF6B35] bg-[#FF6B35] bg-opacity-5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#333333]">{tier}</h3>
                    {tier === userRewards.tierLevel && (
                      <span className="bg-[#FF6B35] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-1.5 text-xs text-[#333333]">
                        <svg className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Available Rewards */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Redeem Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableRewards.map((reward) => {
                const canRedeem = userRewards.currentPoints >= reward.points;
                return (
                  <div
                    key={reward.id}
                    className={`p-3 rounded-lg border-2 ${
                      canRedeem ? 'border-[#FF6B35] hover:shadow-lg' : 'border-gray-200 opacity-60'
                    } transition-all`}
                  >
                    <div className="text-3xl mb-3 text-center">{reward.icon}</div>
                    <h3 className="text-sm font-bold text-[#333333] mb-1.5 text-center">{reward.name}</h3>
                    <p className="text-xs text-[#333333] opacity-70 mb-3 text-center">{reward.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-[#FF6B35]">{reward.points}</span>
                      <span className="text-xs text-[#333333] opacity-70">points</span>
                    </div>
                    <button
                      disabled={!canRedeem}
                      className={`w-full py-2 text-sm rounded-lg font-semibold transition-all ${
                        canRedeem
                          ? 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Redeem Now' : 'Not Enough Points'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points History */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Points History</h2>
            <div className="space-y-2.5">
              {userRewards.rewardHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {item.type === 'earned' ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#333333]">{item.action}</p>
                      <p className="text-xs text-[#333333] opacity-70">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.type === 'earned' ? '+' : ''}{item.points}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ways to Earn More */}
          <div className="mt-4 bg-[#FF6B35] bg-opacity-10 border-2 border-[#FF6B35] rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#333333] mb-3">Ways to Earn More Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#333333]">Make Reservations</p>
                  <p className="text-xs text-[#333333] opacity-70">Earn 50 points per completed reservation</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#333333]">Refer Friends</p>
                  <p className="text-xs text-[#333333] opacity-70">Get 150 points for each successful referral</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#333333]">Leave Reviews</p>
                  <p className="text-xs text-[#333333] opacity-70">Earn 25 points for each verified review</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">4</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#333333]">Birthday Bonus</p>
                  <p className="text-xs text-[#333333] opacity-70">Receive 100 points on your birthday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
