// First install EmailJS using:
// npm install @emailjs/browser
// or
// yarn add @emailjs/browser

import emailjs from '@emailjs/browser';

// Initialize EmailJS in your main app file (e.g., App.js or index.js)
emailjs.init("hfx--3KcbLgX-EWIv"); // Replace with your actual EmailJS public key

// Create a utility function for sending emails
export const sendEmail = async (responseData, userEmail) => {
  try {
    const response = await emailjs.send(
      "service_i3t8r4m", // Replace with your EmailJS service ID
      "template_e254j4c", // Replace with your EmailJS template ID
      {
        to_email: userEmail,
        response_data: JSON.stringify(responseData, null, 2),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      }
    );
    
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, message: "Failed to send email. Please try again." };
  }
};