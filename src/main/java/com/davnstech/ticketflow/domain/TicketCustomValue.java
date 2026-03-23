package com.davnstech.ticketflow.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "ticket_custom_values",
        uniqueConstraints = @UniqueConstraint(columnNames = {"ticket_id", "custom_field_id"}))
public class TicketCustomValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_field_id", nullable = false)
    private CustomField customField;

    @Column(columnDefinition = "TEXT")
    private String value;

    public Long getId() { return id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public CustomField getCustomField() { return customField; }
    public void setCustomField(CustomField customField) { this.customField = customField; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
