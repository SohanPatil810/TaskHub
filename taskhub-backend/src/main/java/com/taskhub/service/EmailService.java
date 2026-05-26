package com.taskhub.service;

public interface EmailService {
    void sendInvitationEmail(String toEmail, String orgName, String inviteUrl);
}
