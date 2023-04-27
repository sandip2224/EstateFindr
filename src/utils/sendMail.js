import emailjs from 'emailjs-com';
import { toast } from 'react-toastify'

export const sendEmail = (message, landlord, listingName, from_name) => {
  const templateParams = {
    message,
    landlordName: landlord?.name,
    landlordEmail: landlord?.email,
    listingName,
    from_name
  };

  console.log(templateParams)

  emailjs
    .send(
      'service_3bw0x8s',
      'template_v5dv0ny',
      templateParams,
      'O8_S6VYM5BxqG9iHy'
    )
    .then(
      function (response) {
        console.log('Message sent successfully!')
        toast.success('Message sent successfully!');
      },
      function (error) {
        console.log(error);
        toast.error('Failed to send message.');
      }
    );
}