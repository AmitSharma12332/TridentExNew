import React from "react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:pt-20 pt-24 bg-white rounded-lg shadow-sm">
      <h1 className="text-xl font-bold text-center mb-6">ABOUT TRIDENT GAMING</h1>
      
      <div className="mb-8 flex justify-center">
        <img 
          src="/placeholder.svg?height=150&width=300" 
          alt="Trident Gaming Logo" 
          className="h-32 object-contain"
        />
      </div>
      
      <h2 className="text-lg font-semibold mb-2">Our Story</h2>
      
      <p className="mb-4">
        Founded in 2018, Trident Gaming has quickly established itself as a leading name in the online gaming industry. Named after the powerful three-pronged spear of the sea god Poseidon, Trident represents our three core values: integrity, innovation, and excellence.
      </p>
      
      <p className="mb-6">
        What began as a small team of gaming enthusiasts and industry veterans has grown into a global operation serving players across multiple continents. Our journey has been driven by a passion for creating exceptional gaming experiences and a commitment to responsible gambling practices.
      </p>
      
      <h2 className="text-lg font-semibold mb-2">Our Mission</h2>
      
      <p className="mb-6">
        At Trident Gaming, our mission is to provide a secure, fair, and entertaining online gaming platform that exceeds our players' expectations. We strive to combine cutting-edge technology with exceptional customer service to deliver an unparalleled gaming experience while promoting responsible gambling.
      </p>
      
      <h2 className="text-lg font-semibold mb-2">Our Values</h2>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Integrity</h3>
          <p>
            We operate with transparency and honesty in all our dealings. Our games are fair, our policies are clear, and our business practices are ethical.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Innovation</h3>
          <p>
            We continuously seek new ways to improve our platform, introduce exciting games, and enhance the player experience through technological advancement.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Excellence</h3>
          <p>
            We are committed to delivering excellence in every aspect of our operation, from game quality and platform security to customer support and responsible gambling measures.
          </p>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-2">Our Platform</h2>
      
      <p className="mb-4">
        Trident Gaming offers a comprehensive suite of online gaming options, including:
      </p>
      
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Sports Betting:</strong> Extensive coverage of global sports events with competitive odds and live betting options.
        </li>
        <li>
          <strong>Casino Games:</strong> A vast selection of slots, table games, and live dealer experiences from top software providers.
        </li>
        <li>
          <strong>Poker:</strong> Vibrant poker rooms with various game types, tournaments, and stakes to suit all players.
        </li>
        <li>
          <strong>Virtual Sports:</strong> Realistic simulations of popular sports with frequent events and instant results.
        </li>
        <li>
          <strong>Esports:</strong> Betting on major esports tournaments across multiple game titles.
        </li>
      </ul>
      
      <h2 className="text-lg font-semibold mb-2">Licensing and Regulation</h2>
      
      <p className="mb-6">
        Trident Gaming is licensed and regulated by the Curaçao Gaming Authority under license number 1668/JAZ. We adhere to strict regulatory requirements to ensure fair play, secure transactions, and responsible gambling practices.
      </p>
      
      <h2 className="text-lg font-semibold mb-2">Responsible Gaming</h2>
      
      <p className="mb-6">
        We are deeply committed to promoting responsible gambling. We provide our players with tools to manage their gaming activity, including deposit limits, self-exclusion options, and reality checks. We also work with leading organizations in the field of problem gambling prevention and treatment.
      </p>
      
      <h2 className="text-lg font-semibold mb-2">Our Team</h2>
      
      <p className="mb-4">
        Trident Gaming is powered by a diverse team of professionals with extensive experience in the gaming industry, technology, customer service, and compliance. Our leadership team brings decades of combined experience from some of the world's leading gaming and technology companies.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">JD</span>
          </div>
          <div>
            <h3 className="font-medium">James Donovan</h3>
            <p className="text-sm text-gray-600">Chief Executive Officer</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">SM</span>
          </div>
          <div>
            <h3 className="font-medium">Sarah Mitchell</h3>
            <p className="text-sm text-gray-600">Chief Technology Officer</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
      
      <p className="mb-4">
        We value your feedback and are always here to assist you. You can reach our customer support team 24/7 through the following channels:
      </p>
      
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Email: support@tridentgaming.com</li>
        <li>Live Chat: Available on our website</li>
        <li>Phone: +1-888-TRIDENT (874-3368)</li>
      </ul>
      
      <p className="text-center text-sm text-gray-500 mt-8">
        © 2025 Trident Gaming. All rights reserved.
      </p>
    </div>
  );
}
