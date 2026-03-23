package com.davnstech.ticketflow.repository;

import com.davnstech.ticketflow.domain.TicketCustomValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCustomValueRepository extends JpaRepository<TicketCustomValue, Long> {

    List<TicketCustomValue> findByTicketId(Long ticketId);

    void deleteByTicketId(Long ticketId);
}
