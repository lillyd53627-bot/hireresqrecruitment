```jsx
import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function FooterContactSection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    contactNumber: '',
    email: '',
    companyName: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('contact_requests').insert([
        {
          first_name: formData.firstName,
          surname: formData.surname,
          contact_number: formData.contactNumber,
          email: formData.email,
          company_name: formData.companyName,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      toast.success('Your message has been sent successfully');

      setFormData({
        firstName: '',
        surname: '',
        contactNumber: '',
        email: '',
        companyName: '',
        message: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    }

    setLoading(false);
  };

  return (
    <section className="bg-gray-950 text-white py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-500 px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <MessageCircle className="w-4 h-4" />
            Contact HireResQ AI
          </div>

          <h2 className="text-4xl font-bold mb-6">
            Let’s Talk About Growing Your Recruitment Business
          </h2>

          <p className="text-gray-400 text-lg mb-8 max-w-xl">
            Chat with us directly on WhatsApp or send us your details and our team will contact you.
          </p>

          <a
            href="https://wa.me/27834676026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 px-6 py-4 rounded-2xl text-white font-semibold transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us: 083 467 6026
          </a>

          <div className="mt-10 space-y-4 text-gray-400">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-500" />
              <span>083 467 6026</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-500" />
              <span>info@hireresq.com</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-gray-950 border-gray-700 text-white"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Surname</label>
                <Input
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className="bg-gray-950 border-gray-700 text-white"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Contact Number</label>
                <Input
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className="bg-gray-950 border-gray-700 text-white"
                  placeholder="083 123 4567"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-950 border-gray-700 text-white"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <Input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="pl-10 bg-gray-950 border-gray-700 text-white"
                  placeholder="Your Company"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Message</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="bg-gray-950 border-gray-700 text-white"
                placeholder="Tell us what you need help with"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-2xl"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
```