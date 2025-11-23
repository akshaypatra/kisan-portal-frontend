import React, { useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [selectedCrops, setSelectedCrops] = useState([]);
  const cropOptions = [
    "Soybean",
    "Mustard",
    "Groundnut",
    "Sunflower",
    "Sesame",
    "Safflower",
    "Niger",
    "Linseed",
  ];

  const states = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
    "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
    "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
    "Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands",
    "Chandigarh","Dadra & Nagar Haveli and Daman & Diu","Delhi","Ladakh",
    "Lakshadweep","Puducherry","Jammu & Kashmir"
  ];

  const [aadhaar, setAadhaar] = useState("");

  const [cropInput, setCropInput] = useState("");

  const handleCropAdd = (value) => {
    if (value && cropOptions.includes(value) && !selectedCrops.includes(value)) {
      setSelectedCrops([...selectedCrops, value]);
    }
    setCropInput("");
  };

  const removeCrop = (crop) => {
    setSelectedCrops(selectedCrops.filter((c) => c !== crop));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="container">
      <h2>Complete Your Profile</h2>
      <p className="subtitle">Help us personalize your farming experience</p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Full Name *</label>
          <input type="text" placeholder="Enter your full name" required />
        </div>

        <div className="input-group">
          <label>Age *</label>
          <input type="number" placeholder="Enter your age" required />
        </div>

        <div className="input-group">
          <label>Region / State *</label>
          <select required>
            <option value="">Select your region</option>
            {states.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Land Area (in acres) *</label>
          <input type="number" placeholder="Enter land area" required />
        </div>

        <div className="input-group">
          <label>Aadhaar Number (optional)</label>
          <input
            type="text"
            placeholder="Enter Aadhaar number"
            value={aadhaar}
            maxLength={14}
            onChange={(e) => {
              let v = e.target.value.replace(/[^0-9]/g, "").slice(0, 12);
              if (v.length > 4 && v.length <= 8)
                v = v.replace(/(\d{4})(\d+)/, "$1-$2");
              if (v.length > 8)
                v = v.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
              setAadhaar(v);
            }}
          />
        </div>

        <div className="input-group">
          <label>Crop Preferences (Oilseeds) *</label>

          <div className="selected-crop-box">
            {selectedCrops.map((crop) => (
              <div className="crop-chip" key={crop}>
                🌱 {crop}
                <span onClick={() => removeCrop(crop)}>×</span>
              </div>
            ))}
          </div>

          <input
            type="text"
            list="crop-list"
            placeholder="Type to add oilseed crops..."
            value={cropInput}
            onChange={(e) => setCropInput(e.target.value)}
            onBlur={() => handleCropAdd(cropInput)}
          />

          <datalist id="crop-list">
            {cropOptions.map((crop) => (
              <option value={crop} key={crop} />
            ))}
          </datalist>
        </div>

        <div className="location-box">
          <p>Enable location access for weather alerts and local market prices.</p>
          <button className="location-btn" type="button">
            Get Current Location
          </button>
        </div>

        <button className="submit-btn" type="submit">
          Save Profile
        </button>
      </form>
    </div>
  );
}
