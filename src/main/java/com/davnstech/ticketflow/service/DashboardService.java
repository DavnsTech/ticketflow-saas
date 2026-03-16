package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.TicketPriority;
import com.davnstech.ticketflow.domain.TicketStatus;
import com.davnstech.ticketflow.domain.User;
import com.davnstech.ticketflow.domain.UserRole;
import com.davnstech.ticketflow.dto.AgentStats;
import com.davnstech.ticketflow.dto.DashboardStats;
import com.davnstech.ticketflow.dto.PriorityCount;
import com.davnstech.ticketflow.repository.TicketRepository;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public DashboardStats getStats() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long resolvedToday = ticketRepository.countResolvedSince(startOfDay);

        Double avgSeconds = ticketRepository.averageResolutionTimeSeconds();
        Double avgHours = avgSeconds != null ? avgSeconds / 3600.0 : null;

        return new DashboardStats(total, open, inProgress, resolvedToday, avgHours);
    }

    public List<PriorityCount> getByPriority() {
        return Arrays.stream(TicketPriority.values())
                .map(p -> new PriorityCount(p.name(), ticketRepository.countByPriority(p)))
                .toList();
    }

    public List<AgentStats> getByAgent() {
        List<User> agents = userRepository.findByRole(UserRole.AGENT);

        return agents.stream().map(agent -> {
            long totalAssigned = ticketRepository.countByAssigneeId(agent.getId());
            long resolved = ticketRepository.countByAssigneeIdAndStatus(agent.getId(), TicketStatus.RESOLVED)
                    + ticketRepository.countByAssigneeIdAndStatus(agent.getId(), TicketStatus.CLOSED);
            return new AgentStats(agent.getId(), agent.getDisplayName(), totalAssigned, resolved);
        }).toList();
    }
}
