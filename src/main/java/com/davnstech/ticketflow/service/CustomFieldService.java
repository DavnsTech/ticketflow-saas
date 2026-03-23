package com.davnstech.ticketflow.service;

import com.davnstech.ticketflow.domain.Category;
import com.davnstech.ticketflow.domain.CustomField;
import com.davnstech.ticketflow.dto.CreateCustomFieldRequest;
import com.davnstech.ticketflow.dto.CustomFieldResponse;
import com.davnstech.ticketflow.repository.CategoryRepository;
import com.davnstech.ticketflow.repository.CustomFieldRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomFieldService {

    private final CustomFieldRepository customFieldRepository;
    private final CategoryRepository categoryRepository;

    public CustomFieldService(CustomFieldRepository customFieldRepository, CategoryRepository categoryRepository) {
        this.customFieldRepository = customFieldRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomFieldResponse> listByCategory(Long categoryId) {
        return customFieldRepository.findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(categoryId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CustomFieldResponse> listAllByCategory(Long categoryId) {
        return customFieldRepository.findByCategoryIdOrderByDisplayOrderAsc(categoryId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public CustomFieldResponse create(Long categoryId, CreateCustomFieldRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        int maxOrder = customFieldRepository.findByCategoryIdOrderByDisplayOrderAsc(categoryId)
                .stream().mapToInt(CustomField::getDisplayOrder).max().orElse(0);

        CustomField field = new CustomField();
        field.setCategory(category);
        field.setName(request.name());
        field.setLabel(request.label());
        field.setFieldType(request.fieldType() != null ? request.fieldType() : "TEXT");
        field.setRequired(request.required());
        field.setOptions(request.options());
        field.setPlaceholder(request.placeholder());
        field.setDisplayOrder(maxOrder + 1);

        CustomField saved = customFieldRepository.save(field);
        return toResponse(saved);
    }

    @Transactional
    public CustomFieldResponse update(Long fieldId, CreateCustomFieldRequest request) {
        CustomField field = customFieldRepository.findById(fieldId)
                .orElseThrow(() -> new IllegalArgumentException("Custom field not found"));

        field.setName(request.name());
        field.setLabel(request.label());
        if (request.fieldType() != null) field.setFieldType(request.fieldType());
        field.setRequired(request.required());
        field.setOptions(request.options());
        field.setPlaceholder(request.placeholder());

        CustomField saved = customFieldRepository.save(field);
        return toResponse(saved);
    }

    @Transactional
    public CustomFieldResponse toggleActive(Long fieldId) {
        CustomField field = customFieldRepository.findById(fieldId)
                .orElseThrow(() -> new IllegalArgumentException("Custom field not found"));

        field.setActive(!field.isActive());
        CustomField saved = customFieldRepository.save(field);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long fieldId) {
        if (!customFieldRepository.existsById(fieldId)) {
            throw new IllegalArgumentException("Custom field not found");
        }
        customFieldRepository.deleteById(fieldId);
    }

    private CustomFieldResponse toResponse(CustomField field) {
        return new CustomFieldResponse(
                field.getId(), field.getCategory().getId(),
                field.getName(), field.getLabel(),
                field.getFieldType(), field.isRequired(),
                field.getOptions(), field.getPlaceholder(),
                field.getDisplayOrder(), field.isActive());
    }
}
