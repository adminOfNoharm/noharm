'use client'


import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Mail } from 'lucide-react'
import '@/app/globals.css'
import Navbar from '@/components/landing/navbar'
import Footer from '@/components/landing/Footer'


export default function ContactPage() {
  // State for form data and submission status
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    setLoading(true);
    setStatus('');


    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email, // Use form email field as recipient
          subject: subject || `Message from ${name}`, // Default subject if not entered
          html: `
            <strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Message:</strong> ${message}
          `
        }),
      });


      const data = await response.json();

      if (data.success) {
        setStatus('Email sent successfully!');
      } else {
        setStatus('Failed to send email.');
      }
    } catch (error) {
      setStatus('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-2xl mt-10 font-altone">Want to Know more About Us?</h1>
        <h1 className="text-4xl font-bold mb-12 font-arcon">Reach Out!</h1>


        <div className="space-y-16">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm mb-2">Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>


            <div>
              <label htmlFor="email" className="block text-sm mb-2">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>


            <div>
              <label htmlFor="subject" className="block text-sm mb-2">Subject</label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>


            <div>
              <label htmlFor="message" className="block text-sm mb-2">Message</label>
              <Textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>


            {/* Display success or error messages */}
            {status && (
              <div className={`mt-4 ${status.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                {status}
              </div>
            )}


            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>


          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>Email: info@noharm.tech</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Location: Texas</span>
            </div>
          </div>


          {/* Map */}
          <div className="aspect-video w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423268.3363741013!2d-99.133208!3d31.968599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b199f5b541a55%3A0x78017c846cfeb372!2sTexas%2C%20USA!5e0!3m2!1sen!2sus!4v1705420000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
