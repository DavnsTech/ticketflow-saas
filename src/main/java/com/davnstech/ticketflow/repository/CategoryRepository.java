package com.davnstech.ticketflow.repository;

import com.davnstech.ticketflow.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByActiveTrueOrderByDisplayOrderAsc();

    boolean existsByName(String name);
}
