import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: 'general', message: '' });
    }, 4000);
  };

  return (
    <main className="py-16 bg-[#F1F4EE]/40 text-[#1A2421]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#1C5C53] font-mono bg-[#1C5C53]/10 px-3.5 py-1 rounded-full">
            Get in touch
          </span>
          <h1 className="text-4xl font-bold text-[#11332D] font-display sm:text-5xl">
            We're here to help you stay safe.
          </h1>
          <p className="text-[#5A6B66] text-base leading-relaxed">
            Have questions about bulk orders for schools/corporations, tag setup, or our API integrations? Send us a message.
          </p>
        </div>

        {/* Form and Contact Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          
          {/* Left Column: Contact Details */}
          <div className="lg:col-span-5 space-y-8 bg-[#11332D] text-white p-8 rounded-3xl border border-[#1C5C53]">
            <h3 className="text-2xl font-bold font-display">Contact Information</h3>
            <p className="text-sm text-[#F1F4EE]/70 leading-relaxed">
              Reach out to our customer advocacy or partnership teams. We are available 24/7 for urgent emergency profile inquiries.
            </p>

            <div className="space-y-6 text-sm">
              <div className="flex gap-4 items-start">
                <Mail className="w-5 h-5 text-[#FF5A4E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-[#F1F4EE]/75 uppercase tracking-wider">Email Us</h4>
                  <p className="text-sm text-white font-medium">support@goldenhours.org</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <Phone className="w-5 h-5 text-[#FF5A4E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-[#F1F4EE]/75 uppercase tracking-wider">Call Support</h4>
                  <p className="text-sm text-white font-medium">+91 (11) 4050-9800</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-[#FF5A4E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-[#F1F4EE]/75 uppercase tracking-wider">Headquarters</h4>
                  <p className="text-sm text-white font-medium">Golden Hours Emergency Tech, New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#D9DFD6] shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-[#11332D]">Message Received</h3>
                <p className="text-xs text-[#5A6B66]">
                  Thank you for reaching out! Our team will reply to your email within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Inquiry Topic</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bulk">Bulk Tag Orders (School / Hospital)</option>
                    <option value="api">API & Emergency Dispatch Integration</option>
                    <option value="billing">Billing & Subscriptions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#11332D]">Message</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    placeholder="How can we assist you today?"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#FF5A4E]" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </main>
  );
};
