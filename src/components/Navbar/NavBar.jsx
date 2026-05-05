// Navbar.jsx
import React from "react";
import Button from "../Button/Button";

const Navbar = () => {
  const icons = [
    { name: "Word", img: "/assets/icon/Word.png" },
    { name: "IN", img: "/assets/icon/IN.png" },
    { name: "Account", img: "/assets/icon/Account.png" },
  ];

  return (
    <header className="topbar">

      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="logo"
          className="w-8 h-8 object-contain"
        />
   
      </div>

  
      <div className="relative w-[40%]">
        <img src="/assets/icon/mic.png" alt="" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full border rounded-full pl-4 pr-20 py-2 outline-none focus:ring-2 focus:ring-gray-300"
        />

        {/* inside input buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
          <Button className="text-gray-600 hover:text-black">Search</Button>
          
        </div>
      </div>

      {/* ✅ RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* ICONS */}
        {icons.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <img
              src={item.img}
              alt={item.name}
              className="w-5 h-5 object-contain"
            />
            <span className="text-sm">{item.name}</span>
          </div>
        ))}

        {/* BUTTON */}
        <Button text="Create Account">Create Account</Button>

      </div>
    </header>
  );
};

export default Navbar;