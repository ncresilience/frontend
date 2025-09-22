'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  // Sample blog posts data - you can replace with dynamic data later
  const blogPosts = [
    {
      id: 1,
      title: "Building Resilient Communities: Lessons from Hurricane Florence",
      excerpt: "How the 2018 hurricane shaped our understanding of community preparedness and led to the creation of the NC Resilience Platform.",
      date: "December 15, 2024",
      readTime: "5 min read",
      category: "Impact Stories",
      image: "/blog/hurricane-florence.jpg" // You'll add these images later
    },
    {
      id: 2,
      title: "Understanding Your County's Risk Score: A Step-by-Step Guide",
      excerpt: "Learn how we calculate resilience scores and what they mean for your farm or business operations.",
      date: "December 10, 2024", 
      readTime: "7 min read",
      category: "How-To Guides",
      image: "/blog/risk-score-guide.jpg"
    },
    {
      id: 3,
      title: "Success Story: How Wake County Farmers Used Our Platform During the 2023 Drought",
      excerpt: "Real farmers share how advance warning and program matching helped them navigate water restrictions and crop challenges.",
      date: "December 5, 2024",
      readTime: "4 min read", 
      category: "Success Stories",
      image: "/blog/drought-success.jpg"
    },
    {
      id: 4,
      title: "The Science Behind Supply Chain Resilience Scoring",
      excerpt: "Deep dive into how we measure and evaluate supply chain vulnerabilities across North Carolina counties.",
      date: "November 28, 2024",
      readTime: "8 min read",
      category: "Technical Insights",
      image: "/blog/supply-chain-science.jpg"
    },
    {
      id: 5,
      title: "Partnerships That Power Resilience: Working with Federal Agencies",
      excerpt: "How our collaboration with FEMA, USDA, and SBA creates better outcomes for North Carolina communities.",
      date: "November 20, 2024",
      readTime: "6 min read",
      category: "Partnerships",
      image: "/blog/federal-partnerships.jpg"
    },
    {
      id: 6,
      title: "Small Business Spotlight: Coastal Resilience in Brunswick County",
      excerpt: "How small businesses in hurricane-prone areas are using our platform to build stronger operational strategies.",
      date: "November 15, 2024",
      readTime: "5 min read",
      category: "Success Stories", 
      image: "/blog/brunswick-business.jpg"
    }
  ];

  // Sample gallery images - you can replace with actual images later
  const galleryImages = [
    {
      src: "/gallery/nc-farm-landscape.jpg",
      alt: "North Carolina farm landscape with rolling hills",
      caption: "Agricultural landscapes across North Carolina"
    },
    {
      src: "/gallery/small-business-downtown.jpg", 
      alt: "Small businesses in downtown North Carolina",
      caption: "Small businesses are the backbone of NC communities"
    },
    {
      src: "/gallery/hurricane-preparation.jpg",
      alt: "Community preparing for hurricane",
      caption: "Communities coming together for disaster preparedness"
    },
    {
      src: "/gallery/farmer-technology.jpg",
      alt: "Farmer using modern technology",
      caption: "Technology helping farmers make better decisions"
    },
    {
      src: "/gallery/business-recovery.jpg",
      alt: "Small business reopening after disaster",
      caption: "Resilient businesses rebuilding stronger"
    },
    {
      src: "/gallery/community-meeting.jpg",
      alt: "Community resilience planning meeting",
      caption: "Building resilience through community collaboration"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="section-padding py-6 bg-white border-b">
        <div className="container-max">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">About NC Resilience Platform</h1>
                <p className="text-gray-600">Our foundation, story, and mission</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/agriculture" className="btn-secondary text-sm">
                Agriculture →
              </Link>
              <Link href="/business" className="btn-secondary text-sm">
                Business →
              </Link>
              <Link href="/map" className="btn-secondary text-sm">
                Risk Map →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('/about_hero.png')"
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-5xl font-bold mb-4">About Our Foundation</h2>
            <p className="text-xl leading-relaxed">
              Dedicated to building resilient communities across North Carolina through data-driven intelligence and accessible resources
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="section-padding py-16 bg-white">
        <div className="container-max">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* About */}
            <div className="lg:col-span-1">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">About</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                The NC Resilience Platform is a comprehensive risk intelligence system that empowers farmers and small business owners with the information they need to prepare for, respond to, and recover from economic and environmental challenges.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Built as an open-source initiative, our platform integrates federal data sources to provide actionable insights and connects users with relevant government assistance programs. We believe that complex government data should be accessible to everyone who needs it.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our foundation is committed to transparency, community impact, and measurable outcomes that strengthen North Carolina's agricultural and small business sectors.
              </p>
            </div>

            {/* Our Story */}
            <div className="lg:col-span-1">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Born from the recognition that North Carolina's farmers and small businesses needed better tools to navigate an increasingly complex risk landscape, our foundation launched this platform to bridge the gap between complex government data and practical decision-making.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                After witnessing communities struggle during Hurricane Florence, COVID-19, and other recent crises, we committed to creating a solution that puts critical information directly in the hands of those who need it most.
              </p>
              <p className="text-gray-600 leading-relaxed">
                What started as conversations with farmers and business owners about their challenges has grown into a comprehensive platform that serves all 100 North Carolina counties.
              </p>
            </div>

            {/* Mission */}
            <div className="lg:col-span-1">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                To strengthen the resilience of North Carolina's agricultural and small business communities by providing accessible, actionable risk intelligence and connecting users with resources that help them thrive through challenges.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                We believe that informed communities are resilient communities, and that every farmer and business owner deserves access to the tools and information needed to protect their livelihood and contribute to their community's prosperity.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our work is guided by the principle that technology should serve people, not the other way around, making complex information simple and actionable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Foundation Values */}
      <section className="section-padding py-16 bg-gray-100">
        <div className="container-max">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Foundation Values</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our work and shape our commitment to North Carolina communities
            </p>
          </div>
          
          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Accessibility</h4>
              <p className="text-gray-600">Making complex data understandable and actionable for everyone, regardless of technical background or experience with government programs.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Transparency</h4>
              <p className="text-gray-600">Open-source development and clear methodology ensure trust and accountability in our work, with all processes documented and verifiable.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Impact</h4>
              <p className="text-gray-600">Measuring success through real improvements in community preparedness and resilience outcomes, not just platform usage metrics.</p>
            </div>
          </div>

          {/* Foundation Values Images */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="aspect-w-16 aspect-h-10 mb-4">
                <img 
                  src="/ourfoundationvalues.png" 
                  alt="Our Foundation Values - Visual representation of accessibility, transparency, and impact"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Values in Action</h4>
              <p className="text-gray-600 text-sm">
                How our core values shape every aspect of the NC Resilience Platform, from design to implementation.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="aspect-w-16 aspect-h-10 mb-4">
                <img 
                  src="/ourfoundationsvalues2.png" 
                  alt="Foundation Values Implementation - Community impact and transparency measures"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Measuring Our Impact</h4>
              <p className="text-gray-600 text-sm">
                Transparent reporting and community feedback help us continuously improve our services and measure real-world impact.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="aspect-w-16 aspect-h-10 mb-4">
                <img 
                  src="/ourfoundationsvalues3.png" 
                  alt="Foundation Values Community Engagement - Building partnerships and community relationships"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Community Partnership</h4>
              <p className="text-gray-600 text-sm">
                Building meaningful relationships with farmers, business owners, and community leaders to ensure our platform serves real needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Picture Gallery */}
      <section className="section-padding py-16 bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Work in Action</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how the NC Resilience Platform is making a difference across North Carolina communities
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg aspect-w-4 aspect-h-3 bg-gray-200">
                  {/* Placeholder for images - you'll replace these with actual images */}
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">{image.alt}</p>
                    </div>
                  </div>
                  {/* When you add real images, replace the div above with: */}
                  {/* <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  /> */}
                </div>
                <p className="mt-4 text-center text-gray-600 font-medium">{image.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="section-padding py-16 bg-gray-100">
        <div className="container-max">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Latest from Our Blog</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Insights, stories, and updates about building resilience in North Carolina communities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Blog post image placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-xs">Blog Image</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/blog" className="btn-primary">
              View All Blog Posts
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding py-16 bg-blue-600">
        <div className="container-max text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Build Resilience?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and business owners using our platform to prepare for challenges and find opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agriculture" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Start with Agriculture
            </Link>
            <Link href="/business" className="btn-primary bg-blue-700 text-white hover:bg-blue-800">
              Start with Business
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding py-12 bg-white border-t">
        <div className="container-max">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              NC Resilience Platform - A Foundation Initiative Building Stronger Communities
            </p>
            <p className="text-sm">
              Open source project • Data from FEMA, USDA, SBA, and other federal agencies • © 2024 NC Resilience Foundation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}