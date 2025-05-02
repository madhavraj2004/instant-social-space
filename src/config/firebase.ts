
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBaA68ctelFJ7Hi5MXMVqktTKMVdpMSMpI",
  authDomain: "gossip-e2228.firebaseapp.com",
  projectId: "gossip-e2228",
  storageBucket: "gossip-e2228.firebasestorage.app",
  messagingSenderId: "800189571414",
  appId: "1:800189571414:web:c936fb2a719b1a4cf336f7",
  measurementId: "G-ZLKCRE6GHL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
export default app;
