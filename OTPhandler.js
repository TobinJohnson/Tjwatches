const nodemailer = require('nodemailer');
const randomstring = require('randomstring'); // For generating random OTP
const crypto = require('crypto');

// Function to generate a 4-digit numeric OTP



// const generateOTP = () => {
//   const otp = Math.floor(1000 + crypto.randomInt(9000)); // Generate a random number between 1000 and 9999
//   return otp.toString(); // Convert the number to a string
// };

// // Example: Generating a 4-digit OTP
// const OTP = generateOTP();
// console.log('Generated 4-digit OTP:', OTP);
// Function to send OTP to Email


const sendOTPEmail = (email, OTP) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tjwatches956@gmail.com',
      pass: 'tj8891766330',
    },
  });

  const mailOptions = {
    from: 'tjwatches956@gmail.com',
    to: email,
    subject: 'Your OTP for Verification',
    text: `Your OTP is: ${OTP}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
      // Redirect the user to the OTP verification page
      // You can handle this redirection based on your web framework (e.g., Express)
    }
  });
};

// Generate a random OTP
const otp = randomstring.generate({
  length: 6,
  charset: 'numeric',
});

// Use the sendOTPEmail function after successful signup
const userEmail = 'tobinjohnson92@gmail.com'; // Replace with the user's email
sendOTPEmail(userEmail, otp);