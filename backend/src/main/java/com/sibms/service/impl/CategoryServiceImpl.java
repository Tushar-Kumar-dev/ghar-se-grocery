package com.sibms.service.impl;
import com.sibms.dto.request.CreateCategoryRequest;
import com.sibms.dto.request.UpdateCategoryRequest;
import com.sibms.dto.response.CategoryResponse;
import com.sibms.entity.Category;
import com.sibms.exception.BadRequestException;
import com.sibms.exception.DuplicateResourceException;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.CategoryRepository;
import com.sibms.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.name().trim()))
            throw new DuplicateResourceException("Category '" + request.name() + "' already exists");
        Category parent = null;
        if (request.parentId() != null) {
            parent = categoryRepository.findById(request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }
        Category saved = categoryRepository.save(Category.builder()
            .name(request.name().trim()).parent(parent).build());
        return CategoryResponse.from(saved);
    }

    @Override @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
    }

    @Override @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return CategoryResponse.from(find(id));
    }

    @Override @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {
        Category cat = find(id);
        if (!cat.getName().equals(request.name().trim()) && categoryRepository.existsByName(request.name().trim()))
            throw new DuplicateResourceException("Category '" + request.name() + "' already exists");
        Category parent = null;
        if (request.parentId() != null) {
            if (request.parentId().equals(id))
                throw new BadRequestException("Category cannot be its own parent");
            parent = categoryRepository.findById(request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }
        cat.setName(request.name().trim());
        cat.setParent(parent);
        cat.setActive(request.active());
        return CategoryResponse.from(cat);
    }

    @Override @Transactional
    public void delete(Long id) {
        Category cat = find(id);
        cat.setActive(false);
    }

    private Category find(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
    }
}
