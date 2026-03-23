package com.davnstech.ticketflow.repository;

import com.davnstech.ticketflow.domain.Ticket;
import com.davnstech.ticketflow.domain.TicketPriority;
import com.davnstech.ticketflow.domain.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByAssigneeId(Long assigneeId, Pageable pageable);

    Page<Ticket> findByRequesterId(Long requesterId, Pageable pageable);

    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByAssigneeId(Long assigneeId);

    long countByAssigneeIdAndStatus(Long assigneeId, TicketStatus status);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.resolvedAt >= :since")
    long countResolvedSince(@Param("since") LocalDateTime since);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) FROM tickets WHERE resolved_at IS NOT NULL", nativeQuery = true)
    Double averageResolutionTimeSeconds();

    @Query("""
        SELECT t FROM Ticket t
        JOIN FETCH t.requester
        LEFT JOIN FETCH t.assignee
        LEFT JOIN FETCH t.categoryEntity
        WHERE (:status IS NULL OR t.status = :status)
        AND (:priority IS NULL OR t.priority = :priority)
        AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
        AND (:requesterId IS NULL OR t.requester.id = :requesterId)
        AND (:categoryId IS NULL OR t.categoryEntity.id = :categoryId)
        AND (:agentCategoryIds IS NULL OR t.categoryEntity.id IN :agentCategoryIds)
    """)
    Page<Ticket> findWithFilters(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("assigneeId") Long assigneeId,
            @Param("requesterId") Long requesterId,
            @Param("categoryId") Long categoryId,
            @Param("agentCategoryIds") List<Long> agentCategoryIds,
            Pageable pageable);
}
