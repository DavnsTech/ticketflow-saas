package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.Category;
import com.davnstech.ticketflow.dto.CategoryResponse;
import com.davnstech.ticketflow.dto.CreateCategoryRequest;
import com.davnstech.ticketflow.repository.CategoryRepository;
import com.davnstech.ticketflow.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        category.setColor(request.color() != null ? request.color() : "#6366f1");
        category.setIcon(request.icon());
        category.setDisplayOrder(findMaxDisplayOrder() + 1);

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long categoryId, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setName(request.name());
        category.setDescription(request.description());
        if (request.color() != null) category.setColor(request.color());
        category.setIcon(request.icon());

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse toggleActive(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setActive(!category.isActive());
        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<Long> getAgentIds(Long categoryId) {
        return jdbcTemplate.queryForList(
                "SELECT user_id FROM category_agents WHERE category_id = ?", Long.class, categoryId);
    }

    @Transactional
    public void setAgents(Long categoryId, List<Long> userIds) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        jdbcTemplate.update("DELETE FROM category_agents WHERE category_id = ?", categoryId);
        for (Long userId : userIds) {
            userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            jdbcTemplate.update("INSERT INTO category_agents (category_id, user_id) VALUES (?, ?)", categoryId, userId);
        }
    }

    @Transactional(readOnly = true)
    public List<Long> getCategoryIdsForAgent(Long userId) {
        return jdbcTemplate.queryForList(
                "SELECT category_id FROM category_agents WHERE user_id = ?", Long.class, userId);
    }

    private int findMaxDisplayOrder() {
        return categoryRepository.findAll().stream()
                .mapToInt(Category::getDisplayOrder)
                .max().orElse(0);
    }

    private CategoryResponse toResponse(Category category) {
        List<Long> agentIds = getAgentIds(category.getId());
        return new CategoryResponse(
                category.getId(), category.getName(), category.getDescription(),
                category.getColor(), category.getIcon(), category.isActive(),
                category.getDisplayOrder(), agentIds);
    }
}
