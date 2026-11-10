export type BookingWhatsAppDetails={name:string;email:string;phone:string;sessionType:string;service:string;date:string;timezone:string;message?:string};
/** A draft only: WhatsApp requires the visitor to review and send the message. */
export function bookingWhatsAppLink(number:string,details:BookingWhatsAppDetails){
 const phone=number.replace(/\D/g,'');
 if(!phone)return '';
 const message=[
  'Hello, I have submitted an appointment request through your website.',
  '',
  `Name: ${details.name}`,
  `Email: ${details.email}`,
  `Phone: ${details.phone}`,
  `Session: ${details.sessionType}`,
  `Support area: ${details.service}`,
  `Preferred date: ${details.date}`,
  `Timezone: ${details.timezone}`,
  ...(details.message?.trim()?['',`Message: ${details.message.trim()}`]:[]),
  '',
  'Please contact me to confirm availability. I understand this is a request, not a confirmed booking.',
 ].join('\n');
 return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
