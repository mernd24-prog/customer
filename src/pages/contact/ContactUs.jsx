import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  CheckCircle,
  X,
} from "lucide-react";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = {};

    if (!form.name.trim()) err.name = "Name is required";
    else if (form.name.length < 3) err.name = "Minimum 3 characters";

    if (!form.email) err.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email))
      err.email = "Invalid email";

    if (!form.phone) err.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone))
      err.phone = "Enter valid 10 digit number";

    if (!form.subject) err.subject = "Please select subject";

    if (!form.message.trim()) err.message = "Message is required";
    else if (form.message.length < 10) err.message = "Minimum 10 characters";

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <section className=" py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-8 text-[#1d2377]">
              Contact Information
            </h2>

            <div className="space-y-8">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  value: "support@samglobal.com",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  value: "+91 98765 43210",
                },
                {
                  icon: Clock3,
                  title: "Working Hours",
                  value: "Mon - Sat\n9 AM - 7 PM",
                },
                {
                  icon: MapPin,
                  title: "Office",
                  value: "Sam Global Marketplace Pvt Ltd\nBhubaneswar\nOdisha",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center group-hover:bg-[#d4a12f] duration-300">
                    <item.icon className="text-[#d4a12f] group-hover:text-white" />
                  </div>

                  <div>
                    <p className="font-semibold">{item.title}</p>

                    <p className="text-gray-500 whitespace-pre-line">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#1d2377] mb-8">
              Send us a Message
            </h2>

            {submitted && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-6 md:p-10 max-w-md w-full shadow-2xl relative transform transition-all">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X size={24} />
                  </button>

                  <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="text-green-500 w-12 h-12" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-[#1d2377] mb-4">
                      Thank You!
                    </h3>

                    <p className="text-gray-500 mb-8 text-[1.05rem] leading-relaxed">
                      Your message has been submitted successfully. Our team
                      will contact you within 24 hours.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="w-full bg-[#d4a12f] hover:bg-yellow-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full border rounded-xl p-4 focus:border-[#d4a12f] outline-none"
                  />

                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full border rounded-xl p-4"
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full border rounded-xl p-4"
                  />

                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-4"
                  >
                    <option value="">Select Subject</option>
                    <option>Order Issue</option>
                    <option>Payment</option>
                    <option>Return</option>
                    <option>Seller Support</option>
                    <option>Technical</option>
                  </select>

                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <textarea
                    rows="6"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    className="w-full border rounded-xl p-4"
                  />

                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#d4a12f] hover:bg-yellow-500 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 w-fit"
                >
                  <Send size={18} />

                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
