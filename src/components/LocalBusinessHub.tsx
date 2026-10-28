import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Plus,
  Send,
  MessageSquare,
  Briefcase,
  Check,
  Building,
  Phone,
  MapPin,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import businessImage from '../assets/images/local_entrepreneur_hub_1793163269453.jpg';

export const LocalBusinessHub: React.FC = () => {
  const {
    business,
    updateBusiness,
    addBusinessService,
    addBusinessListing,
    replyToEnquiry,
    generateSimulatedEnquiry,
    language,
    profile,
  } = useApp();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'showcase' | 'services' | 'enquiries' | 'listings' | 'profile'>('showcase');

  // Modal / Form States
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('₹');
  const [serviceUnit, setServiceUnit] = useState('per item');

  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [listingTitle, setListingTitle] = useState('');
  const [listingType, setListingType] = useState('Short-term Gig');
  const [listingDuration, setListingDuration] = useState('2 Days');
  const [listingStipend, setListingStipend] = useState('₹1,500');
  const [listingDesc, setListingDesc] = useState('');

  // Reply State
  const [replyingEnquiryId, setReplyingEnquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Business Edit Profile State
  const [bizName, setBizName] = useState(business.businessName);
  const [bizOwner, setBizOwner] = useState(business.ownerName);
  const [bizCategory, setBizCategory] = useState(business.category);
  const [bizTagline, setBizTagline] = useState(business.tagline);
  const [bizStory, setBizStory] = useState(business.story);
  const [bizLocation, setBizLocation] = useState(business.location);
  const [bizPhone, setBizPhone] = useState(business.phone);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      businessName: bizName,
      ownerName: bizOwner,
      category: bizCategory,
      tagline: bizTagline,
      story: bizStory,
      location: bizLocation,
      phone: bizPhone,
    });
    setActiveTab('showcase');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;
    addBusinessService({
      name: serviceName,
      description: serviceDesc,
      price: servicePrice,
      unit: serviceUnit,
    });
    setServiceName('');
    setServiceDesc('');
    setServicePrice('₹');
    setShowAddServiceModal(false);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingTitle.trim()) return;
    addBusinessListing({
      title: listingTitle,
      type: listingType,
      duration: listingDuration,
      stipend: listingStipend,
      description: listingDesc,
      status: 'open',
    });
    setListingTitle('');
    setListingDesc('');
    setShowAddListingModal(false);
  };

  const handleSendReply = (enquiryId: string) => {
    if (!replyText.trim()) return;
    replyToEnquiry(enquiryId, replyText);
    setReplyingEnquiryId(null);
    setReplyText('');
  };

  const unreadEnquiriesCount = (business?.enquiries || []).filter((e) => e.status === 'unread').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Quick Simulated Enquiry Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#134E3F] tracking-wide uppercase mb-1">
            <span>Local Entrepreneurship Hub</span>
            <span aria-hidden="true">·</span>
            <span>Micro-Business Empowerment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {language === 'hi' ? 'स्थानीय व्यापार और उद्यम हब' : 'Local Business & Entrepreneur Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Promote your local services, manage customer queries, and post short-term work opportunities for neighborhood talent.
          </p>
        </div>

        {/* Live Simulation Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={generateSimulatedEnquiry}
            className="px-3.5 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="Click to receive a simulated customer enquiry message"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Simulate Customer Enquiry</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'showcase', label: 'Storefront Showcase' },
          { id: 'services', label: `Services & Pricing (${business?.services?.length || 0})` },
          {
            id: 'enquiries',
            label: `Customer Enquiries ${unreadEnquiriesCount > 0 ? `(${unreadEnquiriesCount} New)` : `(${business?.enquiries?.length || 0})`}`,
          },
          { id: 'listings', label: `Work Listings (${business?.listings?.length || 0})` },
          { id: 'profile', label: 'Edit Business Profile' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#134E3F] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. STOREFRONT SHOWCASE TAB */}
      {activeTab === 'showcase' && (
        <div className="space-y-8">
          {/* Hero Banner Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-[#134E3F]">{business.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {business.location}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-stone-900">{business.businessName}</h3>
                <p className="text-xs sm:text-sm font-medium text-stone-700 italic">
                  "{business.tagline}"
                </p>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                  {business.story}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <span className="font-medium text-stone-800">Owner: {business.ownerName}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  {business.phone}
                </span>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-[#134E3F] hover:underline font-semibold ml-auto"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="md:col-span-5 relative bg-stone-100 min-h-[220px]">
              <img
                src={businessImage}
                alt="Studio workshop and artisan storefront"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium">
                Verified Local Enterprise · Jaipur Cluster
              </div>
            </div>
          </div>

          {/* Featured Services Preview Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-stone-900">Current Services &amp; Products</h4>
                <p className="text-xs text-stone-500">Indicative prices for retail buyers and local clients</p>
              </div>
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#134E3F] rounded-lg hover:bg-[#0E3B30] flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {business.services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white border border-stone-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-stone-400 transition-colors shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-stone-900">{srv.name}</h5>
                      <span className="text-xs font-extrabold text-[#134E3F] shrink-0">
                        {srv.price}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {srv.description}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Rate: {srv.unit}</span>
                    <button
                      onClick={generateSimulatedEnquiry}
                      className="text-[#134E3F] hover:underline font-medium"
                    >
                      Enquire (Demo)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES & PRICING TAB */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-stone-900">Service &amp; Product Catalog</h4>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#134E3F] rounded-lg hover:bg-[#0E3B30] flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {business.services.map((srv) => (
              <div key={srv.id} className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-stone-900">{srv.name}</h5>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#134E3F]">{srv.price}</span>
                    <span className="text-[11px] text-stone-400 block">{srv.unit}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{srv.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ENQUIRIES TAB */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-stone-900">Customer Inquiries Inbox</h4>
              <p className="text-xs text-stone-500">Simulated messages from urban buyers, retail stores, and clients</p>
            </div>
            <button
              onClick={generateSimulatedEnquiry}
              className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Trigger Test Enquiry</span>
            </button>
          </div>

          {business.enquiries.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-2">
              <p className="text-xs text-stone-500">No customer messages received yet.</p>
              <button
                onClick={generateSimulatedEnquiry}
                className="px-3 py-1.5 text-xs text-[#134E3F] font-semibold underline"
              >
                Generate a simulated inquiry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {business.enquiries.map((enq) => {
                const isReplied = enq.status === 'replied';
                const isCurrentlyReplying = replyingEnquiryId === enq.id;

                return (
                  <div
                    key={enq.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            {enq.customerName}
                          </span>
                          <span className="text-[11px] text-stone-400">· {enq.receivedAt}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Interested in: <strong className="text-stone-700">{enq.serviceInterested}</strong> · Contact: {enq.customerContact}
                        </p>
                      </div>

                      {isReplied ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Replied
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Unread Enquiry
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-100 leading-relaxed">
                      "{enq.message}"
                    </p>

                    {enq.replyNote && (
                      <div className="text-xs text-stone-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                        <strong className="text-emerald-900">Your Sent Reply:</strong> {enq.replyNote}
                      </div>
                    )}

                    {/* Inline Reply Form */}
                    {!isReplied && !isCurrentlyReplying && (
                      <button
                        onClick={() => {
                          setReplyingEnquiryId(enq.id);
                          setReplyText(
                            `Hello ${enq.customerName}, thank you for contacting ${business.businessName}! We would be happy to help you with ${enq.serviceInterested}.`
                          );
                        }}
                        className="text-xs font-semibold text-[#134E3F] hover:underline flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Response</span>
                      </button>
                    )}

                    {isCurrentlyReplying && (
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReplyingEnquiryId(null)}
                            className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(enq.id)}
                            className="px-3.5 py-1 text-xs font-semibold text-white bg-[#134E3F] rounded-lg hover:bg-[#0E3B30]"
                          >
                            Send Reply (Demo)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. WORK LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-stone-900">Short-Term Gigs &amp; Helper Listings</h4>
              <p className="text-xs text-stone-500">Hire local assistants, photographers, or packers for flexible days</p>
            </div>
            <button
              onClick={() => setShowAddListingModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#134E3F] rounded-lg hover:bg-[#0E3B30] flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Listing</span>
            </button>
          </div>

          <div className="space-y-3">
            {business.listings.map((lst) => (
              <div key={lst.id} className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                      {lst.type} · {lst.duration}
                    </span>
                    <h5 className="text-sm font-bold text-stone-900 mt-0.5">{lst.title}</h5>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    {lst.stipend}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{lst.description}</p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Status: <strong className="text-stone-800 capitalize">{lst.status}</strong></span>
                  <span>{lst.applicantCount} local applicants interested</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EDIT PROFILE TAB */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Edit Business Profile Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Business Name</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Owner Name</label>
              <input
                type="text"
                value={bizOwner}
                onChange={(e) => setBizOwner(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <input
                type="text"
                value={bizCategory}
                onChange={(e) => setBizCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Location</label>
              <input
                type="text"
                value={bizLocation}
                onChange={(e) => setBizLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline</label>
            <input
              type="text"
              value={bizTagline}
              onChange={(e) => setBizTagline(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Brand Story &amp; Mission</label>
            <textarea
              rows={3}
              value={bizStory}
              onChange={(e) => setBizStory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone / WhatsApp</label>
            <input
              type="text"
              value={bizPhone}
              onChange={(e) => setBizPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#134E3F]"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('showcase')}
              className="px-3.5 py-2 text-xs text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#134E3F] hover:bg-[#0E3B30] rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h4 className="text-sm font-bold text-stone-900">Add Service or Product</h4>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service / Item Name</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Handmade Ceramic Tea Set"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Indicative Price</label>
                  <input
                    type="text"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="₹850"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit / Billing</label>
                  <input
                    type="text"
                    value={serviceUnit}
                    onChange={(e) => setServiceUnit(e.target.value)}
                    placeholder="per piece / per hour"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  placeholder="Describe materials, craft technique, or turnaround time..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[#134E3F] rounded-lg"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {showAddListingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] border border-stone-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h4 className="text-sm font-bold text-stone-900">Post Short-Term Work Listing</h4>
              <button
                onClick={() => setShowAddListingModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  placeholder="e.g. Weekend Packaging &amp; Dispatch Helper"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stipend / Wage</label>
                  <input
                    type="text"
                    value={listingStipend}
                    onChange={(e) => setListingStipend(e.target.value)}
                    placeholder="₹1,500 / weekend"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={listingDuration}
                    onChange={(e) => setListingDuration(e.target.value)}
                    placeholder="2 Days (Sat-Sun)"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description &amp; Tasks</label>
                <textarea
                  rows={3}
                  value={listingDesc}
                  onChange={(e) => setListingDesc(e.target.value)}
                  placeholder="What will the person do? Any equipment or training provided?"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddListingModal(false)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[#134E3F] rounded-lg"
                >
                  Post Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
