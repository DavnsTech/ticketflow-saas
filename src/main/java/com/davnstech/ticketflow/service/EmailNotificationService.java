package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.Ticket;
import com.davnstech.ticketflow.domain.TicketComment;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final boolean enabled;
    private final String fromAddress;

    public EmailNotificationService(
            JavaMailSender mailSender,
            TemplateEngine templateEngine,
            @Value("${ticketflow.email.enabled}") boolean enabled,
            @Value("${ticketflow.email.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.enabled = enabled;
        this.fromAddress = fromAddress;
    }

    @Async
    public void notifyTicketCreated(Ticket ticket) {
        if (!enabled) return;

        Context context = new Context();
        context.setVariable("ticket", ticket);
        String body = templateEngine.process("ticket-created", context);
        sendEmail(ticket.getRequester().getEmail(), "Ticket #" + ticket.getId() + " created", body);
    }

    @Async
    public void notifyTicketAssigned(Ticket ticket) {
        if (!enabled || ticket.getAssignee() == null) return;

        Context context = new Context();
        context.setVariable("ticket", ticket);
        String body = templateEngine.process("ticket-assigned", context);
        sendEmail(ticket.getAssignee().getEmail(), "Ticket #" + ticket.getId() + " assigned to you", body);
    }

    @Async
    public void notifyNewComment(TicketComment comment) {
        if (!enabled || comment.isInternal()) return;

        Context context = new Context();
        context.setVariable("comment", comment);
        context.setVariable("ticket", comment.getTicket());
        String recipient = comment.getTicket().getRequester().getEmail();
        String body = templateEngine.process("ticket-commented", context);
        sendEmail(recipient, "New comment on ticket #" + comment.getTicket().getId(), body);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);
        } catch (MessagingException exception) {
            log.error("Failed to send email to {}: {}", to, exception.getMessage());
        }
    }
}
