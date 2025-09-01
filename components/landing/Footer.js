const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#1a0a0f] text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand & Tagline */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Vibeazy</h3>
            <p className="text-lg font-medium text-[#f9a8d4]">
              Make your customers spend more
            </p>
            <p className="text-gray-300">
              Track spending. Reward customers. Sell more.
            </p>
          </div>

          {/* What is Vibeazy */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-[#2c151b]">
              What is Vibeazy
            </h4>
            <p className="text-gray-300 mb-3">
              Vibeazy helps you track customer spending, reward your top customers, 
              and drive repeat visits — without changing your payment system or 
              requiring customers to download an app.
            </p>
            <p className="text-gray-300">
              Whether you run a restaurant, spa, supermarket, or cinema, 
              Vibeazy helps you understand customers and keep them coming back.
            </p>
          </div>

          {/* Who is Vibeazy For */}
          <div>
            <h4 className="text-lg font-semibold mb-4 pb-2 border-b border-[#2c151b]">
              Who is Vibeazy For
            </h4>
            <ul className="space-y-5">
              {[
                {
                  icon: "🍽️",
                  title: "Restaurants & Bars",
                  desc: "Reward regulars, drive repeat dining"
                },
                {
                  icon: "🛒",
                  title: "Supermarkets & Minimarkets",
                  desc: "Turn shoppers into loyal customers"
                },
                {
                  icon: "💇",
                  title: "Salons & Spas",
                  desc: "Keep clients coming back"
                }
              ].map((item) => (
                <li key={item.title} className="flex items-start">
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <div>
                    <h5 className="font-medium">{item.title}</h5>
                    <p className="text-gray-300 text-sm mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright section */}
      <div className="border-t border-[#2c151b] py-4 text-center text-white">
        <p>© {currentYear} Vibeazy. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;