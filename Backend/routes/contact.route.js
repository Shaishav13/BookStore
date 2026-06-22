import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  // basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"UB-Books Support" <${process.env.SMTP_MAIL}>`, 
      to: process.env.CONTACT_EMAIL || "support@ubbooks.com", 
      replyTo: email, 
      subject: `New message from ${name} - UB-Books Contact Form`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Form Message - UB-Books</h2>
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #007bff;">Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #007bff;">Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong style="color: #007bff;">Message:</strong></p>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            This message was sent from the UB-Books contact form.<br>
            Please reply directly to the customer's email: ${email}
          </p>
        </div>
      `
    });

    return res.status(200).json({
      message: "Message sent successfully",
    });

  } catch (err) {
    console.error("Email Error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
