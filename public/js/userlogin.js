document.getElementById('signup-form').addEventListener('submit', (event) => {
    event.preventDefault();
   
    const phone = document.getElementById('phone').value;
   
    fetch('/signup', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ phone }),
    })
       .then((response) => response.json())
       .then((data) => {
         if (data.success) {
           document.getElementById('signup-form').style.display = 'none';
           document.getElementById('otp-section').style.display = 'block';
         } else {
           alert('Failed to send OTP. Please try again.');
         }
       })
       .catch((error) => {
         console.error('Error:', error);
         alert('Failed to send OTP. Please try again.');
       });
   });
   
   document.getElementById('verify-otp').addEventListener('click', (event) => {
    event.preventDefault();
   
    const phone = document.getElementById('phone').value;
    const otp = document.getElementById('otp').value;
   
    fetch('/verify-otp', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ phone, otp }),
    })
       .then((response) => response.json())
       .then((data) => {
         if (data.success) {
           alert('OTP verified successfully.');
         } else {
           alert('Failed to verify OTP. Please try again.');
         }
       })
       .catch((error) => {
         console.error('Error:', error);
         alert('Failed to verify OTP. Please try again.');
       });
   });