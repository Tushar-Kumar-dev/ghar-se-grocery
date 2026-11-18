package com.sibms.service;
import com.sibms.dto.request.CreateCategoryRequest;
import com.sibms.dto.request.UpdateCategoryRequest;
import com.sibms.dto.response.CategoryResponse;
import java.util.List;
public interface CategoryService {
    CategoryResponse create(CreateCategoryRequest request);
    List<CategoryResponse> listAll();
    CategoryResponse getById(Long id);
    CategoryResponse update(Long id, UpdateCategoryRequest request);
    void delete(Long id);
}
