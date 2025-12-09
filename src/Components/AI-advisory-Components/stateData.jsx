const REGION_META = {
  Maharashtra: {
    Pune: { rainfall: "medium", suitable: ["Soybean", "Groundnut", "Sugarcane", "Wheat"] },
    Nagpur: { rainfall: "low", suitable: ["Cotton", "Soybean"] },
    Nashik: { rainfall: "medium", suitable: ["Grapes", "Onion", "Maize"] },
    Kolhapur: { rainfall: "high", suitable: ["Sugarcane", "Rice"] },
    Aurangabad: { rainfall: "low", suitable: ["Cotton", "Jowar", "Bajra"] },
  },
  Karnataka: {
    Bengaluru: { rainfall: "medium", suitable: ["Ragi", "Millets", "Vegetables"] },
    Mysuru: { rainfall: "high", suitable: ["Sugarcane", "Paddy"] },
    Belagavi: { rainfall: "medium", suitable: ["Maize", "Soybean"] },
    Kalaburagi: { rainfall: "low", suitable: ["Tur Dal", "Cotton"] },
  },
  Gujarat: {
    Ahmedabad: { rainfall: "low", suitable: ["Cotton", "Groundnut"] },
    Surat: { rainfall: "medium", suitable: ["Rice", "Sugarcane"] },
    Rajkot: { rainfall: "low", suitable: ["Groundnut", "Cotton"] },
    Vadodara: { rainfall: "medium", suitable: ["Maize", "Pulses"] },
  },
  Rajasthan: {
    Jaipur: { rainfall: "low", suitable: ["Mustard", "Bajra"] },
    Jodhpur: { rainfall: "low", suitable: ["Guar", "Bajra"] },
    Udaipur: { rainfall: "medium", suitable: ["Maize", "Soybean"] },
    Kota: { rainfall: "medium", suitable: ["Wheat", "Soybean"] },
  },
  "Madhya Pradesh": {
    Indore: { rainfall: "medium", suitable: ["Soybean", "Wheat"] },
    Bhopal: { rainfall: "medium", suitable: ["Paddy", "Wheat"] },
    Gwalior: { rainfall: "low", suitable: ["Mustard", "Gram"] },
    Jabalpur: { rainfall: "high", suitable: ["Rice", "Sugarcane"] },
  },
  "Uttar Pradesh": {
    Lucknow: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
    Varanasi: { rainfall: "high", suitable: ["Paddy", "Sugarcane"] },
    Kanpur: { rainfall: "medium", suitable: ["Wheat", "Gram"] },
    Meerut: { rainfall: "medium", suitable: ["Sugarcane", "Wheat"] },
  },
  Bihar: {
    Patna: { rainfall: "high", suitable: ["Paddy", "Maize"] },
    Gaya: { rainfall: "medium", suitable: ["Wheat", "Gram"] },
    Bhagalpur: { rainfall: "high", suitable: ["Maize", "Paddy"] },
  },
  "West Bengal": {
    Kolkata: { rainfall: "high", suitable: ["Rice", "Jute"] },
    Darjeeling: { rainfall: "high", suitable: ["Tea", "Vegetables"] },
    Burdwan: { rainfall: "medium", suitable: ["Rice", "Potato"] },
  },
  Odisha: {
    Bhubaneswar: { rainfall: "high", suitable: ["Rice", "Pulses"] },
    Cuttack: { rainfall: "high", suitable: ["Rice", "Sesame"] },
    Sambalpur: { rainfall: "medium", suitable: ["Cotton", "Paddy"] },
    Rourkela: {
      rainfall: "medium",
      suitable: ["Paddy", "Maize", "Groundnut", "Greengram", "Blackgram", "Millets", "Mustard"],
    },
  },
  Telangana: {
    Hyderabad: { rainfall: "low", suitable: ["Cotton", "Red Gram"] },
    Warangal: { rainfall: "medium", suitable: ["Rice", "Maize"] },
    Nizamabad: { rainfall: "medium", suitable: ["Turmeric", "Maize"] },
  },
  "Andhra Pradesh": {
    Vijayawada: { rainfall: "medium", suitable: ["Paddy", "Banana"] },
    Guntur: { rainfall: "low", suitable: ["Chilli", "Cotton"] },
    Visakhapatnam: { rainfall: "high", suitable: ["Coconut", "Cashew"] },
  },
  "Tamil Nadu": {
    Chennai: { rainfall: "low", suitable: ["Millets", "Groundnut"] },
    Coimbatore: { rainfall: "medium", suitable: ["Cotton", "Turmeric"] },
    Madurai: { rainfall: "low", suitable: ["Millets", "Pulses"] },
    Thanjavur: { rainfall: "high", suitable: ["Paddy"] },
  },
  Kerala: {
    Thiruvananthapuram: { rainfall: "high", suitable: ["Coconut", "Banana"] },
    Kozhikode: { rainfall: "high", suitable: ["Rubber", "Spices"] },
    Ernakulam: { rainfall: "high", suitable: ["Coconut", "Banana"] },
  },
  Punjab: {
    Ludhiana: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
    Amritsar: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
    Patiala: { rainfall: "medium", suitable: ["Rice", "Wheat"] },
  },
  Haryana: {
    Gurugram: { rainfall: "low", suitable: ["Bajra", "Mustard"] },
    Hisar: { rainfall: "low", suitable: ["Cotton", "Gram"] },
    Karnal: { rainfall: "medium", suitable: ["Wheat", "Rice"] },
  },
  Jharkhand: {
    Ranchi: { rainfall: "high", suitable: ["Rice", "Pulses"] },
    Dhanbad: { rainfall: "medium", suitable: ["Maize", "Paddy"] },
  },
  Chhattisgarh: {
    Raipur: { rainfall: "medium", suitable: ["Rice", "Maize"] },
    Bilaspur: { rainfall: "medium", suitable: ["Rice", "Soybean"] },
  },
  Assam: {
    Guwahati: { rainfall: "high", suitable: ["Rice", "Tea"] },
    Dibrugarh: { rainfall: "high", suitable: ["Tea", "Rice"] },
  },
  Uttarakhand: {
    Dehradun: { rainfall: "high", suitable: ["Basmati Rice", "Wheat"] },
    Nainital: { rainfall: "high", suitable: ["Fruits", "Vegetables"] },
  },
  "Himachal Pradesh": {
    Shimla: { rainfall: "high", suitable: ["Apples", "Peas"] },
    Mandi: { rainfall: "high", suitable: ["Vegetables", "Maize"] },
  },
  "Jammu & Kashmir": {
    Srinagar: { rainfall: "high", suitable: ["Apples", "Saffron"] },
    Jammu: { rainfall: "medium", suitable: ["Wheat", "Paddy"] },
  },
  Goa: {
    "North Goa": { rainfall: "high", suitable: ["Coconut", "Cashew"] },
    "South Goa": { rainfall: "high", suitable: ["Rice", "Spices"] },
  },
  Delhi: {
    "New Delhi": { rainfall: "low", suitable: ["Vegetables", "Mustard"] },
  },
  Tripura: {
    Agartala: { rainfall: "high", suitable: ["Pineapple", "Rice"] },
  },
  Meghalaya: {
    Shillong: { rainfall: "high", suitable: ["Potato", "Turmeric"] },
  },
  Manipur: {
    Imphal: { rainfall: "high", suitable: ["Rice", "Pulses"] },
  },
  Mizoram: {
    Aizawl: { rainfall: "high", suitable: ["Ginger", "Turmeric"] },
  },
  Nagaland: {
    Kohima: { rainfall: "high", suitable: ["Rice", "Maize"] },
  },
  "Arunachal Pradesh": {
    Itanagar: { rainfall: "high", suitable: ["Rice", "Millets"] },
  },
  Sikkim: {
    Gangtok: { rainfall: "high", suitable: ["Cardamom", "Vegetables"] },
  },
  "Andaman & Nicobar": {
    "Port Blair": { rainfall: "high", suitable: ["Coconut", "Spices"] },
  },
  Lakshadweep: {
    Kavaratti: { rainfall: "high", suitable: ["Coconut"] },
  },
};

export default REGION_META;