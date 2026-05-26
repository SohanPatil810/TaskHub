package com.taskhub.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendInvitationEmail(String toEmail, String orgName, String inviteUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Invitation to join " + orgName + " on TaskHub");
        message.setText("Hello,\n\n" +
                "You have been invited to join the organization '" + orgName + "' on TaskHub.\n\n" +
                "Please click the link below to accept the invitation and join the team:\n" +
                inviteUrl + "\n\n" +
                "This invitation link will expire in 24 hours.\n\n" +
                "Best regards,\n" +
                "The TaskHub Team");
        mailSender.send(message);
    }
}
