import React, { useState } from "react";
import { mockData } from "../utils/data";
import { FaEye, FaEyeSlash, FaUnlock } from "react-icons/fa";
import logo from '../Images/logo.png'
const LockScreen = ({ onUnlock }) => {
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const currentUser = mockData.users?.director || { name: "Director", role: "Admin" };

  const handleUnlock = (e) => {
    e.preventDefault();
    const correctPassword = currentUser.password || "123456";
    if (password === correctPassword) {
      setError("");
      window.location.href = '/'
      if (onUnlock) onUnlock();
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-4">
          <img className="mx-auto mb-3" src={logo} alt="Logo" />
          <h4 className="text-xl font-semibold">Account Locked</h4>
        </div>
        <form onSubmit={handleUnlock}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control w-full border rounded-md px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="text-center">
            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
              <FaUnlock /> Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockScreen;
