package com.davnstech.ticketflow.controller;

import com.davnstech.ticketflow.dto.*;
import com.davnstech.ticketflow.service.CategoryService;
import com.davnstech.ticketflow.service.CustomFieldService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class CategoryController {

    private final CategoryService categoryService;
    private final CustomFieldService customFieldService;

    public CategoryController(CategoryService categoryService, CustomFieldService customFieldService) {
        this.categoryService = categoryService;
        this.customFieldService = customFieldService;
    }

    @GetMapping("/api/categories")
    public ResponseEntity<List<CategoryResponse>> listActive() {
        return ResponseEntity.ok(categoryService.listActive());
    }

    @GetMapping("/api/categories/{categoryId}/fields")
    public ResponseEntity<List<CustomFieldResponse>> listActiveFields(@PathVariable Long categoryId) {
        return ResponseEntity.ok(customFieldService.listByCategory(categoryId));
    }

    @GetMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryResponse>> listAll() {
        return ResponseEntity.ok(categoryService.listAll());
    }

    @PostMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    @PutMapping("/api/admin/categories/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long categoryId, @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(categoryId, request));
    }

    @PutMapping("/api/admin/categories/{categoryId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> toggleActive(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryService.toggleActive(categoryId));
    }

    @PutMapping("/api/admin/categories/{categoryId}/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setAgents(@PathVariable Long categoryId, @RequestBody Map<String, List<Long>> body) {
        List<Long> agentIds = body.get("agentIds");
        if (agentIds == null) {
            throw new IllegalArgumentException("agentIds is required");
        }
        categoryService.setAgents(categoryId, agentIds);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/admin/categories/{categoryId}/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomFieldResponse>> listAllFields(@PathVariable Long categoryId) {
        return ResponseEntity.ok(customFieldService.listAllByCategory(categoryId));
    }

    @PostMapping("/api/admin/categories/{categoryId}/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomFieldResponse> createField(@PathVariable Long categoryId, @Valid @RequestBody CreateCustomFieldRequest request) {
        return ResponseEntity.ok(customFieldService.create(categoryId, request));
    }

    @PutMapping("/api/admin/custom-fields/{fieldId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomFieldResponse> updateField(@PathVariable Long fieldId, @Valid @RequestBody CreateCustomFieldRequest request) {
        return ResponseEntity.ok(customFieldService.update(fieldId, request));
    }

    @PutMapping("/api/admin/custom-fields/{fieldId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomFieldResponse> toggleFieldActive(@PathVariable Long fieldId) {
        return ResponseEntity.ok(customFieldService.toggleActive(fieldId));
    }

    @DeleteMapping("/api/admin/custom-fields/{fieldId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteField(@PathVariable Long fieldId) {
        customFieldService.delete(fieldId);
        return ResponseEntity.noContent().build();
    }
}
