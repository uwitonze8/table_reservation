package com.quicktable.backend.controller;

import com.quicktable.backend.dto.common.ApiResponse;
import com.quicktable.backend.dto.menu.*;
import com.quicktable.backend.entity.MenuItemType;
import com.quicktable.backend.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    // Public endpoints for customers

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAvailableMenuItems() {
        List<MenuItemDTO> items = menuItemService.getAvailableMenuItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/drinks")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAvailableDrinks() {
        List<MenuItemDTO> items = menuItemService.getAvailableMenuItemsByType(MenuItemType.DRINK);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/food")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAvailableFood() {
        List<MenuItemDTO> items = menuItemService.getAvailableMenuItemsByType(MenuItemType.FOOD);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/drinks/grouped")
    public ResponseEntity<ApiResponse<Map<String, List<MenuItemDTO>>>> getDrinksGroupedByCategory() {
        Map<String, List<MenuItemDTO>> items = menuItemService.getMenuItemsGroupedByCategory(MenuItemType.DRINK);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/food/grouped")
    public ResponseEntity<ApiResponse<Map<String, List<MenuItemDTO>>>> getFoodGroupedByCategory() {
        Map<String, List<MenuItemDTO>> items = menuItemService.getMenuItemsGroupedByCategory(MenuItemType.FOOD);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/categories/drinks")
    public ResponseEntity<ApiResponse<List<String>>> getDrinkCategories() {
        List<String> categories = menuItemService.getCategoriesByType(MenuItemType.DRINK);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/categories/food")
    public ResponseEntity<ApiResponse<List<String>>> getFoodCategories() {
        List<String> categories = menuItemService.getCategoriesByType(MenuItemType.FOOD);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    // Admin endpoints

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAllMenuItems() {
        List<MenuItemDTO> items = menuItemService.getAllMenuItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/admin/drinks")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAllDrinks() {
        List<MenuItemDTO> items = menuItemService.getMenuItemsByType(MenuItemType.DRINK);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/admin/food")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAllFood() {
        List<MenuItemDTO> items = menuItemService.getMenuItemsByType(MenuItemType.FOOD);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<MenuItemDTO>> getMenuItemById(@PathVariable Long id) {
        MenuItemDTO item = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemDTO>> createMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItemDTO item = menuItemService.createMenuItem(request);
        return ResponseEntity.ok(ApiResponse.success("Menu item created successfully", item));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemDTO>> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMenuItemRequest request) {
        MenuItemDTO item = menuItemService.updateMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", item));
    }

    @PatchMapping("/admin/{id}/toggle-availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemDTO>> toggleAvailability(@PathVariable Long id) {
        MenuItemDTO item = menuItemService.toggleAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Menu item availability toggled", item));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
    }
}
