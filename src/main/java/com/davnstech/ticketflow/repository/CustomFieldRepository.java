package com.davnstech.ticketflow.repository;

import com.davnstech.ticketflow.domain.CustomField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomFieldRepository extends JpaRepository<CustomField, Long> {

    List<CustomField> findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(Long categoryId);

    List<CustomField> findByCategoryIdOrderByDisplayOrderAsc(Long categoryId);
}
